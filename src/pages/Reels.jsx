import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, Play, Heart, Clock, AlertTriangle, Video, ChevronDown, ChevronUp, Hash, Upload } from 'lucide-react'
import { useData } from '../context/DataContext'

const ITEMS_PER_PAGE = 8

const CATEGORIES = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { value: 'luxury', label: 'Luxury', color: 'bg-purple-100 text-purple-700' },
  { value: 'premium', label: 'Premium', color: 'bg-rose-100 text-rose-700' },
  { value: 'family', label: 'Family', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'budget', label: 'Budget', color: 'bg-amber-100 text-amber-700' },
  { value: 'commercial', label: 'Commercial', color: 'bg-blue-100 text-blue-700' },
]

function CategoryBadge({ category, className }) {
  const cat = CATEGORIES.find(c => c.value === category)
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cat?.color || 'bg-gray-100 text-gray-600'} ${className}`}>
      {category}
    </span>
  )
}

function StatBadge({ icon: Icon, value, className }) {
  return (
    <span className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {value}
    </span>
  )
}

export default function Reels() {
  const { reels, addReel, updateReel, deleteReel, formatPriceIndian } = useData()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showView, setShowView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showPropertyFields, setShowPropertyFields] = useState(false)
  const [form, setForm] = useState({
    title: '', location: '', price: '', category: 'luxury',
    video: '', thumbnail: '', description: '', status: 'Published',
    duration: '', tags: '', agentName: '',
    // Property-linked fields (collapsible)
    builder: '', reraId: '', sqft: '', furnishing: 'Unfurnished',
    floor: '', emiEstimate: '', bankOffers: false
  })

  const resetForm = () => ({
    title: '', location: '', price: '', category: 'luxury',
    video: '', thumbnail: '', description: '', status: 'Published',
    duration: '', tags: '', agentName: '',
    builder: '', reraId: '', sqft: '', furnishing: 'Unfurnished',
    floor: '', emiEstimate: '', bankOffers: false
  })

  const filtered = reels.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())
      && !r.location.toLowerCase().includes(search.toLowerCase())
      && !(r.tags || '').toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openAdd = () => {
    setEditing(null)
    setForm(resetForm())
    setShowPropertyFields(false)
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditing(r.id)
    setForm({
      title: r.title, location: r.location, price: r.price, category: r.category,
      video: r.video || '', thumbnail: r.thumbnail || '', description: r.description,
      status: r.status, duration: r.duration || '', tags: (r.tags || []).join(', '),
      agentName: r.agentName || '',
      builder: r.builder || '', reraId: r.reraId || '', sqft: r.sqft || '',
      furnishing: r.furnishing || 'Unfurnished', floor: r.floor || '',
      emiEstimate: r.emiEstimate || '', bankOffers: r.bankOffers || false
    })
    setShowPropertyFields(false)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.location || !form.video) return
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      sqft: Number(form.sqft) || 0,
      emiEstimate: Number(form.emiEstimate) || 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    if (editing) {
      await updateReel(editing, payload)
    } else {
      await addReel({ propertyId: null, ...payload, views: 0, likes: 0 })
    }
    setShowModal(false)
  }

  const handleDelete = async () => {
    await deleteReel(showDelete)
    setShowDelete(null)
  }

  const formatViews = (v) => {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
    return v
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Reels</h1>
          <p className="text-gray-500 mt-1">Manage short-form video content for property showcasing</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Video className="w-4 h-4" />Create Reel
        </button>
      </div>

      {/* Video Content Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reels', value: reels.length, icon: Video, color: 'text-purple-600 bg-purple-50' },
          { label: 'Published', value: reels.filter(r => r.status === 'Published').length, icon: Play, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Views', value: formatViews(reels.reduce((s, r) => s + (r.views || 0), 0)), icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Likes', value: formatViews(reels.reduce((s, r) => s + (r.likes || 0), 0)), icon: Heart, color: 'text-rose-600 bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search by title, location, or tags..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setCategoryFilter(cat.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                categoryFilter === cat.value
                  ? 'ring-2 ring-offset-1 ' + cat.color
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Grid — Vertical Video Cards */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-1">No reels found</h3>
          <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or create a new reel</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />Create Your First Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map(r => (
            <div key={r.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Thumbnail — portrait aspect ratio */}
              <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                <img
                  src={r.thumbnail}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-gray-900 ml-0.5 fill-gray-900" />
                  </div>
                </div>
                {/* Duration badge */}
                {r.duration && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />{r.duration}
                  </div>
                )}
                {/* Category + Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <CategoryBadge category={r.category} />
                  {r.status === 'Draft' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                      Draft
                    </span>
                  )}
                </div>
                {/* Engagement overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(r.views || 0)}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-red-400 text-red-400" />{r.likes || 0}</span>
                  {r.agentName && <span className="text-[10px] opacity-80">by {r.agentName}</span>}
                </div>
              </div>
              {/* Card body */}
              <div className="p-3.5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{r.title}</h3>
                <p className="text-xs text-gray-500 mb-2 truncate">{r.location}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary-600">{formatPriceIndian(r.price)}</span>
                </div>
                {/* Tags */}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {r.tags.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                    {r.tags.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{r.tags.length - 3}</span>
                    )}
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center gap-1 pt-2.5 border-t border-gray-100">
                  <button onClick={() => setShowView(r)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" />View
                  </button>
                  <button onClick={() => openEdit(r)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-blue-500 flex items-center justify-center gap-1">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => setShowDelete(r.id)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-red-500 flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} reels</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
              <button key={i} onClick={() => setPage(i)} className={`px-3 py-1.5 text-sm border rounded-lg ${page === i ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}>{i}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50"><Video className="w-5 h-5 text-purple-600" /></div>
                <h2 className="text-lg font-semibold">{editing ? 'Edit Reel' : 'Create New Reel'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* === VIDEO CONTENT SECTION === */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                  <Video className="w-4 h-4 text-purple-500" />Video Content
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Luxury Villa Tour" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Location *</label>
                    <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g. Whitefield, Bangalore" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="2500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                      <option value="luxury">Luxury</option>
                      <option value="premium">Premium</option>
                      <option value="family">Family</option>
                      <option value="budget">Budget</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field" placeholder="e.g. 0:45" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent / Creator</label>
                    <input type="text" value={form.agentName} onChange={e => setForm({ ...form, agentName: e.target.value })} className="input-field" placeholder="e.g. Sarah K." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="luxury, villa, pool (comma separated)" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video *</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.video} onChange={e => setForm({ ...form, video: e.target.value })} className="input-field flex-1" placeholder="Paste video URL or upload..." />
                      <label className="btn-secondary flex items-center gap-1 cursor-pointer whitespace-nowrap">
                        <Upload className="w-4 h-4" />Upload
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => setForm(f => ({ ...f, video: reader.result }))
                            reader.readAsDataURL(file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    {form.video && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {form.video.startsWith('data:') ? '📁 Local video file' : form.video}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} className="input-field flex-1" placeholder="Paste thumbnail URL or upload..." />
                      <label className="btn-secondary flex items-center gap-1 cursor-pointer whitespace-nowrap">
                        <Upload className="w-4 h-4" />Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => setForm(f => ({ ...f, thumbnail: reader.result }))
                            reader.readAsDataURL(file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    {form.thumbnail && (
                      <img src={form.thumbnail} alt="" className="mt-2 w-24 h-16 object-cover rounded-lg border" />
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} placeholder="Short engaging description..." />
                  </div>
                </div>
              </div>

              {/* === PROPERTY DETAILS (COLLAPSIBLE) === */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowPropertyFields(!showPropertyFields)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />Property Details (optional)
                  </span>
                  {showPropertyFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showPropertyFields && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Builder</label>
                      <input type="text" value={form.builder} onChange={e => setForm({ ...form, builder: e.target.value })} className="input-field" placeholder="Prestige Group" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RERA ID</label>
                      <input type="text" value={form.reraId} onChange={e => setForm({ ...form, reraId: e.target.value })} className="input-field" placeholder="KA/RERA/2024/1256" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sqft</label>
                      <input type="number" value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} className="input-field" placeholder="1200" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                      <select value={form.furnishing} onChange={e => setForm({ ...form, furnishing: e.target.value })} className="input-field">
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                      <input type="text" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="input-field" placeholder="12th of 25 floors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">EMI Estimate</label>
                      <input type="number" value={form.emiEstimate} onChange={e => setForm({ ...form, emiEstimate: e.target.value })} className="input-field" placeholder="19850" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" id="bankOffers" checked={form.bankOffers} onChange={e => setForm({ ...form, bankOffers: e.target.checked })} className="rounded" />
                      <label htmlFor="bankOffers" className="text-sm font-medium text-gray-700">Bank Offers Available</label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Create Reel'}</button>
            </div>
          </div>
        </div>
      )}
      {/* View Modal — Video Player Preview */} 
      {showView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="relative bg-black">
              <img src={showView.thumbnail} alt="" className="w-full aspect-[9/16] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <button onClick={() => setShowView(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white z-10">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                  <Play className="w-7 h-7 text-gray-900 ml-0.5 fill-gray-900" />
                </div>
              </div>
              {showView.duration && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />{showView.duration}
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{showView.title}</h2>
                    <p className="text-sm text-gray-500">{showView.location}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-600 whitespace-nowrap">{formatPriceIndian(showView.price)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge category={showView.category} />
                  {showView.status === 'Draft' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-700">Draft</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Published</span>
                  )}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 py-3 border-y">
                <StatBadge icon={Eye} value={`${formatViews(showView.views || 0)} views`} />
                <StatBadge icon={Heart} value={`${showView.likes || 0} likes`} />
                {showView.agentName && <StatBadge icon={Video} value={showView.agentName} />}
              </div>

              {/* Tags */}
              {showView.tags && showView.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {showView.tags.map((t, i) => (
                    <span key={i} className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">#{t}</span>
                  ))}
                </div>
              )}

              {/* Property details if present */}
              {(showView.builder || showView.reraId) && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {showView.builder && <div><span className="text-gray-400">Builder:</span> <span className="font-medium">{showView.builder}</span></div>}
                    {showView.reraId && <div><span className="text-gray-400">RERA:</span> <span className="font-medium">{showView.reraId}</span></div>}
                    {showView.sqft && <div><span className="text-gray-400">Area:</span> <span className="font-medium">{showView.sqft} sqft</span></div>}
                    {showView.furnishing && <div><span className="text-gray-400">Furnishing:</span> <span className="font-medium">{showView.furnishing}</span></div>}
                    {showView.floor && <div><span className="text-gray-400">Floor:</span> <span className="font-medium">{showView.floor}</span></div>}
                    {showView.emiEstimate > 0 && <div><span className="text-gray-400">EMI:</span> <span className="font-medium">{formatPriceIndian(showView.emiEstimate)}/mo</span></div>}
                    <div><span className="text-gray-400">Bank Offers:</span> <span className="font-medium">{showView.bankOffers ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">{showView.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Delete Reel?</h3>
            <p className="text-sm text-gray-500 mb-6">This reel will be permanently removed. This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete Reel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}