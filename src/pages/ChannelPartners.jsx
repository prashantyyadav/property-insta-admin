import { useState } from 'react'
import { Users, IndianRupee, TrendingUp, Award, Phone, MessageSquare, Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const TIERS = { Platinum: '#7C3AED', Gold: '#D97706', Silver: '#6B7280', Bronze: '#92400E' }

const INIT_CPS = [
  { id: 1, name: 'Rajiv Properties', owner: 'Rajiv Mehta', city: 'Gurgaon', tier: 'Platinum', deals: 42, commission: 2850000, rating: 4.9, phone: '+91 98765 43210', email: 'rajiv@rajivprop.com', active: true, joined: '2024-01-15' },
  { id: 2, name: 'Priya Real Estate', owner: 'Priya Sharma', city: 'Delhi', tier: 'Gold', deals: 28, commission: 1420000, rating: 4.7, phone: '+91 87654 32109', email: 'priya@priyare.com', active: true, joined: '2024-03-22' },
  { id: 3, name: 'NRI Connect', owner: 'Amit Gupta', city: 'Mumbai', tier: 'Silver', deals: 12, commission: 680000, rating: 4.5, phone: '+91 76543 21098', email: 'amit@nriconnect.in', active: true, joined: '2024-06-10' },
  { id: 4, name: 'HomeFirst Brokers', owner: 'Sunita Rao', city: 'Noida', tier: 'Bronze', deals: 6, commission: 220000, rating: 4.2, phone: '+91 65432 10987', email: 'sunita@homefirst.com', active: false, joined: '2024-09-05' },
  { id: 5, name: 'Capital Realty', owner: 'Vivek Jain', city: 'Gurgaon', tier: 'Gold', deals: 19, commission: 980000, rating: 4.6, phone: '+91 54321 09876', email: 'vivek@capitalrealty.co', active: true, joined: '2024-02-18' },
]

const INIT_LEADS = [
  { id: 1, cp: 'Rajiv Properties', buyer: 'Arjun Sharma', project: 'DLF Privana South', value: 75000000, stage: 'Site Visit', date: '2026-06-06', comm: 2 },
  { id: 2, cp: 'Priya Real Estate', buyer: 'Meera Joshi', project: 'Godrej Aristocrat', value: 42000000, stage: 'Negotiation', date: '2026-06-05', comm: 1.5 },
  { id: 3, cp: 'Capital Realty', buyer: 'Rohit Verma', project: 'M3M Antalya Hills', value: 28000000, stage: 'Interested', date: '2026-06-07', comm: 2 },
  { id: 4, cp: 'NRI Connect', buyer: 'Kavita Reddy', project: 'DLF Privana South', value: 68000000, stage: 'Offer Made', date: '2026-06-04', comm: 2 },
]

const BLANK_CP = { name: '', owner: '', city: '', tier: 'Silver', phone: '', email: '', active: true }
const BLANK_LEAD = { cp: '', buyer: '', project: '', value: '', stage: 'Interested', date: new Date().toISOString().slice(0, 10), comm: 2 }

const fmt = (n) => {
  if (!n) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${Number(n).toLocaleString()}`
}

function Toast({ msg, type, onClose }) {
  const colors = { success: '#059669', error: '#DC2626', info: '#3B82F6', warning: '#D97706' }
  return <div onClick={onClose} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: colors[type] || colors.success, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, display: 'flex', gap: 8, alignItems: 'center' }}><span>{type === 'success' ? '✓' : 'ℹ'}</span>{msg}</div>
}

export default function ChannelPartners() {
  const [tab, setTab] = useState('partners')
  const [cps, setCps] = useState(INIT_CPS)
  const [leads, setLeads] = useState(INIT_LEADS)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAddCP = () => { setForm({ ...BLANK_CP }); setEditTarget(null); setModal('cp') }
  const openEditCP = (cp) => { setForm({ ...cp }); setEditTarget(cp.id); setModal('cp') }
  const openDeleteCP = (cp) => { setEditTarget(cp); setModal('delete-cp') }
  const openAddLead = () => { setForm({ ...BLANK_LEAD }); setEditTarget(null); setModal('lead') }
  const openEditLead = (l) => { setForm({ ...l }); setEditTarget(l.id); setModal('lead') }
  const openDeleteLead = (l) => { setEditTarget(l); setModal('delete-lead') }

  const saveCP = () => {
    if (!form.name || !form.owner) { showToast('Name and owner are required', 'warning'); return }
    if (editTarget) {
      setCps(prev => prev.map(c => c.id === editTarget ? { ...form, id: editTarget, deals: Number(form.deals) || 0, commission: Number(form.commission) || 0, rating: Number(form.rating) || 4.0 } : c))
      showToast(`${form.name} updated`)
    } else {
      const cp = { ...form, id: Date.now(), deals: 0, commission: 0, rating: 4.0, joined: new Date().toISOString().slice(0, 10) }
      setCps(prev => [cp, ...prev])
      showToast(`${cp.name} onboarded successfully`)
    }
    setModal(null)
  }

  const deleteCP = () => { setCps(prev => prev.filter(c => c.id !== editTarget.id)); showToast(`${editTarget.name} removed`, 'info'); setModal(null) }

  const saveLead = () => {
    if (!form.cp || !form.buyer) { showToast('CP and buyer are required', 'warning'); return }
    if (editTarget) {
      setLeads(prev => prev.map(l => l.id === editTarget ? { ...form, id: editTarget, value: Number(form.value) || 0 } : l))
      showToast('Lead updated')
    } else {
      const l = { ...form, id: Date.now(), value: Number(form.value) || 0 }
      setLeads(prev => [l, ...prev])
      showToast(`Lead for ${l.buyer} added`)
    }
    setModal(null)
  }

  const deleteLead = () => { setLeads(prev => prev.filter(l => l.id !== editTarget.id)); showToast('Lead removed', 'info'); setModal(null) }

  const toggleActive = (id) => {
    setCps(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
    const cp = cps.find(c => c.id === id)
    showToast(`${cp?.name} ${cp?.active ? 'deactivated' : 'activated'}`, cp?.active ? 'info' : 'success')
  }

  const filtered = cps.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
  const totalComm = cps.reduce((s, c) => s + c.commission, 0)
  const totalDeals = cps.reduce((s, c) => s + c.deals, 0)

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Channel Partners</h1><p className="text-gray-500 text-sm mt-1">Manage your CP network, leads & commissions</p></div>
        <div className="flex gap-2">
          {tab === 'partners' && <button onClick={openAddCP} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Onboard CP</button>}
          {tab === 'leads' && <button onClick={openAddLead} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Lead</button>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active CPs', value: cps.filter(c => c.active).length, icon: Users, color: 'bg-blue-500' },
          { label: 'Total Deals', value: totalDeals, icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Commission Paid', value: fmt(totalComm), icon: IndianRupee, color: 'bg-purple-500' },
          { label: 'Avg Rating', value: (cps.reduce((s, c) => s + c.rating, 0) / cps.length).toFixed(1) + ' ⭐', icon: Award, color: 'bg-orange-500' },
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
          {[['partners', '🤝 Partners'], ['leads', '📊 Shared Leads'], ['commissions', '💰 Commissions']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'partners' && (
        <div className="space-y-4">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input-field pl-9" placeholder="Search by name or city…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          {filtered.map(cp => (
            <div key={cp.id} className={`card flex items-center gap-4 ${!cp.active ? 'opacity-60' : ''}`}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: TIERS[cp.tier] }}>{cp.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{cp.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: TIERS[cp.tier], background: TIERS[cp.tier] + '20' }}>◆ {cp.tier}</span>
                  {!cp.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <p className="text-sm text-gray-500">{cp.owner} · {cp.city} · Joined {cp.joined}</p>
                <p className="text-sm text-gray-500">{cp.deals} deals · ⭐ {cp.rating} · {fmt(cp.commission)} earned</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                <a href={`tel:${cp.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Call"><Phone className="w-4 h-4 text-gray-500" /></a>
                <a href={`https://wa.me/${cp.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="WhatsApp"><MessageSquare className="w-4 h-4 text-green-500" /></a>
                <button className="btn-secondary text-xs px-3" onClick={() => toggleActive(cp.id)}>{cp.active ? 'Deactivate' : 'Activate'}</button>
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => openEditCP(cp)}><Edit2 className="w-4 h-4 text-gray-500" /></button>
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-red-50" onClick={() => openDeleteCP(cp)}><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No partners match your search.</div>}
        </div>
      )}

      {tab === 'leads' && (
        <div className="space-y-3">
          {leads.map((l, i) => (
            <div key={l.id || i} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{l.cp}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{l.stage}</span>
                </div>
                <p className="text-sm text-gray-500">Buyer: {l.buyer} · {l.project}</p>
                <p className="text-sm text-gray-500">Value: {fmt(l.value)} · Commission: {l.comm}%</p>
              </div>
              <div className="text-sm text-gray-400">{l.date}</div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => openEditLead(l)}><Edit2 className="w-4 h-4 text-gray-500" /></button>
                <button className="p-1.5 rounded hover:bg-red-50" onClick={() => openDeleteLead(l)}><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          ))}
          {leads.length === 0 && <div className="text-center py-10 text-gray-400">No leads yet.</div>}
        </div>
      )}

      {tab === 'commissions' && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-r from-primary-600 to-purple-600 text-white">
            <div className="text-3xl font-black mb-1">{fmt(totalComm)}</div>
            <p className="text-primary-200">Total Commission Paid — FY 2025-26</p>
          </div>
          {[...cps].sort((a, b) => b.commission - a.commission).map((cp, i) => (
            <div key={cp.id} className="card flex items-center gap-4">
              <span className="text-gray-400 font-bold w-6">#{i + 1}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: TIERS[cp.tier] }}>{cp.name[0]}</div>
              <span className="font-semibold text-gray-900 w-44 truncate">{cp.name}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${totalComm > 0 ? (cp.commission / totalComm) * 100 : 0}%`, background: TIERS[cp.tier] }} /></div>
              <span className="font-bold w-28 text-right" style={{ color: TIERS[cp.tier] }}>{fmt(cp.commission)}</span>
              <span className="text-gray-500 text-sm w-16 text-right">{cp.deals} deals</span>
              <button className="btn-secondary text-xs px-3" onClick={() => showToast(`Statement sent to ${cp.email}`, 'success')}>Pay Statement</button>
            </div>
          ))}
        </div>
      )}

      {/* CP Modal */}
      {modal === 'cp' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">{editTarget ? 'Edit Channel Partner' : 'Onboard Channel Partner'}</h2><button onClick={() => setModal(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Firm Name *</label><input className="input-field" placeholder="Rajiv Properties" value={form.name||''} onChange={e => f('name', e.target.value)} /></div>
                <div><label className="label">Owner Name *</label><input className="input-field" placeholder="Rajiv Mehta" value={form.owner||''} onChange={e => f('owner', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Phone</label><input className="input-field" placeholder="+91 98765 43210" value={form.phone||''} onChange={e => f('phone', e.target.value)} /></div>
                <div><label className="label">Email</label><input className="input-field" type="email" placeholder="rajiv@example.com" value={form.email||''} onChange={e => f('email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">City</label><input className="input-field" placeholder="Gurgaon" value={form.city||''} onChange={e => f('city', e.target.value)} /></div>
                <div><label className="label">Tier</label><select className="input-field" value={form.tier||'Silver'} onChange={e => f('tier', e.target.value)}><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active-cp" checked={form.active !== false} onChange={e => f('active', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                <label htmlFor="active-cp" className="text-sm font-medium text-gray-700">Active partner</label>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveCP} className="btn-primary">{editTarget ? 'Save Changes' : 'Onboard'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Modal */}
      {modal === 'lead' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">{editTarget ? 'Edit Lead' : 'Add Shared Lead'}</h2><button onClick={() => setModal(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Channel Partner *</label><select className="input-field" value={form.cp||''} onChange={e => f('cp', e.target.value)}><option value="">Select CP…</option>{cps.map(c => <option key={c.id}>{c.name}</option>)}</select></div>
                <div><label className="label">Buyer Name *</label><input className="input-field" placeholder="Arjun Sharma" value={form.buyer||''} onChange={e => f('buyer', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Project</label><input className="input-field" placeholder="DLF Privana South" value={form.project||''} onChange={e => f('project', e.target.value)} /></div>
                <div><label className="label">Deal Value (₹)</label><input className="input-field" type="number" placeholder="75000000" value={form.value||''} onChange={e => f('value', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Stage</label><select className="input-field" value={form.stage||'Interested'} onChange={e => f('stage', e.target.value)}><option>Interested</option><option>Site Visit</option><option>Offer Made</option><option>Negotiation</option><option>Registered</option></select></div>
                <div><label className="label">Commission %</label><input className="input-field" type="number" step="0.25" value={form.comm||2} onChange={e => f('comm', e.target.value)} /></div>
              </div>
              <div><label className="label">Date</label><input className="input-field" type="date" value={form.date||''} onChange={e => f('date', e.target.value)} /></div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveLead} className="btn-primary">{editTarget ? 'Save Changes' : 'Add Lead'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {(modal === 'delete-cp' || modal === 'delete-lead') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 mb-6">Delete "{editTarget?.name || editTarget?.buyer}"? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={modal === 'delete-cp' ? deleteCP : deleteLead} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
