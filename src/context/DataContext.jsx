import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  allProperties as staticProperties,
  allReels as staticReels,
  propertyStories as staticStories,
  blogPosts as staticBlogs,
  agentsData as staticAgents,
  propertyReviews as staticReviews,
  quizQuestions as staticQuiz,
  dashboardStats as staticDashboardStats,
  revenueData,
  propertyTypeData,
  propertyStatusData,
  recentProperties as staticRecent,
  notifications as staticNotifications,
  siteConfig as staticSiteConfig,
  formatPriceIndian,
} from '../data/mockData';

// ============================================================================
// DB Mappers: snake_case (Supabase) → camelCase (Admin Panel)
// ============================================================================
function mapDBProperty(db) {
  return {
    id: db.id,
    title: db.title,
    location: db.location,
    price: db.price,
    beds: db.beds,
    baths: db.baths,
    sqft: db.sqft,
    // Normalize: DB stores "Penthouse"/"Apartment", UI expects lowercase
    type: db.type ? db.type.toLowerCase() : 'apartment',
    // Normalize: DB stores "For Sale"/"For Rent", UI expects "sale"/"rent"
    status: db.status === 'For Sale' ? 'sale' : db.status === 'For Rent' ? 'rent' : (db.status || 'sale').toLowerCase(),
    builder: db.builder,
    reraId: db.rera_id,
    possessionStatus: db.possession_status,
    floor: db.floor,
    furnishing: db.furnishing,
    emiEstimate: db.emi_estimate,
    bankOffers: db.bank_offers,
    images: db.images || [],
    amenities: db.amenities || [],
    featured: db.featured,
    hot: db.hot,
    badge: db.hot ? 'hot' : db.featured ? 'featured' : null,
    openHouse: db.open_house,
    facing: db.facing,
    parking: db.parking,
    pricePerSqft: db.price_per_sqft,
    verified: db.verified,
    views: db.views || 0,
    description: db.description,
    agent: {
      id: db.agent_id || `agent-${db.id}`,
      name: db.agent_name || 'Admin',
      avatar: db.agent_avatar || 'https://i.pravatar.cc/150?img=1',
      rating: db.agent_rating || 4.5,
      sales: db.agent_sales || 0,
      phone: db.agent_phone || '',
      email: db.agent_email || '',
    },
    postDate: db.post_date || 'Recently',
    comments: db.comments || 0,
    shares: db.shares || 0,
    lat: db.lat,
    lng: db.lng,
    neighborhood: db.neighborhood || {},
    floorPlan: db.floor_plan,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}

function mapDBReel(db) {
  return {
    id: db.id,
    propertyId: db.property_id,
    title: db.title,
    location: db.location,
    price: db.price,
    category: db.category,
    video: db.video,
    thumbnail: db.thumbnail,
    description: db.description,
    views: db.views || 0,
    likes: db.likes || 0,
    // DB stores possession status here; UI expects "Published"/"Draft". Default to "Published" for DB reels.
    status: (db.status === 'Published' || db.status === 'Draft') ? db.status : 'Published',
    duration: db.duration || '00:15',
    tags: db.tags || [],
    agentName: db.agent_name,
    builder: db.builder,
    reraId: db.rera_id,
    possessionDate: db.possession_date,
    sqft: db.sqft,
    furnishing: db.furnishing,
    floor: db.floor,
    emiEstimate: db.emi_estimate,
    bankOffers: db.bank_offers,
    created_at: db.created_at,
  };
}

// ============================================================================
// Merge helpers: Supabase data overrides static data by ID
// ============================================================================
function mergeWithStatic(supabaseItems, staticItems) {
  const dbIds = new Set(supabaseItems.map(p => p.id));
  const merged = [...supabaseItems];
  staticItems.forEach(sp => {
    if (!dbIds.has(sp.id)) merged.push(sp);
  });
  return merged;
}

// ============================================================================
// Context
// ============================================================================
const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Supabase availability flag
  const [dbReady, setDbReady] = useState(false);
  // Error state to surface Supabase issues to the UI
  const [dbError, setDbError] = useState(null);

  // ---- State: start with static data, upgrade to Supabase when available ----
  const [properties, setProperties] = useState(staticProperties);
  const [reels, setReels] = useState(staticReels);
  const [stories, setStories] = useState(staticStories);
  const [blogs, setBlogs] = useState(staticBlogs);
  const [agents, setAgents] = useState(staticAgents);
  const [reviews, setReviews] = useState(() => {
    const initial = {};
    Object.keys(staticReviews).forEach(k => {
      initial[k] = staticReviews[k].map(r => ({ ...r }));
    });
    return initial;
  });
  const [quiz, setQuiz] = useState(staticQuiz.map(q => ({
    ...q,
    options: q.options.map(o => ({ ...o })),
  })));

  // ---- Dashboard computed stats ----
  const dashboardStats = useMemo(() => ({
    totalProperties: properties.length,
    totalReels: reels.length,
    totalStories: stories.length,
    totalBlogs: blogs.length,
    totalAgents: agents.length,
    totalViews: properties.reduce((s, p) => s + (p.views || 0), 0),
    totalLikes: reels.reduce((s, r) => s + (r.likes || 0), 0),
    activeListings: properties.filter(p => p.status === 'sale' || p.status === 'rent').length,
    underConstruction: properties.filter(p => p.possessionStatus === 'Under Construction').length,
  }), [properties, reels, stories, blogs, agents]);

  const recentProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : 0;
      const idB = typeof b.id === 'number' ? b.id : 0;
      return idB - idA;
    }).slice(0, 5);
  }, [properties]);

  // Dashboard chart data (still static, Supabase doesn't have time-series yet)
  const dashRevenueData = revenueData;
  const dashPropertyTypeData = propertyTypeData;
  const dashPropertyStatusData = propertyStatusData;
  const dashNotifications = staticNotifications;
  const dashSiteConfig = staticSiteConfig;

  // ==========================================================================
  // Supabase Initial Fetch + Real-Time Subscription
  // ==========================================================================
  useEffect(() => {
    if (!supabase) return;

    let propertiesChannel;
    let reelsChannel;

    async function initSupabase() {
      // Fetch initial data from Supabase
      const [{ data: props, error: propsErr }, { data: supabaseReels, error: reelsErr }] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('reels').select('*').order('id', { ascending: false }),
      ]);

      if (!propsErr && props) {
        const mapped = props.map(mapDBProperty);
        setProperties(mergeWithStatic(mapped, staticProperties));
      }
      if (!reelsErr && supabaseReels) {
        const mapped = supabaseReels.map(mapDBReel);
        setReels(mapped.length > 0 ? mapped : staticReels);
      }

      setDbReady(true);

      // Subscribe to real-time changes on properties
      propertiesChannel = supabase
        .channel('admin-properties-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'properties' },
          (payload) => {
            setProperties(prev => {
              const updated = [...prev];
              if (payload.eventType === 'INSERT') {
                updated.unshift(mapDBProperty(payload.new));
              } else if (payload.eventType === 'UPDATE') {
                const idx = updated.findIndex(p => p.id === payload.new.id);
                if (idx !== -1) updated[idx] = mapDBProperty(payload.new);
              } else if (payload.eventType === 'DELETE') {
                const idx = updated.findIndex(p => p.id === payload.old.id);
                if (idx !== -1) updated.splice(idx, 1);
              }
              return mergeWithStatic(updated, staticProperties);
            });
          }
        )
        .subscribe();

      // Subscribe to real-time changes on reels
      reelsChannel = supabase
        .channel('admin-reels-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reels' },
          (payload) => {
            setReels(prev => {
              const updated = [...prev];
              if (payload.eventType === 'INSERT') {
                updated.unshift(mapDBReel(payload.new));
              } else if (payload.eventType === 'UPDATE') {
                const idx = updated.findIndex(r => r.id === payload.new.id);
                if (idx !== -1) updated[idx] = mapDBReel(payload.new);
              } else if (payload.eventType === 'DELETE') {
                const idx = updated.findIndex(r => r.id === payload.old.id);
                if (idx !== -1) updated.splice(idx, 1);
              }
              return updated;
            });
          }
        )
        .subscribe();
    }

    initSupabase();

    return () => {
      if (propertiesChannel) supabase.removeChannel(propertiesChannel);
      if (reelsChannel) supabase.removeChannel(reelsChannel);
    };
  }, []);

  // ==========================================================================
  // CRUD: Properties (Supabase-aware)
  // ==========================================================================
  const addProperty = useCallback(async (property) => {
    if (supabase) {
      try {
        // Normalize status for DB: internal "sale"/"rent" → DB "For Sale"/"For Rent"
        const dbStatus = property.status === 'sale' ? 'For Sale'
          : property.status === 'rent' ? 'For Rent'
          : property.status;
        const { data, error } = await supabase.from('properties').insert({
          title: property.title,
          location: property.location,
          price: property.price,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          type: property.type,
          status: dbStatus,
          builder: property.builder,
          rera_id: property.reraId,
          possession_status: property.possessionStatus,
          floor: property.floor,
          furnishing: property.furnishing,
          emi_estimate: property.emiEstimate,
          bank_offers: property.bankOffers,
          images: property.images || [],
          amenities: property.amenities || [],
          featured: property.featured,
          hot: property.hot,
          open_house: property.openHouse,
          facing: property.facing,
          parking: property.parking,
          price_per_sqft: property.pricePerSqft,
          verified: property.verified,
          views: property.views || 0,
          description: property.description,
          agent_id: property.agent?.id,
          agent_name: property.agent?.name,
          agent_avatar: property.agent?.avatar,
          agent_rating: property.agent?.rating,
          agent_sales: property.agent?.sales,
          agent_phone: property.agent?.phone,
          agent_email: property.agent?.email,
          post_date: property.postDate,
          lat: property.lat,
          lng: property.lng,
          neighborhood: property.neighborhood,
          floor_plan: property.floorPlan,
        }).select().single();
        if (error) throw error;
        setDbError(null); // clear any previous error on success
        return data;
      } catch (supabaseErr) {
        const msg = supabaseErr?.message || 'Unknown error';
        console.error('Supabase addProperty failed:', msg);
        // RLS / permission errors — suggest next steps
        if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission denied') || msg.includes('JWT')) {
          setDbError('Supabase RLS policy rejected the write. Make sure you are logged into Supabase (not just mock auth). Create a user in Supabase Auth dashboard with the same email/password, or disable RLS on the properties table.');
        } else {
          setDbError(`Supabase write error: ${msg}`);
        }
      }
    } else {
      setDbError('Supabase is not configured. Copy .env.example to .env and fill in your Supabase project values.');
    }
    // Fallback: local state update (no Supabase OR Supabase failed)
    const newId = Math.max(...properties.map(p => typeof p.id === 'number' ? p.id : 0), 0) + 1;
    const newProp = { ...property, id: newId };
    setProperties(prev => [newProp, ...prev]);
    return newProp;
  }, [properties, supabase]); // eslint-disable-line

  const updateProperty = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        // Convert camelCase updates to snake_case for Supabase columns,
        // and normalize status values for DB storage format
        const dbUpdates = {};
        const fieldMap = {
          reraId: 'rera_id', possessionStatus: 'possession_status', pricePerSqft: 'price_per_sqft',
          floorPlan: 'floor_plan', openHouse: 'open_house', bankOffers: 'bank_offers',
          emiEstimate: 'emi_estimate', postDate: 'post_date',
        };
        for (const [key, value] of Object.entries(updates)) {
          const dbKey = fieldMap[key] || key;
          // Normalize: internal "sale"/"rent" → DB "For Sale"/"For Rent"
          if (dbKey === 'status' && value === 'sale') dbUpdates[dbKey] = 'For Sale';
          else if (dbKey === 'status' && value === 'rent') dbUpdates[dbKey] = 'For Rent';
          else dbUpdates[dbKey] = value;
        }
        const { error } = await supabase.from('properties').update(dbUpdates).eq('id', id);
        if (error) throw error;
        setDbError(null); // clear any previous error on success
      } catch (supabaseErr) {
        const msg = supabaseErr?.message || 'Unknown error';
        console.error('Supabase updateProperty failed:', msg);
        if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission denied') || msg.includes('JWT')) {
          setDbError('Supabase RLS policy rejected the update. Ensure you are authenticated with Supabase, not just mock auth.');
        } else {
          setDbError(`Supabase update error: ${msg}`);
        }
      }
    }
    // Always update local state immediately for responsiveness
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [supabase]);

  const deleteProperty = useCallback(async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        setDbError(null); // clear any previous error on success
      } catch (supabaseErr) {
        const msg = supabaseErr?.message || 'Unknown error';
        console.error('Supabase deleteProperty failed:', msg);
        if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission denied') || msg.includes('JWT')) {
          setDbError('Supabase RLS policy rejected the delete. Ensure you are authenticated with Supabase, not just mock auth.');
        } else {
          setDbError(`Supabase delete error: ${msg}`);
        }
      }
    }
    setProperties(prev => prev.filter(p => p.id !== id));
  }, [supabase]);

  // ==========================================================================
  // CRUD: Reels (Supabase-aware)
  // ==========================================================================
  const addReel = useCallback(async (reel) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('reels').insert({
          property_id: reel.propertyId,
          title: reel.title,
          location: reel.location,
          price: reel.price,
          category: reel.category,
          video: reel.video,
          thumbnail: reel.thumbnail,
          description: reel.description,
          views: reel.views || 0,
          likes: reel.likes || 0,
          status: reel.status,
          duration: reel.duration,
          tags: reel.tags,
          agent_name: reel.agentName,
          builder: reel.builder,
          rera_id: reel.reraId,
          possession_date: reel.possessionDate,
          sqft: reel.sqft,
          furnishing: reel.furnishing,
          floor: reel.floor,
          emi_estimate: reel.emiEstimate,
          bank_offers: reel.bankOffers,
        }).select().single();
        if (error) throw error;
        return data;
      } catch (supabaseErr) {
        console.warn('Supabase addReel failed, using local fallback:', supabaseErr);
      }
    }
    // Fallback: local state update (no Supabase OR Supabase failed)
    const newId = Math.max(...reels.map(r => typeof r.id === 'number' ? r.id : 0), 100) + 1;
    const newReel = { ...reel, id: newId };
    setReels(prev => [newReel, ...prev]);
    return newReel;
  }, [reels, supabase]); // eslint-disable-line

  const updateReel = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        // Convert camelCase updates to snake_case for Supabase columns
        const dbUpdates = {};
        const fieldMap = {
          propertyId: 'property_id', agentName: 'agent_name', reraId: 'rera_id',
          possessionDate: 'possession_date', emiEstimate: 'emi_estimate', bankOffers: 'bank_offers',
        };
        for (const [key, value] of Object.entries(updates)) {
          dbUpdates[fieldMap[key] || key] = value;
        }
        const { error } = await supabase.from('reels').update(dbUpdates).eq('id', id);
        if (error) throw error;
      } catch (supabaseErr) {
        console.warn('Supabase updateReel failed, updating local state only:', supabaseErr);
      }
    }
    setReels(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [supabase]);

  const deleteReel = useCallback(async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('reels').delete().eq('id', id);
        if (error) throw error;
      } catch (supabaseErr) {
        console.warn('Supabase deleteReel failed, removing from local state only:', supabaseErr);
      }
    }
    setReels(prev => prev.filter(r => r.id !== id));
  }, [supabase]);

  // ==========================================================================
  // CRUD: Agents (local only for now)
  // ==========================================================================
  const addAgent = useCallback((agent) => {
    const newId = 'agent' + (Math.max(...agents.map(a => {
      const num = parseInt(String(a.id).replace('agent', ''));
      return isNaN(num) ? 0 : num;
    }), 0) + 1);
    setAgents(prev => [...prev, { id: newId, ...agent }]);
  }, [agents]);

  const updateAgent = useCallback((id, updates) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAgent = useCallback((id) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  // ==========================================================================
  // CRUD: Stories (local only)
  // ==========================================================================
  const addStory = useCallback((story) => {
    const newId = 's' + (Math.max(...stories.map(s => {
      const num = parseInt(String(s.id).replace('s', ''));
      return isNaN(num) ? 0 : num;
    }), 0) + 1);
    setStories(prev => [...prev, { id: newId, propertyId: null, ...story }]);
  }, [stories]);

  const updateStory = useCallback((id, updates) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStory = useCallback((id) => {
    setStories(prev => prev.filter(s => s.id !== id));
  }, []);

  // ==========================================================================
  // CRUD: Blogs (local only)
  // ==========================================================================
  const addBlog = useCallback((blog) => {
    const newId = Math.max(...blogs.map(b => b.id), 0) + 1;
    setBlogs(prev => [...prev, { id: newId, ...blog }]);
  }, [blogs]);

  const updateBlog = useCallback((id, updates) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBlog = useCallback((id) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
  }, []);

  // ==========================================================================
  // CRUD: Reviews (local only)
  // ==========================================================================
  const addReview = useCallback((review) => {
    const newReview = { id: Date.now(), ...review };
    setReviews(prev => {
      const next = { ...prev };
      const key = String(review.propertyId);
      if (!next[key]) next[key] = [];
      next[key] = [...next[key], newReview];
      return next;
    });
  }, []);

  const updateReview = useCallback((reviewId, updates) => {
    setReviews(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = next[k].map(r => r.id === reviewId ? { ...r, ...updates } : r);
      });
      return next;
    });
  }, []);

  const deleteReview = useCallback((reviewId) => {
    setReviews(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = next[k].filter(r => r.id !== reviewId);
        if (next[k].length === 0) delete next[k];
      });
      return next;
    });
  }, []);

  // ==========================================================================
  // CRUD: Quiz (local only)
  // ==========================================================================
  const addQuizQuestion = useCallback((question) => {
    setQuiz(prev => [...prev, { id: Date.now(), ...question }]);
  }, []);

  const updateQuizQuestion = useCallback((id, updates) => {
    setQuiz(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuizQuestion = useCallback((id) => {
    setQuiz(prev => prev.filter(q => q.id !== id));
  }, []);

  // ==========================================================================
  // Clear DB error
  // ==========================================================================
  const clearDbError = useCallback(() => setDbError(null), []);

  // ==========================================================================
  // Exposed context value
  // ==========================================================================
  const value = {
    // Data
    properties, reels, stories, blogs, agents, reviews, quiz,
    // Dashboard
    dashboardStats, dashRevenueData: revenueData,
    dashPropertyTypeData: propertyTypeData,
    dashPropertyStatusData: propertyStatusData,
    dashNotifications: staticNotifications,
    dashSiteConfig: staticSiteConfig,
    recentProperties,
    // Status
    dbReady, dbError, clearDbError,
    // Property CRUD
    addProperty, updateProperty, deleteProperty,
    // Reel CRUD
    addReel, updateReel, deleteReel,
    // Agent CRUD
    addAgent, updateAgent, deleteAgent,
    // Story CRUD
    addStory, updateStory, deleteStory,
    // Blog CRUD
    addBlog, updateBlog, deleteBlog,
    // Review CRUD
    addReview, updateReview, deleteReview,
    // Quiz CRUD
    addQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
    // Utility
    formatPriceIndian,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export default DataContext;