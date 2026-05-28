import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, AlertTriangle, Star, Phone, Mail } from 'lucide-react'
import { useData } from '../context/DataContext'

const ITEMS_PER_PAGE = 8

function Badge({ children, className }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}

export default function Agents() {
  const { agents, addAgent, updateAgent, deleteAgent } = useData()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showView, setShowView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', avatar:'', rating:'', sales:'', phone:'', email:'', company:'PropertyInsta Realty', experience:'', specialization:'' })

  const filtered = agents.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase()) && !a.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)

  const openAdd = () => { setEditing(null); setForm({ name:'', avatar:'', rating:'', sales:'', phone:'', email:'', company:'PropertyInsta Realty', experience:'', specialization:'' }); setShowModal(true) }
  const openEdit = (a) => { setEditing(a.id); setForm({ name:a.name, avatar:a.avatar, rating:a.rating, sales:a.sales, phone:a.phone, email:a.email, company:a.company, experience:a.experience, specialization:a.specialization.join(', ') }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name || !form.email || !form.phone) return
    const payload = { ...form, rating: Number(form.rating), sales: Number(form.sales), specialization: form.specialization.split(',').map(t => t.trim()).filter(Boolean) }
    if (editing) {
      updateAgent(editing, payload)
    } else {
      addAgent(payload)
    }
    setShowModal(false)
  }

  const handleDelete = () => { deleteAgent(showDelete); setShowDelete(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">Manage {agents.length} real estate agents</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>Add Agent</button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="text" placeholder="Search agents..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="input-field pl-10"/>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginated.map(a => (
          <div key={a.id} className="card text-center">
            <img src={a.avatar} alt="" className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"/>
            <h3 className="font-semibold text-gray-900">{a.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{a.company}</p>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
              <span className="text-sm font-medium">{a.rating}</span>
              <span className="text-xs text-gray-400">· {a.sales} sales</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{a.experience}</p>
            {a.specialization?.length>0 && <div className="flex flex-wrap justify-center gap-1 mb-3">{a.specialization.map(s=><Badge key={s} className="badge-blue">{s}</Badge>)}</div>}
            <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
              <button onClick={()=>setShowView(a)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>View</button>
              <button onClick={()=>openEdit(a)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-blue-500 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3"/>Edit</button>
              <button onClick={()=>setShowDelete(a.id)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-red-500 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} agents</p>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(i=><button key={i} onClick={()=>setPage(i)} className={`px-3 py-1.5 text-sm border rounded-lg ${page===i?'bg-primary-600 text-white border-primary-600':'hover:bg-gray-50'}`}>{i}</button>)}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing?'Edit Agent':'Add New Agent'}</h2>
              <button onClick={()=>setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="text" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Company</label><input type="text" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Rating</label><input type="number" step="0.1" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sales</label><input type="number" value={form.sales} onChange={e=>setForm({...form,sales:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience</label><input type="text" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} className="input-field" placeholder="8+ years"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label><input type="text" value={form.avatar} onChange={e=>setForm({...form,avatar:e.target.value})} className="input-field" placeholder="https://i.pravatar.cc/..."/></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Specializations (comma separated)</label><input type="text" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})} className="input-field" placeholder="Residential, Luxury, Investment"/></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing?'Save Changes':'Add Agent'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <button onClick={()=>setShowView(null)} className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5"/></button>
              <img src={showView.avatar} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"/>
              <h2 className="text-xl font-bold text-gray-900">{showView.name}</h2>
              <p className="text-gray-500">{showView.company}</p>
              <div className="flex items-center justify-center gap-1 my-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/><span className="font-bold text-lg">{showView.rating}</span>
                <span className="text-sm text-gray-400">· {showView.sales} sales</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{showView.experience}</p>
              {showView.specialization?.length>0 && <div className="flex flex-wrap justify-center gap-2 mb-4">{showView.specialization.map(s=><Badge key={s} className="badge-blue">{s}</Badge>)}</div>}
              <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/><span>{showView.phone}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/><span>{showView.email}</span></div>
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
            <h3 className="text-lg font-semibold mb-2">Delete Agent?</h3>
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