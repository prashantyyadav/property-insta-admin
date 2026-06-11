import { useState } from 'react'
import { Shield, IndianRupee, MessageSquare, Calendar, Plus, X, Check } from 'lucide-react'

const INIT_VISITORS = [
  { id: 1, name: 'Amazon Delivery', purpose: 'Package', flat: 'A-1204', time: '10:24 AM', status: 'Inside' },
  { id: 2, name: 'Ramesh (Plumber)', purpose: 'Maintenance', flat: 'B-802', time: '09:15 AM', status: 'Inside' },
  { id: 3, name: 'Priya Guest', purpose: 'Personal Visit', flat: 'A-1204', time: '08:40 AM', status: 'Exited' },
]

const INIT_BILLS = [
  { id: 1, flat: 'A-1204', resident: 'Arjun Sharma', amount: 8450, month: 'July 2026', status: 'Paid' },
  { id: 2, flat: 'B-802', resident: 'Meera Joshi', amount: 7200, month: 'July 2026', status: 'Due' },
  { id: 3, flat: 'C-501', resident: 'Karan Mehta', amount: 9100, month: 'July 2026', status: 'Due' },
  { id: 4, flat: 'A-905', resident: 'Sunita Rao', amount: 8450, month: 'July 2026', status: 'Paid' },
]

const INIT_COMPLAINTS = [
  { id: 1, title: 'Lift not working — Tower B', category: 'Maintenance', flat: 'B-802', status: 'In Progress', date: '2026-06-08', votes: 12 },
  { id: 2, title: 'Streetlight out near gate 2', category: 'Security', flat: 'A-1204', status: 'Open', date: '2026-06-09', votes: 5 },
  { id: 3, title: 'Garbage not collected', category: 'Sanitation', flat: 'C-501', status: 'Resolved', date: '2026-06-05', votes: 8 },
]

function Toast({ msg, type, onClose }) {
  const colors = { success: '#059669', error: '#DC2626', info: '#3B82F6', warning: '#D97706' }
  return <div onClick={onClose} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: colors[type] || colors.success, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, display: 'flex', gap: 8, alignItems: 'center' }}><span>{type === 'success' ? '✓' : 'ℹ'}</span>{msg}</div>
}

export default function SocietyOS() {
  const [tab, setTab] = useState('visitors')
  const [visitors, setVisitors] = useState(INIT_VISITORS)
  const [bills, setBills] = useState(INIT_BILLS)
  const [complaints, setComplaints] = useState(INIT_COMPLAINTS)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', purpose: 'Personal Visit', flat: '' })
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const addVisitor = () => {
    if (!form.name || !form.flat) { showToast('Name and flat are required', 'warning'); return }
    setVisitors(prev => [{ id: Date.now(), ...form, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), status: 'Inside' }, ...prev])
    showToast(`Gate pass issued for ${form.name}`)
    setModal(null); setForm({ name: '', purpose: 'Personal Visit', flat: '' })
  }

  const markExit = (id) => { setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'Exited' } : v)); showToast('Visitor marked as exited', 'info') }
  const markPaid = (id) => { setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid' } : b)); showToast('Bill marked as paid') }
  const resolveComplaint = (id) => { setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c)); showToast('Complaint resolved') }

  const collected = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0)
  const pending = bills.filter(b => b.status === 'Due').reduce((s, b) => s + b.amount, 0)

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Society OS</h1><p className="text-gray-500 text-sm mt-1">Visitor management, maintenance billing, complaints & security</p></div>
        {tab === 'visitors' && <button onClick={() => setModal('visitor')} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Pre-authorize Visitor</button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visitors Inside', value: visitors.filter(v => v.status === 'Inside').length, icon: Shield, color: 'bg-blue-500' },
          { label: 'Collected (Jul)', value: `₹${(collected / 1000).toFixed(1)}K`, icon: IndianRupee, color: 'bg-green-500' },
          { label: 'Pending Dues', value: `₹${(pending / 1000).toFixed(1)}K`, icon: IndianRupee, color: 'bg-orange-500' },
          { label: 'Open Complaints', value: complaints.filter(c => c.status !== 'Resolved').length, icon: MessageSquare, color: 'bg-purple-500' },
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
          {[['visitors', '🔐 Visitors'], ['billing', '💰 Maintenance Billing'], ['complaints', '📢 Complaints'], ['facilities', '📅 Facilities']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'visitors' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr>{['Visitor', 'Purpose', 'Flat', 'Time', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {visitors.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{v.name}</td>
                  <td className="px-4 py-3 text-gray-600">{v.purpose}</td>
                  <td className="px-4 py-3 text-gray-600">{v.flat}</td>
                  <td className="px-4 py-3 text-gray-500">{v.time}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${v.status === 'Inside' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{v.status}</span></td>
                  <td className="px-4 py-3">{v.status === 'Inside' && <button onClick={() => markExit(v.id)} className="text-primary-600 text-xs font-medium hover:underline">Mark Exit</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'billing' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr>{['Flat', 'Resident', 'Month', 'Amount', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {bills.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.flat}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{b.resident}</td>
                  <td className="px-4 py-3 text-gray-600">{b.month}</td>
                  <td className="px-4 py-3 font-bold text-primary-600">₹{b.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span></td>
                  <td className="px-4 py-3">{b.status === 'Due' ? <button onClick={() => markPaid(b.id)} className="text-primary-600 text-xs font-medium hover:underline">Mark Paid</button> : <button onClick={() => showToast('Reminder is not needed — already paid', 'info')} className="text-gray-400 text-xs">—</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'complaints' && (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="card flex items-center gap-4">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-primary-600 font-bold">▲</span><span className="text-sm font-bold text-gray-700">{c.votes}</span></div>
              <div className="flex-1"><h4 className="font-semibold text-gray-900">{c.title}</h4><p className="text-sm text-gray-500">{c.category} · {c.flat} · {c.date}</p></div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : c.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
              {c.status !== 'Resolved' && <button onClick={() => resolveComplaint(c.id)} className="btn-primary text-xs px-3 flex items-center gap-1"><Check className="w-3 h-3" /> Resolve</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'facilities' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ name: 'Clubhouse', icon: '🏛️', booked: 3 }, { name: 'Swimming Pool', icon: '🏊', booked: 8 }, { name: 'Tennis Court', icon: '🎾', booked: 5 }, { name: 'Banquet Hall', icon: '🎉', booked: 1 }].map((f, i) => (
            <div key={i} className="card text-center">
              <div className="text-4xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-gray-900">{f.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{f.booked} bookings today</p>
              <button onClick={() => showToast(`${f.name} schedule opened`, 'info')} className="btn-secondary text-xs w-full">View Schedule</button>
            </div>
          ))}
        </div>
      )}

      {modal === 'visitor' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Pre-authorize Visitor</h2><button onClick={() => setModal(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="label">Visitor Name</label><input className="input-field" placeholder="Guest name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Purpose</label><select className="input-field" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}>{['Personal Visit', 'Package', 'Maintenance', 'Cab', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="label">Flat</label><input className="input-field" placeholder="A-1204" value={form.flat} onChange={e => setForm(p => ({ ...p, flat: e.target.value }))} /></div>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t"><button onClick={() => setModal(null)} className="btn-secondary">Cancel</button><button onClick={addVisitor} className="btn-primary">Generate Gate Pass</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
