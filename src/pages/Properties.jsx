import { useState, useRef } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, MapPin, Bed, Bath, Square, Home, AlertTriangle, Star, Flame, Shield, Calendar, Car, Compass, Camera, Trees, Sparkles, Image, Upload, Phone, Mail, Globe, Building2 } from 'lucide-react'
import { useData } from '../context/DataContext'

const ITEMS_PER_PAGE = 8

function Badge({ children, className }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}

export default function Properties() {
  const { properties, addProperty, updateProperty, deleteProperty, formatPriceIndian } = useData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [possessionFilter, setPossessionFilter] = useState('all')
  const [badgeFilter, setBadgeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showView, setShowView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title:'', location:'', price:'', beds:'', baths:'', sqft:'', type:'apartment', status:'sale',
    builder:'', reraId:'', possessionStatus:'Ready to Move', floor:'', furnishing:'Unfurnished',
    description:'', amenities:[], images:[],
    badge:'', openHouse:false, facing:'', parking:'', pricePerSqft:'', verified:false, floorPlan:'',
    agentPhone:'', agentEmail:'', developerLogo:'', developerWebsite:'',
  })
  const [imageUrlInput, setImageUrlInput] = useState('')

  const filtered = properties.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase()) && !p.builder.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (possessionFilter !== 'all' && p.possessionStatus !== possessionFilter) return false
    if (badgeFilter === 'featured' && p.badge !== 'featured') return false
    if (badgeFilter === 'hot' && p.badge !== 'hot') return false
    if (badgeFilter === 'none' && p.badge) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const resetForm = () => ({
    title:'', location:'', price:'', beds:'', baths:'', sqft:'', type:'apartment', status:'sale',
    builder:'', reraId:'', possessionStatus:'Ready to Move', floor:'', furnishing:'Unfurnished',
    description:'', amenities:[], images:[],
    badge:'', openHouse:false, facing:'', parking:'', pricePerSqft:'', verified:false, floorPlan:'',
    agentPhone:'', agentEmail:'', developerLogo:'', developerWebsite:'',
  })

  const openAdd = () => { setEditing(null); setForm(resetForm()); setImageUrlInput(''); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      title:p.title, location:p.location, price:p.price, beds:p.beds, baths:p.baths, sqft:p.sqft,
      type:p.type, status:p.status, builder:p.builder, reraId:p.reraId||'', possessionStatus:p.possessionStatus,
      floor:p.floor, furnishing:p.furnishing, description:p.description, amenities:[...(p.amenities||[])],
      images:[...(p.images||[])],
      badge:p.badge||'', openHouse:p.openHouse||false, facing:p.facing||'', parking:p.parking||'',
      pricePerSqft:p.pricePerSqft||'', verified:p.verified||false, floorPlan:p.floorPlan||'',
      agentPhone:p.agent?.phone||'', agentEmail:p.agent?.email||'',
      developerLogo:p.developerLogo||'', developerWebsite:p.developerWebsite||'',
    })
    setImageUrlInput('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.location || !form.price) return
    const now = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    const payload = {
      ...form,
      price: Number(form.price),
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
      pricePerSqft: form.pricePerSqft ? Number(form.pricePerSqft) : null,
      featured: form.badge === 'featured',
      hot: form.badge === 'hot',
      images: form.images || [],
    }
    if (editing) {
      await updateProperty(editing, {
        ...payload,
        updatedDate: now,
        agent: { phone: form.agentPhone, email: form.agentEmail },
        developerLogo: form.developerLogo,
        developerWebsite: form.developerWebsite,
      })
    } else {
      await addProperty({
        ...payload,
        views: 0,
        agent: { id: 'admin', name: 'Admin', avatar: 'https://i.pravatar.cc/150?img=1', rating: 4.5, sales: 10, phone: form.agentPhone || '+91-9999999999', email: form.agentEmail || 'admin@propertyinsta.com' },
        neighborhood: {},
        comments: 0, shares: 0, postDate: 'Just now', lat: 0, lng: 0, emiEstimate: 0, bankOffers: false,
        developerLogo: form.developerLogo,
        developerWebsite: form.developerWebsite,
      })
    }
    setShowModal(false)
  }

  const addImageUrl = () => {
    const url = imageUrlInput.trim()
    if (url && !form.images.includes(url)) {
      setForm(f => ({ ...f, images: [...f.images, url] }))
      setImageUrlInput('')
    }
  }

  const removeImageUrl = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  const handleDelete = async () => {
    await deleteProperty(showDelete)
    setShowDelete(null)
  }

  const toggleAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  const amenityOptions = ['pool','gym','parking','garden','security','smartHome']

  const badgeColors = { featured: 'badge-blue', hot: 'badge-red' }
  const badgeIcons = { featured: <Star className="w-3 h-3" />, hot: <Flame className="w-3 h-3" /> }
  const badgeLabels = { featured: 'Featured', hot: 'Hot Deal' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage {properties.length} property listings</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Property</button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search properties..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="input-field pl-10" />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="input-field w-auto">
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="cottage">Cottage</option>
            <option value="studio">Studio</option>
            <option value="penthouse">Penthouse</option>
            <option value="farmhouse">Farmhouse</option>
            <option value="commercial">Commercial</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-auto">
            <option value="all">All Status</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select value={possessionFilter} onChange={e => { setPossessionFilter(e.target.value); setPage(1) }} className="input-field w-auto">
            <option value="all">All Possession</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
          </select>
          <select value={badgeFilter} onChange={e => { setBadgeFilter(e.target.value); setPage(1) }} className="input-field w-auto">
            <option value="all">All Badges</option>
            <option value="featured">⭐ Featured</option>
            <option value="hot">🔥 Hot Deal</option>
            <option value="none">No Badge</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Property</th>
                <th className="table-header">Location</th>
                <th className="table-header">Price</th>
                <th className="table-header">Beds</th>
                <th className="table-header">Area</th>
                <th className="table-header">Type</th>
                <th className="table-header">Badge</th>
                <th className="table-header">Status</th>
                <th className="table-header">RERA</th>
                <th className="table-header">Views</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=60&h=60&fit=crop'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.builder}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-gray-600">{p.location}</td>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm font-medium text-primary-600">{formatPriceIndian(p.price)}</p>
                      {p.pricePerSqft && <p className="text-xs text-gray-400">₹{p.pricePerSqft}/sqft</p>}
                    </div>
                  </td>
                  <td className="table-cell text-sm text-gray-600">{p.beds}</td>
                  <td className="table-cell text-sm text-gray-600">{p.sqft} sqft</td>
                  <td className="table-cell text-sm text-gray-600 capitalize">{p.type}</td>
                  <td className="table-cell">
                    {p.badge && badgeIcons[p.badge] ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[p.badge]}`}>
                        {badgeIcons[p.badge]}{badgeLabels[p.badge]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge className={p.status === 'sale' ? 'badge-green' : 'badge-yellow'}>{p.status === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
                      <Badge className={p.possessionStatus === 'Ready to Move' ? 'badge-blue' : 'badge-red'}>{p.possessionStatus}</Badge>
                    </div>
                  </td>
                  <td className="table-cell">
                    {p.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600"><Shield className="w-3 h-3" />Verified</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="table-cell text-sm text-gray-500">{(p.views/1000).toFixed(1)}K</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowView(p)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-gray-100 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setShowDelete(p.id)} className="p-1.5 rounded-md hover:bg-gray-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} properties</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(i => (
              <button key={i} onClick={() => setPage(i)} className={`px-3 py-1.5 text-sm border rounded-lg ${page===i?'bg-primary-600 text-white border-primary-600':'hover:bg-gray-50'}`}>{i}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Property' : 'Add New Property'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Home className="w-4 h-4" />Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Property title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="Location" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="2500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Sqft (₹)</label>
                    <input type="number" value={form.pricePerSqft} onChange={e => setForm({...form, pricePerSqft: e.target.value})} className="input-field" placeholder="8500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="cottage">Cottage</option>
                      <option value="studio">Studio</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="farmhouse">Farmhouse</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                    <input type="number" value={form.beds} onChange={e => setForm({...form, beds: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Baths</label>
                    <input type="number" value={form.baths} onChange={e => setForm({...form, baths: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sqft</label>
                    <input type="number" value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Builder</label>
                    <input type="text" value={form.builder} onChange={e => setForm({...form, builder: e.target.value})} className="input-field" placeholder="Builder name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RERA ID</label>
                    <input type="text" value={form.reraId} onChange={e => setForm({...form, reraId: e.target.value})} className="input-field" placeholder="KA/RERA/2024/XXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Possession Status</label>
                    <select value={form.possessionStatus} onChange={e => setForm({...form, possessionStatus: e.target.value})} className="input-field">
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <input type="text" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} className="input-field" placeholder="12th of 25 floors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                    <select value={form.furnishing} onChange={e => setForm({...form, furnishing: e.target.value})} className="input-field">
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Images - URL + Local Upload */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Image className="w-4 h-4" />Property Images</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addImageUrl())}
                    className="input-field flex-1 min-w-[200px]"
                    placeholder="Paste image URL..."
                  />
                  <button onClick={addImageUrl} className="btn-primary flex items-center gap-1"><Plus className="w-4 h-4" />Add URL</button>
                  <label className="btn-secondary flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4" />Upload from PC
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => {
                          const reader = new FileReader()
                          reader.onload = () => {
                            setForm(f => ({ ...f, images: [...f.images, reader.result] }))
                          }
                          reader.readAsDataURL(file)
                        })
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
                {form.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                        <button onClick={() => removeImageUrl(i)} className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        <span className="text-xs text-gray-400 truncate block mt-0.5">{i+1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-3 border-2 border-dashed border-gray-200 rounded-lg text-center">No images added. Paste URLs or upload from your computer.</p>
                )}
              </div>

              {/* Enriched Fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" />Enriched Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                    <select value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} className="input-field">
                      <option value="">None</option>
                      <option value="featured">⭐ Featured</option>
                      <option value="hot">🔥 Hot Deal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                    <select value={form.facing} onChange={e => setForm({...form, facing: e.target.value})} className="input-field">
                      <option value="">Not Set</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="South-West">South-West</option>
                      <option value="Sea Facing">Sea Facing</option>
                      <option value="Garden Facing">Garden Facing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                    <select value={form.parking} onChange={e => setForm({...form, parking: e.target.value})} className="input-field">
                      <option value="">Not Set</option>
                      <option value="None">None</option>
                      <option value="1 Covered">1 Covered</option>
                      <option value="2 Covered">2 Covered</option>
                      <option value="3+ Covered">3+ Covered</option>
                      <option value="Open Parking">Open Parking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Plan URL</label>
                    <input type="text" value={form.floorPlan} onChange={e => setForm({...form, floorPlan: e.target.value})} className="input-field" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.openHouse}
                      onChange={e => setForm({...form, openHouse: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1"><Calendar className="w-4 h-4" />Open House Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.verified}
                      onChange={e => setForm({...form, verified: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1"><Shield className="w-4 h-4" />RERA Verified</span>
                  </label>
                </div>
              </div>

              {/* Agent Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Phone className="w-4 h-4" />Agent Contact Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Phone</label>
                    <input type="text" value={form.agentPhone} onChange={e => setForm({...form, agentPhone: e.target.value})} className="input-field" placeholder="+91-9999999999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Email</label>
                    <input type="email" value={form.agentEmail} onChange={e => setForm({...form, agentEmail: e.target.value})} className="input-field" placeholder="agent@propertyinsta.com" />
                  </div>
                </div>
              </div>

              {/* Developer / Builder Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" />Developer / Builder Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Developer Logo URL</label>
                    <input type="text" value={form.developerLogo} onChange={e => setForm({...form, developerLogo: e.target.value})} className="input-field" placeholder="https://...logo.png" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Developer Website</label>
                    <input type="text" value={form.developerWebsite} onChange={e => setForm({...form, developerWebsite: e.target.value})} className="input-field" placeholder="https://www.developer.com" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Property description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(a => (
                    <button key={a} onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.amenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>{a.charAt(0).toUpperCase()+a.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Property'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img src={showView.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=300&fit=crop'} alt="" className="w-full h-56 object-cover rounded-t-xl" />
              <button onClick={() => setShowView(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"><X className="w-5 h-5" /></button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                {showView.badge === 'featured' && <Badge className="badge-blue"><Star className="w-3 h-3" /> Featured</Badge>}
                {showView.badge === 'hot' && <Badge className="badge-red"><Flame className="w-3 h-3" /> Hot Deal</Badge>}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{showView.title}</h2>
                  <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{showView.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{formatPriceIndian(showView.price)}</p>
                  {showView.pricePerSqft && <p className="text-sm text-gray-500">₹{showView.pricePerSqft}/sqft</p>}
                  <p className="text-sm text-gray-500">EMI: {formatPriceIndian(showView.emiEstimate)}/mo</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{showView.beds} Beds</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{showView.baths} Baths</span>
                <span className="flex items-center gap-1"><Square className="w-4 h-4" />{showView.sqft} sqft</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{showView.type}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="font-medium">{showView.status==='sale'?'For Sale':'For Rent'}</span></div>
                <div><span className="text-gray-500">Builder:</span> <span className="font-medium">{showView.builder}</span></div>
                <div><span className="text-gray-500">RERA:</span> <span className="font-medium">{showView.reraId}</span></div>
                <div><span className="text-gray-500">Possession:</span> <span className="font-medium">{showView.possessionStatus}</span></div>
                <div><span className="text-gray-500">Floor:</span> <span className="font-medium">{showView.floor}</span></div>
                <div><span className="text-gray-500">Furnishing:</span> <span className="font-medium">{showView.furnishing}</span></div>
                <div><span className="text-gray-500">Views:</span> <span className="font-medium">{(showView.views/1000).toFixed(1)}K</span></div>
                {showView.bankOffers !== undefined && <div><span className="text-gray-500">Bank Offers:</span> <span className="font-medium">{showView.bankOffers?'✅ Available':'❌ None'}</span></div>}
              </div>

              {/* Enriched View Fields */}
              {(showView.facing || showView.parking || showView.openHouse || showView.verified || showView.floorPlan) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-500" />Additional Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {showView.facing && <div><span className="text-gray-500">Facing:</span> <span className="font-medium flex items-center gap-1"><Compass className="w-3 h-3" />{showView.facing}</span></div>}
                    {showView.parking && <div><span className="text-gray-500">Parking:</span> <span className="font-medium flex items-center gap-1"><Car className="w-3 h-3" />{showView.parking}</span></div>}
                    {showView.openHouse && <div><span className="text-gray-500">Open House:</span> <span className="font-medium text-green-600 flex items-center gap-1"><Calendar className="w-3 h-3" />Available</span></div>}
                    {showView.verified && <div><span className="text-gray-500">RERA:</span> <span className="font-medium text-green-600 flex items-center gap-1"><Shield className="w-3 h-3" />Verified</span></div>}
                  </div>
                  {showView.floorPlan && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 block mb-1">Floor Plan:</span>
                      <a href={showView.floorPlan} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline flex items-center gap-1"><Camera className="w-3 h-3" />View Floor Plan</a>
                    </div>
                  )}
                </div>
              )}

              {/* Neighborhood */}
              {showView.neighborhood && Object.keys(showView.neighborhood).length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Trees className="w-4 h-4 text-green-500" />Neighborhood</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {showView.neighborhood.school && <div><span className="text-gray-500">School:</span> <span className="font-medium">{showView.neighborhood.school}</span></div>}
                    {showView.neighborhood.hospital && <div><span className="text-gray-500">Hospital:</span> <span className="font-medium">{showView.neighborhood.hospital}</span></div>}
                    {showView.neighborhood.mall && <div><span className="text-gray-500">Mall:</span> <span className="font-medium">{showView.neighborhood.mall}</span></div>}
                    {showView.neighborhood.metro && <div><span className="text-gray-500">Metro:</span> <span className="font-medium">{showView.neighborhood.metro}</span></div>}
                    {showView.neighborhood.airport && <div><span className="text-gray-500">Airport:</span> <span className="font-medium">{showView.neighborhood.airport}</span></div>}
                    {showView.neighborhood.park && <div><span className="text-gray-500">Park:</span> <span className="font-medium">{showView.neighborhood.park}</span></div>}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-sm text-gray-600">{showView.description}</p>
              </div>
              {showView.amenities?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {showView.amenities.map(a => <Badge key={a} className="badge-blue">{a}</Badge>)}
                  </div>
                </div>
              )}
              {showView.agent && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Agent</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={showView.agent.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{showView.agent.name}</p>
                      <p className="text-xs text-gray-500">⭐ {showView.agent.rating} · {showView.agent.sales} sales</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Property?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}