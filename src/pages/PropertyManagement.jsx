import { useState } from 'react'
import { Key, Users, ClipboardCheck, FileText, X, Check } from 'lucide-react'

const INIT_SCREENINGS = [
  { id: 1, name: 'Vikram Singh', employment: 'Software Engineer @ Google', income: 240000, idVerified: true, rentalHistory: 'Clean (3 prior)', creditScore: 782, status: 'Approved' },
  { id: 2, name: 'Anita Desai', employment: 'Doctor @ Fortis', income: 320000, idVerified: true, rentalHistory: 'Clean (1 prior)', creditScore: 810, status: 'Approved' },
  { id: 3, name: 'Rohit Kumar', employment: 'Freelancer', income: 95000, idVerified: false, rentalHistory: '1 dispute', creditScore: 640, status: 'Review' },
]

const INIT_INSPECTIONS = [
  { id: 1, unit: 'Flat 1204, DLF Privana', type: 'Move-in', date: '2026-06-12', status: 'Scheduled', inspector: 'Suresh K.' },
  { id: 2, unit: 'Villa 12, Sohna', type: 'Periodic', date: '2026-06-05', status: 'Completed', inspector: 'Meera R.' },
  { id: 3, unit: 'Flat 802, Godrej', type: 'Move-out', date: '2026-06-15', status: 'Scheduled', inspector: 'Suresh K.' },
]

const INIT_LEASES = [
  { id: 1, unit: 'Flat 1204, DLF Privana', tenant: 'Arjun Sharma', end: '2026-12-31', daysLeft: 204, rent: 85000, status: 'Active' },
  { id: 2, unit: 'Flat 802, Godrej', tenant: 'Meera Joshi', end: '2026-07-20', daysLeft: 40, rent: 62000, status: 'Expiring' },
  { id: 3, unit: 'Villa 12, Sohna', tenant: 'Karan Mehta', end: '2027-03-15', daysLeft: 278, rent: 120000, status: 'Active' },
]

function Toast({ msg, type, onClose }) {
  const colors = { success: '#059669', error: '#DC2626', info: '#3B82F6', warning: '#D97706' }
  return <div onClick={onClose} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: colors[type] || colors.success, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, display: 'flex', gap: 8, alignItems: 'center' }}><span>{type === 'success' ? '✓' : 'ℹ'}</span>{msg}</div>
}

export default function PropertyManagement() {
  const [tab, setTab] = useState('screening')
  const [screenings, setScreenings] = useState(INIT_SCREENINGS)
  const [inspections, setInspections] = useState(INIT_INSPECTIONS)
  const [leases, setLeases] = useState(INIT_LEASES)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const decide = (id, d) => { setScreenings(prev => prev.map(s => s.id === id ? { ...s, status: d } : s)); showToast(`Applicant ${d.toLowerCase()}`, d === 'Approved' ? 'success' : 'info') }
  const completeInspection = (id) => { setInspections(prev => prev.map(i => i.id === id ? { ...i, status: 'Completed' } : i)); showToast('Inspection marked complete') }
  const renewLease = (id) => { setLeases(prev => prev.map(l => l.id === id ? { ...l, status: 'Active', daysLeft: 365 } : l)); showToast('Lease renewed for 12 months') }

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div><h1 className="text-2xl font-bold text-gray-900">Property Management</h1><p className="text-gray-500 text-sm mt-1">Tenant screening, inspections, maintenance & lease management</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Managed Units', value: 3, icon: Key, color: 'bg-blue-500' },
          { label: 'Occupancy', value: '100%', icon: Users, color: 'bg-green-500' },
          { label: 'Pending Inspections', value: inspections.filter(i => i.status === 'Scheduled').length, icon: ClipboardCheck, color: 'bg-orange-500' },
          { label: 'Leases Expiring', value: leases.filter(l => l.status === 'Expiring').length, icon: FileText, color: 'bg-purple-500' },
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
          {[['screening', '🔍 Tenant Screening'], ['inspections', '📋 Inspections'], ['leases', '📄 Leases']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'screening' && (
        <div className="space-y-4">
          {screenings.map(s => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div><h4 className="font-bold text-gray-900">{s.name}</h4><p className="text-sm text-gray-500">{s.employment}</p></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Approved' ? 'bg-green-100 text-green-700' : s.status === 'Review' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><div className="text-xs text-gray-500">Monthly Income</div><div className="font-semibold text-gray-900">₹{s.income.toLocaleString()}</div></div>
                <div><div className="text-xs text-gray-500">ID Verified</div><div className="font-semibold">{s.idVerified ? '✓ Yes' : '✗ Pending'}</div></div>
                <div><div className="text-xs text-gray-500">Credit Score</div><div className="font-semibold" style={{ color: s.creditScore >= 750 ? '#059669' : s.creditScore >= 680 ? '#D97706' : '#DC2626' }}>{s.creditScore}</div></div>
                <div><div className="text-xs text-gray-500">Rental History</div><div className="font-semibold text-gray-900">{s.rentalHistory}</div></div>
              </div>
              {s.status === 'Review' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => decide(s.id, 'Approved')} className="btn-primary text-xs px-4">Approve</button>
                  <button onClick={() => decide(s.id, 'Rejected')} className="btn-secondary text-xs px-4">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'inspections' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr>{['Unit', 'Type', 'Date', 'Inspector', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {inspections.map(ins => (
                <tr key={ins.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{ins.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{ins.type}</td>
                  <td className="px-4 py-3 text-gray-500">{ins.date}</td>
                  <td className="px-4 py-3 text-gray-600">{ins.inspector}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${ins.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ins.status}</span></td>
                  <td className="px-4 py-3">{ins.status === 'Scheduled' ? <button onClick={() => completeInspection(ins.id)} className="text-primary-600 text-xs font-medium hover:underline flex items-center gap-1"><Check className="w-3 h-3" /> Complete</button> : <button onClick={() => showToast('Inspection report opened', 'info')} className="text-primary-600 text-xs font-medium hover:underline">View Report</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'leases' && (
        <div className="space-y-3">
          {leases.map(l => (
            <div key={l.id} className="card flex items-center gap-4">
              <div className="flex-1"><h4 className="font-semibold text-gray-900">{l.unit}</h4><p className="text-sm text-gray-500">{l.tenant} · Ends {l.end}</p></div>
              <div className="font-bold text-primary-600">₹{l.rent.toLocaleString()}/mo</div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${l.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.daysLeft} days left</span>
              {l.status === 'Expiring' ? <button onClick={() => renewLease(l.id)} className="btn-primary text-xs px-4">Renew</button> : <button onClick={() => showToast('Lease document opened', 'info')} className="btn-secondary text-xs px-4">View</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
