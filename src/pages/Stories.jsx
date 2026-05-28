import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, AlertTriangle, Image } from 'lucide-react'
import { useData } from '../context/DataContext'

const ITEMS_PER_PAGE = 8

export default function Stories() {
  const { stories, addStory, updateStory, deleteStory } = useData()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showView, setShowView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ image:'', label:'', agent:'' })

  const filtered = stories.filter(s => {
    if (search && !s.label.toLowerCase().includes(search.toLowerCase()) && !s.agent.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)

  const openAdd = () => { setEditing(null); setForm({ image:'', label:'', agent:'' }); setShowModal(true) }
  const openEdit = (s) => { setEditing(s.id); setForm({ image:s.image, label:s.label, agent:s.agent }); setShowModal(true) }

  const handleSave = () => {
    if (!form.image || !form.label || !form.agent) return
    if (editing) {
      updateStory(editing, form)
    } else {
      addStory(form)
    }
    setShowModal(false)
  }

  const handleDelete = () => { deleteStory(showDelete); setShowDelete(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Stories</h1>
          <p className="text-gray-500 mt-1">Manage {stories.length} property stories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>Add Story</button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="text" placeholder="Search stories by label or agent..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="input-field pl-10"/>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {paginated.map(s => (
          <div key={s.id} className="card overflow-hidden group">
            <div className="relative aspect-[3/4]">
              <img src={s.image} alt="" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-gray-300 text-xs">{s.agent}</p>
              </div>
            </div>
            <div className="p-3 flex items-center gap-1">
              <button onClick={()=>setShowView(s)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>View</button>
              <button onClick={()=>openEdit(s)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-blue-500 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3"/>Edit</button>
              <button onClick={()=>setShowDelete(s.id)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-red-500 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} stories</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(i=><button key={i} onClick={()=>setPage(i)} className={`px-3 py-1.5 text-sm border rounded-lg ${page===i?'bg-primary-600 text-white border-primary-600':'hover:bg-gray-50'}`}>{i}</button>)}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing?'Edit Story':'Add New Story'}</h2>
              <button onClick={()=>setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label><input type="text" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="input-field" placeholder="https://images.unsplash.com/..."/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Label *</label><input type="text" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} className="input-field" placeholder="Downtown"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Agent *</label><input type="text" value={form.agent} onChange={e=>setForm({...form,agent:e.target.value})} className="input-field" placeholder="Sarah K."/></div>
              {form.image && <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-lg" onError={e=>e.target.style.display='none'}/>}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing?'Save Changes':'Add Story'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="relative aspect-[3/4]">
              <img src={showView.image} alt="" className="w-full h-full object-cover"/>
              <button onClick={()=>setShowView(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"><X className="w-5 h-5"/></button>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">{showView.label}</p>
                <p className="text-gray-300">Agent: {showView.agent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold mb-2">Delete Story?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={()=>setShowDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}