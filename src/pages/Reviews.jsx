import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, X, Star, MessageSquare, Check, Shield, ShieldOff, Filter } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Reviews() {
  const { reviews, properties, addReview, updateReview, deleteReview } = useData()
  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ propertyId: '', userName: '', rating: 5, comment: '', verified: true, date: new Date().toISOString().split('T')[0] })

  // Flatten all reviews
  const allReviews = Object.entries(reviews).flatMap(([propId, revs]) =>
    revs.map(r => ({ ...r, propertyId: Number(propId) }))
  )

  const filtered = allReviews.filter(r => {
    const prop = properties.find(p => p.id === r.propertyId)
    const propTitle = prop?.title || ''
    if (search && !r.userName.toLowerCase().includes(search.toLowerCase()) && !r.comment.toLowerCase().includes(search.toLowerCase()) && !propTitle.toLowerCase().includes(search.toLowerCase())) return false
    if (propertyFilter !== 'all' && r.propertyId !== Number(propertyFilter)) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ propertyId: '', userName: '', rating: 5, comment: '', verified: true, date: new Date().toISOString().split('T')[0] })
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditing(r.id)
    setForm({ propertyId: String(r.propertyId), userName: r.userName, rating: r.rating, comment: r.comment, verified: r.verified, date: r.date })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.propertyId || !form.userName || !form.comment) return
    const propId = Number(form.propertyId)
    if (editing) {
      updateReview(editing, { ...form, propertyId: propId, rating: Number(form.rating) })
    } else {
      addReview({
        propertyId: propId,
        userName: form.userName,
        rating: Number(form.rating),
        comment: form.comment,
        verified: form.verified,
        date: form.date,
      })
    }
    setShowModal(false)
  }

  const handleDelete = () => { deleteReview(showDelete); setShowDelete(null) }

  const toggleVerified = (r) => { updateReview(r.id, { verified: !r.verified }) }

  const getPropertyTitle = (propId) => {
    const prop = properties.find(p => p.id === propId)
    return prop ? prop.title : `Property #${propId}`
  }

  const getPropertyPreview = (propId) => {
    const prop = properties.find(p => p.id === propId)
    return prop?.images?.[0] || null
  }

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Reviews</h1>
          <p className="text-gray-500 mt-1">Manage {allReviews.length} reviews across {Object.keys(reviews).length} properties</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Review</button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All Properties</option>
            {Object.keys(reviews).map(pid => (
              <option key={pid} value={pid}>{getPropertyTitle(Number(pid))}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" />
            <p>No reviews found</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="flex gap-4 p-4 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                {r.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{r.userName}</span>
                  <span className="text-xs text-gray-400">on</span>
                  <span className="text-sm font-medium text-primary-600">{getPropertyTitle(r.propertyId)}</span>
                  {r.verified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full"><Shield className="w-3 h-3" />Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full"><ShieldOff className="w-3 h-3" />Unverified</span>
                  )}
                </div>
                <StarRating rating={r.rating} />
                <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{r.date}</p>
              </div>
              <div className="flex items-start gap-1">
                <button onClick={() => toggleVerified(r)} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400" title="Toggle verified">
                  {r.verified ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-gray-200 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setShowDelete(r.id)} className="p-1.5 rounded-md hover:bg-gray-200 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Review' : 'Add New Review'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })} className="input-field">
                  <option value="">Select property...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name *</label>
                <input type="text" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} className="input-field" placeholder="Reviewer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setForm({ ...form, rating: s })}>
                      <Star className={`w-8 h-8 ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} className="input-field" rows={3} placeholder="Review comment" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
                  <select value={form.verified ? 'yes' : 'no'} onChange={e => setForm({ ...form, verified: e.target.value === 'yes' })} className="input-field">
                    <option value="yes">Verified</option>
                    <option value="no">Unverified</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Review'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Review?</h3>
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