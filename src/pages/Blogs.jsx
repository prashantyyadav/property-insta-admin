import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, AlertTriangle, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'

const ITEMS_PER_PAGE = 6

function Badge({ children, className }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}

export default function Blogs() {
  const { blogs, addBlog, updateBlog, deleteBlog } = useData()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showView, setShowView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:'', excerpt:'', author:'', category:'Market Trends', image:'', readTime:'5 min read', tags:'' })

  const categories = [...new Set(blogs.map(b=>b.category))]

  const filtered = blogs.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter!=='all' && b.category!==categoryFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)

  const openAdd = () => { setEditing(null); setForm({ title:'', excerpt:'', author:'', category:'Market Trends', image:'', readTime:'5 min read', tags:'' }); setShowModal(true) }
  const openEdit = (b) => { setEditing(b.id); setForm({ title:b.title, excerpt:b.excerpt, author:b.author, category:b.category, image:b.image, readTime:b.readTime, tags:b.tags.join(', ') }); setShowModal(true) }

  const handleSave = () => {
    if (!form.title || !form.excerpt || !form.author) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (editing) {
      updateBlog(editing, { ...form, tags })
    } else {
      addBlog({ ...form, tags, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })
    }
    setShowModal(false)
  }

  const handleDelete = () => { deleteBlog(showDelete); setShowDelete(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage {blogs.length} blog posts</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>Add Post</button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" placeholder="Search posts..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="input-field pl-10"/>
          </div>
          <select value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setPage(1)}} className="input-field w-auto">
            <option value="all">All Categories</option>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map(b => (
          <div key={b.id} className="card overflow-hidden">
            <img src={b.image} alt="" className="w-full h-44 object-cover"/>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="badge-blue">{b.category}</Badge>
                <span className="text-xs text-gray-400">{b.readTime}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{b.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{b.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>By {b.author}</span>
                <span>{b.date}</span>
              </div>
              {b.tags?.length > 0 && <div className="flex flex-wrap gap-1 mb-3">{b.tags.map(t=><Badge key={t} className="badge-yellow">{t}</Badge>)}</div>}
              <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                <button onClick={()=>setShowView(b)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>View</button>
                <button onClick={()=>openEdit(b)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-blue-500 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3"/>Edit</button>
                <button onClick={()=>setShowDelete(b.id)} className="flex-1 py-1.5 text-xs rounded-md hover:bg-gray-100 text-red-500 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {paginated.length} of {filtered.length} posts</p>
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
              <h2 className="text-lg font-semibold">{editing?'Edit Post':'Add New Post'}</h2>
              <button onClick={()=>setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Post title"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label><textarea value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} className="input-field" rows={2} placeholder="Short description"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author *</label><input type="text" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} className="input-field"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field"><option value="Market Trends">Market Trends</option><option value="Technology">Technology</option><option value="Guides">Guides</option><option value="Investment">Investment</option><option value="Sustainability">Sustainability</option><option value="Finance">Finance</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label><input type="text" value={form.readTime} onChange={e=>setForm({...form,readTime:e.target.value})} className="input-field" placeholder="5 min read"/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label><input type="text" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="input-field" placeholder="market, investment"/></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="text" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="input-field" placeholder="https://images.unsplash.com/..."/></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editing?'Save Changes':'Add Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <img src={showView.image} alt="" className="w-full h-48 object-cover rounded-t-xl"/>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Badge className="badge-blue">{showView.category}</Badge><span className="text-xs text-gray-400">{showView.readTime}</span></div>
              <h2 className="text-xl font-bold text-gray-900">{showView.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500"><span>By {showView.author}</span><span>·</span><span>{showView.date}</span></div>
              <p className="text-gray-600">{showView.excerpt}</p>
              {showView.tags?.length>0 && <div className="flex flex-wrap gap-2">{showView.tags.map(t=><Badge key={t} className="badge-yellow">{t}</Badge>)}</div>}
              <button onClick={()=>setShowView(null)} className="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold mb-2">Delete Post?</h3>
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