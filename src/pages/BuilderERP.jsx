import { useState } from 'react'
import { Building2, IndianRupee, Package, CheckCircle, Clock, AlertCircle, Plus, X, Edit2, Trash2 } from 'lucide-react'

const INIT_PROJECTS = [
  { id: 1, name: 'DLF Privana South', location: 'Sector 77, SPR', totalUnits: 320, booked: 198, available: 112, priceRange: '₹6.5Cr–₹9Cr', possession: 'Dec 2028', status: 'Under Construction', completion: 42, rera: 'HR/RERA/GUR/2025/301', type: 'Residential' },
  { id: 2, name: 'Godrej Aristocrat', location: 'Sector 49, Golf Course Ext', totalUnits: 180, booked: 142, available: 32, priceRange: '₹3.2Cr–₹5Cr', possession: 'Jun 2029', status: 'Under Construction', completion: 28, rera: 'HR/RERA/GUR/2025/302', type: 'Residential' },
  { id: 3, name: 'M3M Antalya Hills', location: 'Sector 79, SPR', totalUnits: 450, booked: 310, available: 120, priceRange: '₹1.8Cr–₹3.5Cr', possession: 'Mar 2027', status: 'Under Construction', completion: 68, rera: 'HR/RERA/GUR/2024/189', type: 'Residential' },
]

const INIT_BOOKINGS = [
  { id: 'BK-001', buyer: 'Arjun Sharma', unit: 'Tower C, Flat 1204', project: 'DLF Privana South', value: 75000000, token: 1000000, status: 'Active', date: '2026-06-01', phone: '+91 98765 43210' },
  { id: 'BK-002', buyer: 'Meera Joshi', unit: 'Tower A, Flat 802', project: 'Godrej Aristocrat', value: 42000000, token: 500000, status: 'Active', date: '2026-05-28', phone: '+91 87654 32109' },
  { id: 'BK-003', buyer: 'Rahul Kapoor', unit: 'Tower B, Flat 305', project: 'M3M Antalya Hills', value: 28000000, token: 300000, status: 'Pending Docs', date: '2026-06-05', phone: '+91 76543 21098' },
  { id: 'BK-004', buyer: 'Sunita Reddy', unit: 'Tower D, Flat 1501', project: 'DLF Privana South', value: 82000000, token: 1000000, status: 'Active', date: '2026-05-20', phone: '+91 65432 10987' },
]

const MILESTONES = ['Foundation', 'Ground Floor', 'Floors 1–10', 'Floors 11–20', 'Floors 21–32', 'Finishing', 'OC & Handover']

const BLANK_PROJECT = { name: '', location: '', totalUnits: '', booked: 0, available: '', priceRange: '', possession: '', status: 'Under Construction', completion: 0, rera: '', type: 'Residential' }
const BLANK_BOOKING = { buyer: '', unit: '', project: '', value: '', token: '', status: 'Active', date: new Date().toISOString().slice(0, 10), phone: '' }

const fmt = (n) => {
  if (!n) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`
  return `₹${Number(n).toLocaleString()}`
}

function Toast({ msg, type, onClose }) {
  const colors = { success: '#059669', error: '#DC2626', info: '#3B82F6', warning: '#D97706' }
  return (
    <div onClick={onClose} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: colors[type] || colors.success, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      {msg}
    </div>
  )
}

export default function BuilderERP() {
  const [tab, setTab] = useState('projects')
  const [projects, setProjects] = useState(INIT_PROJECTS)
  const [bookings, setBookings] = useState(INIT_BOOKINGS)
  const [selected, setSelected] = useState(projects[0])
  const [modal, setModal] = useState(null) // 'add-project' | 'edit-project' | 'add-booking' | 'edit-booking' | 'delete-project' | 'delete-booking'
  const [form, setForm] = useState({})
  const [toast, setToast] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openAddProject = () => { setForm({ ...BLANK_PROJECT }); setModal('add-project') }
  const openEditProject = (p, e) => { e.stopPropagation(); setForm({ ...p }); setEditTarget(p.id); setModal('edit-project') }
  const openDeleteProject = (p, e) => { e.stopPropagation(); setEditTarget(p); setModal('delete-project') }
  const openAddBooking = () => { setForm({ ...BLANK_BOOKING }); setModal('add-booking') }
  const openEditBooking = (b) => { setForm({ ...b }); setEditTarget(b.id); setModal('edit-booking') }
  const openDeleteBooking = (b) => { setEditTarget(b); setModal('delete-booking') }

  const saveProject = () => {
    if (!form.name || !form.location) { showToast('Name and location are required', 'warning'); return }
    if (modal === 'add-project') {
      const p = { ...form, id: Date.now(), totalUnits: Number(form.totalUnits) || 0, booked: Number(form.booked) || 0, available: Number(form.available) || 0, completion: Number(form.completion) || 0 }
      setProjects(prev => [p, ...prev])
      showToast(`Project "${p.name}" added`)
    } else {
      setProjects(prev => prev.map(p => p.id === editTarget ? { ...form, id: editTarget, totalUnits: Number(form.totalUnits), booked: Number(form.booked), available: Number(form.available), completion: Number(form.completion) } : p))
      showToast(`Project "${form.name}" updated`)
    }
    setModal(null)
  }

  const deleteProject = () => {
    setProjects(prev => prev.filter(p => p.id !== editTarget.id))
    if (selected?.id === editTarget.id) setSelected(projects[0])
    showToast(`Project "${editTarget.name}" deleted`, 'info')
    setModal(null)
  }

  const saveBooking = () => {
    if (!form.buyer || !form.project) { showToast('Buyer and project are required', 'warning'); return }
    if (modal === 'add-booking') {
      const b = { ...form, id: `BK-${Date.now().toString().slice(-3)}`, value: Number(form.value) || 0, token: Number(form.token) || 0 }
      setBookings(prev => [b, ...prev])
      showToast(`Booking for "${b.buyer}" added`)
    } else {
      setBookings(prev => prev.map(b => b.id === editTarget ? { ...form, id: editTarget, value: Number(form.value), token: Number(form.token) } : b))
      showToast('Booking updated')
    }
    setModal(null)
  }

  const deleteBooking = () => {
    setBookings(prev => prev.filter(b => b.id !== editTarget.id))
    showToast('Booking removed', 'info')
    setModal(null)
  }

  const totalUnits = projects.reduce((s, p) => s + p.totalUnits, 0)
  const totalBooked = projects.reduce((s, p) => s + p.booked, 0)
  const totalAvail = projects.reduce((s, p) => s + p.available, 0)
  const totalBookedValue = bookings.reduce((s, b) => s + b.value, 0)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Builder ERP</h1>
          <p className="text-gray-500 text-sm mt-1">Inventory, bookings, collections & construction progress</p>
        </div>
        <div className="flex gap-2">
          {tab === 'projects' && <button onClick={openAddProject} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Project</button>}
          {tab === 'bookings' && <button onClick={openAddBooking} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Booking</button>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalUnits.toLocaleString(), icon: Package, color: 'bg-blue-500' },
          { label: 'Booked', value: totalBooked.toLocaleString(), icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Available', value: totalAvail.toLocaleString(), icon: Building2, color: 'bg-orange-500' },
          { label: 'Booking Value', value: fmt(totalBookedValue), icon: IndianRupee, color: 'bg-purple-500' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className={`p-2 rounded-lg ${s.color} w-fit mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[['projects', '🏢 Projects'], ['bookings', '📋 Bookings'], ['construction', '🏗️ Construction']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'projects' && (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="card cursor-pointer hover:border-primary-300 border border-gray-200 transition-colors" onClick={() => { setSelected(p); setTab('construction'); }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                  <p className="text-gray-500 text-sm">{p.location} · RERA: {p.rera}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
                  <button onClick={e => openEditProject(p, e)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={e => openDeleteProject(p, e)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div><div className="text-xl font-bold text-gray-900">{p.totalUnits}</div><div className="text-xs text-gray-500">Total Units</div></div>
                <div><div className="text-xl font-bold text-green-600">{p.booked}</div><div className="text-xs text-gray-500">Booked</div></div>
                <div><div className="text-xl font-bold text-orange-500">{p.available}</div><div className="text-xs text-gray-500">Available</div></div>
                <div><div className="text-xl font-bold text-gray-900 text-sm">{p.priceRange}</div><div className="text-xs text-gray-500">Price Range</div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Construction Progress</span><span>{p.completion}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-600 rounded-full" style={{ width: `${p.completion}%` }} /></div>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="card text-center py-12 text-gray-400"><Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No projects yet. Add your first project.</p></div>}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>{['Booking ID', 'Buyer', 'Unit', 'Project', 'Value', 'Token', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{b.buyer}</td>
                  <td className="px-4 py-3 text-gray-600">{b.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{b.project}</td>
                  <td className="px-4 py-3 font-bold text-primary-600">{fmt(b.value)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(b.token)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditBooking(b)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                      <button onClick={() => openDeleteBooking(b)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="text-center py-10 text-gray-400">No bookings yet.</div>}
        </div>
      )}

      {tab === 'construction' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">{selected?.name || 'Select a project'} — Construction Timeline</h3>
            <div className="space-y-4">
              {MILESTONES.map((m, i) => {
                const pct = selected ? Math.max(0, Math.min(100, (selected.completion / 100) * (100 / MILESTONES.length) * (i + 1) * 1.4)) : 0
                const done = selected && selected.completion >= (i + 1) * (100 / MILESTONES.length) * 0.9
                const current = !done && selected && selected.completion > i * (100 / MILESTONES.length) * 0.9
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : current ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      {done ? <CheckCircle className="w-4 h-4 text-white" /> : current ? <Clock className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium ${!done && !current ? 'text-gray-400' : 'text-gray-900'}`}>{m}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h4 className="font-bold text-gray-900 mb-3">Overall Progress</h4>
              <div className="text-5xl font-black text-primary-600 mb-2">{selected?.completion || 0}%</div>
              <p className="text-gray-500 text-sm">Target possession: {selected?.possession}</p>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-3"><div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${selected?.completion || 0}%` }} /></div>
              <button className="btn-secondary w-full mt-4 text-sm" onClick={() => { const p = {...selected, completion: Math.min(100, (selected?.completion||0) + 5)}; setProjects(prev => prev.map(x => x.id === p.id ? p : x)); setSelected(p); showToast(`Progress updated to ${p.completion}%`); }}>
                Update Progress +5%
              </button>
            </div>
            <div className="card">
              <h4 className="font-bold text-gray-900 mb-3">Select Project</h4>
              <div className="space-y-2">
                {projects.map(p => (
                  <button key={p.id} onClick={() => setSelected(p)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selected?.id === p.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                    {p.name} — {p.completion}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {(modal === 'add-project' || modal === 'edit-project') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">{modal === 'add-project' ? 'Add Project' : 'Edit Project'}</h2><button onClick={() => setModal(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Project Name *</label><input className="input-field" placeholder="DLF Privana South" value={form.name||''} onChange={e => f('name', e.target.value)} /></div>
                <div><label className="label">Type</label><select className="input-field" value={form.type||'Residential'} onChange={e => f('type', e.target.value)}><option>Residential</option><option>Commercial</option><option>Mixed</option></select></div>
              </div>
              <div><label className="label">Location *</label><input className="input-field" placeholder="Sector 77, SPR, Gurugram" value={form.location||''} onChange={e => f('location', e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="label">Total Units</label><input className="input-field" type="number" value={form.totalUnits||''} onChange={e => f('totalUnits', e.target.value)} /></div>
                <div><label className="label">Booked</label><input className="input-field" type="number" value={form.booked||''} onChange={e => f('booked', e.target.value)} /></div>
                <div><label className="label">Available</label><input className="input-field" type="number" value={form.available||''} onChange={e => f('available', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Price Range</label><input className="input-field" placeholder="₹1.8Cr–₹3.5Cr" value={form.priceRange||''} onChange={e => f('priceRange', e.target.value)} /></div>
                <div><label className="label">Possession Date</label><input className="input-field" placeholder="Dec 2028" value={form.possession||''} onChange={e => f('possession', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">RERA ID</label><input className="input-field" placeholder="HR/RERA/GUR/2025/301" value={form.rera||''} onChange={e => f('rera', e.target.value)} /></div>
                <div><label className="label">Status</label><select className="input-field" value={form.status||'Under Construction'} onChange={e => f('status', e.target.value)}><option>Under Construction</option><option>Ready to Move</option><option>Launching Soon</option></select></div>
              </div>
              <div><label className="label">Construction Progress: {form.completion||0}%</label><input type="range" min={0} max={100} value={form.completion||0} onChange={e => f('completion', Number(e.target.value))} className="w-full accent-primary-600" /></div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveProject} className="btn-primary">{modal === 'add-project' ? 'Add Project' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {(modal === 'add-booking' || modal === 'edit-booking') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">{modal === 'add-booking' ? 'Add Booking' : 'Edit Booking'}</h2><button onClick={() => setModal(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Buyer Name *</label><input className="input-field" placeholder="Arjun Sharma" value={form.buyer||''} onChange={e => f('buyer', e.target.value)} /></div>
                <div><label className="label">Phone</label><input className="input-field" placeholder="+91 98765 43210" value={form.phone||''} onChange={e => f('phone', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Project *</label><select className="input-field" value={form.project||''} onChange={e => f('project', e.target.value)}><option value="">Select project…</option>{projects.map(p => <option key={p.id}>{p.name}</option>)}</select></div>
                <div><label className="label">Unit</label><input className="input-field" placeholder="Tower C, Flat 1204" value={form.unit||''} onChange={e => f('unit', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Deal Value (₹)</label><input className="input-field" type="number" placeholder="75000000" value={form.value||''} onChange={e => f('value', e.target.value)} /></div>
                <div><label className="label">Token Amount (₹)</label><input className="input-field" type="number" placeholder="1000000" value={form.token||''} onChange={e => f('token', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Status</label><select className="input-field" value={form.status||'Active'} onChange={e => f('status', e.target.value)}><option>Active</option><option>Pending Docs</option><option>Cancelled</option><option>Registered</option></select></div>
                <div><label className="label">Date</label><input className="input-field" type="date" value={form.date||''} onChange={e => f('date', e.target.value)} /></div>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveBooking} className="btn-primary">{modal === 'add-booking' ? 'Add Booking' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {(modal === 'delete-project' || modal === 'delete-booking') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 mb-6">Delete "{editTarget?.name || editTarget?.buyer}"? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={modal === 'delete-project' ? deleteProject : deleteBooking} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
