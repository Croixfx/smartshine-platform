import { useState, useEffect } from 'react'
import client from '../../api/client'

/* ── Color helpers ──────────────────────────────────────────────────────────── */
const CAR_COLORS = {
  white: '#F8FAFC', black: '#1E293B', red: '#DC2626', blue: '#2563EB',
  green: '#16A34A', silver: '#94A3B8', gray: '#6B7280', grey: '#6B7280',
  yellow: '#EAB308', orange: '#EA580C', brown: '#92400E', purple: '#7C3AED',
  gold: '#D97706', beige: '#D4B896', champagne: '#F5DEB3', 'pearl white': '#F1F5F9',
  'dark blue': '#1E3A5F', maroon: '#881337', pink: '#EC4899', cyan: '#0891B2',
}

const colorSwatch = (name) => CAR_COLORS[name?.toLowerCase()] || '#CBD5E1'

/* ── Vehicle type config ────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  Sedan:     { gradient: 'linear-gradient(140deg,#1A5276 0%,#2E86C1 100%)', icon: CarSedanIcon },
  SUV:       { gradient: 'linear-gradient(140deg,#145A32 0%,#27AE60 100%)', icon: CarSuvIcon },
  Hatchback: { gradient: 'linear-gradient(140deg,#4C1D95 0%,#7C3AED 100%)', icon: CarSedanIcon },
  Pickup:    { gradient: 'linear-gradient(140deg,#92400E 0%,#F59E0B 100%)', icon: CarPickupIcon },
  Van:       { gradient: 'linear-gradient(140deg,#0E7490 0%,#06B6D4 100%)', icon: CarVanIcon },
  Other:     { gradient: 'linear-gradient(140deg,#374151 0%,#6B7280 100%)', icon: CarSedanIcon },
}

/* ── SVG Car Icons ──────────────────────────────────────────────────────────── */
function CarSedanIcon() {
  return (
    <svg width="72" height="36" viewBox="0 0 120 55" fill="none">
      <rect x="15" y="28" width="90" height="18" rx="6" fill="rgba(255,255,255,.25)" />
      <path d="M18 30 L32 16 Q38 10 48 10 L72 10 Q82 10 88 16 L102 30" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="33" cy="46" r="8" fill="rgba(0,0,0,.3)" />
      <circle cx="33" cy="46" r="5" fill="rgba(255,255,255,.2)" />
      <circle cx="87" cy="46" r="8" fill="rgba(0,0,0,.3)" />
      <circle cx="87" cy="46" r="5" fill="rgba(255,255,255,.2)" />
      <rect x="42" y="13" width="14" height="11" rx="2" fill="rgba(255,255,255,.15)" />
      <rect x="64" y="13" width="14" height="11" rx="2" fill="rgba(255,255,255,.15)" />
    </svg>
  )
}

function CarSuvIcon() {
  return (
    <svg width="72" height="40" viewBox="0 0 120 60" fill="none">
      <rect x="12" y="26" width="96" height="22" rx="6" fill="rgba(255,255,255,.25)" />
      <path d="M14 28 L24 10 Q28 6 38 6 L82 6 Q92 6 96 10 L106 28" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="48" r="9" fill="rgba(0,0,0,.3)" />
      <circle cx="32" cy="48" r="5.5" fill="rgba(255,255,255,.2)" />
      <circle cx="88" cy="48" r="9" fill="rgba(0,0,0,.3)" />
      <circle cx="88" cy="48" r="5.5" fill="rgba(255,255,255,.2)" />
      <rect x="38" y="10" width="16" height="13" rx="2" fill="rgba(255,255,255,.15)" />
      <rect x="66" y="10" width="16" height="13" rx="2" fill="rgba(255,255,255,.15)" />
    </svg>
  )
}

function CarPickupIcon() {
  return (
    <svg width="72" height="36" viewBox="0 0 120 55" fill="none">
      <rect x="12" y="28" width="96" height="18" rx="5" fill="rgba(255,255,255,.25)" />
      <path d="M14 30 L22 14 Q26 8 36 8 L58 8 Q64 8 66 14 L68 28" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="68" y="28" width="40" height="14" rx="3" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
      <circle cx="30" cy="46" r="8" fill="rgba(0,0,0,.3)" />
      <circle cx="30" cy="46" r="5" fill="rgba(255,255,255,.2)" />
      <circle cx="90" cy="46" r="8" fill="rgba(0,0,0,.3)" />
      <circle cx="90" cy="46" r="5" fill="rgba(255,255,255,.2)" />
    </svg>
  )
}

function CarVanIcon() {
  return (
    <svg width="72" height="38" viewBox="0 0 120 58" fill="none">
      <rect x="10" y="20" width="100" height="26" rx="6" fill="rgba(255,255,255,.25)" />
      <path d="M12 22 L12 8 Q12 6 14 6 L72 6 Q82 6 90 12 L108 22" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="30" cy="46" r="9" fill="rgba(0,0,0,.3)" />
      <circle cx="30" cy="46" r="5.5" fill="rgba(255,255,255,.2)" />
      <circle cx="90" cy="46" r="9" fill="rgba(0,0,0,.3)" />
      <circle cx="90" cy="46" r="5.5" fill="rgba(255,255,255,.2)" />
      <rect x="18" y="10" width="20" height="14" rx="2" fill="rgba(255,255,255,.15)" />
      <rect x="44" y="10" width="20" height="14" rx="2" fill="rgba(255,255,255,.15)" />
    </svg>
  )
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const inp = {
  width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10,
  padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif",
  color: '#1a1a2e', outline: 'none', boxSizing: 'border-box',
}

const f = (size, weight = 400, color = '#1E293B') => ({
  fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color,
})

/* ── Vehicle Card ───────────────────────────────────────────────────────────── */
function VehicleCard({ vehicle, onDelete, onEdit }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const cfg = TYPE_CONFIG[vehicle.vehicle_type] || TYPE_CONFIG.Other
  const Icon = cfg.icon
  const swatch = colorSwatch(vehicle.color)
  const isLight = ['white', 'pearl white', 'champagne', 'beige', 'silver'].includes(vehicle.color?.toLowerCase())

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(vehicle.id)
    setDeleting(false)
    setConfirm(false)
  }

  return (
    <div style={{
      background: 'white', borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,.10)', border: '1px solid #E2E8F0',
      transition: 'transform .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,.14)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.10)' }}
    >
      {/* ── Gradient header ── */}
      <div style={{ background: cfg.gradient, padding: '22px 20px 18px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Type badge */}
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,.18)', color: 'white', backdropFilter: 'blur(6px)',
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
          textTransform: 'uppercase', letterSpacing: '.06em', border: '1px solid rgba(255,255,255,.25)',
        }}>
          {vehicle.vehicle_type}
        </span>

        {/* Car illustration */}
        <div style={{ marginBottom: 14, opacity: 0.9 }}><Icon /></div>

        {/* License plate */}
        <div style={{
          background: 'rgba(255,255,255,.96)', borderRadius: 8,
          padding: '6px 18px', textAlign: 'center',
          fontFamily: "'Courier New',monospace", fontSize: 17, fontWeight: 900,
          color: '#1a1a2e', letterSpacing: '.12em',
          boxShadow: '0 3px 12px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.8)',
          border: '2px solid rgba(0,0,0,.08)',
          minWidth: 140,
        }}>
          {vehicle.plate_number}
        </div>
      </div>

      {/* ── Info section ── */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ ...f(16, 700), marginBottom: 10 }}>
          {vehicle.make} {vehicle.model}
        </div>

        {vehicle.color && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: swatch,
              border: isLight ? '1.5px solid #CBD5E1' : '1.5px solid rgba(0,0,0,.12)',
              flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,.1)',
            }} />
            <span style={f(12, 500, '#64748B')}>{vehicle.color}</span>
          </div>
        )}

        {/* Divider + Actions */}
        {!confirm ? (
          <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={() => onEdit(vehicle)}
              style={{
                flex: 1, padding: '9px 0', background: '#F1F5F9', border: 'none',
                borderRadius: 10, cursor: 'pointer', ...f(13, 600, '#475569'),
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
            >
              Edit
            </button>
            <button
              onClick={() => setConfirm(true)}
              style={{
                flex: 1, padding: '9px 0', background: '#FEF2F2', border: 'none',
                borderRadius: 10, cursor: 'pointer', ...f(13, 600, '#DC2626'),
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            <div style={f(12, 500, '#B91C1C', )}>Remove this vehicle?</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '8px 0', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', ...f(13, 600, '#475569') }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '8px 0', background: '#DC2626', border: 'none', borderRadius: 10, cursor: deleting ? 'not-allowed' : 'pointer', ...f(13, 700, 'white'), opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Edit Modal ─────────────────────────────────────────────────────────────── */
function VehicleModal({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({
    plate_number: vehicle?.plate_number || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    vehicle_type: vehicle?.vehicle_type || 'Sedan',
    color: vehicle?.color || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.plate_number || !form.make || !form.model) { setError('Plate, make, and model are required'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') {
        setError(Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · '))
      } else setError('Failed to save vehicle.')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h3>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Plate Number *', 'plate_number', 'RAX 000 X'], ['Make *', 'make', 'Toyota'], ['Model *', 'model', 'Corolla'], ['Color', 'color', 'White']].map(([label, key, ph]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inp} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Vehicle Type</label>
            <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
              {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} style={{
            width: '100%', background: saving ? '#CBD5E1' : '#1A5276', color: 'white',
            fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 12, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>
            {saving ? 'Saving...' : vehicle ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1A5276,#2E86C1)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(26,82,118,.3)' }}>
        <CarSedanIcon />
      </div>
      <div style={f(18, 700)}>No vehicles yet</div>
      <div style={{ ...f(14, 400, '#64748B'), marginTop: 6, marginBottom: 24 }}>Add your car to start booking washes</div>
      <button onClick={onAdd} style={{
        background: '#F39C12', color: '#1a1a2e', fontSize: 14, fontWeight: 700,
        padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
        fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(243,156,18,.3)',
      }}>
        + Add Your First Vehicle
      </button>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // null | 'add' | vehicle-object (edit)

  useEffect(() => {
    client.get('vehicles/')
      .then(({ data }) => setVehicles(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (form) => {
    if (modal === 'add') {
      const { data } = await client.post('vehicles/', form)
      setVehicles(prev => [...prev, data])
    } else {
      const { data } = await client.patch(`vehicles/${modal.id}/`, form)
      setVehicles(prev => prev.map(v => v.id === modal.id ? data : v))
    }
  }

  const handleDelete = async (id) => {
    try {
      await client.delete(`vehicles/${id}/`)
      setVehicles(prev => prev.filter(v => v.id !== id))
    } catch {
      alert('Failed to remove vehicle.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', flex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>My Vehicles</h2>
            <p style={{ ...f(14, 400, '#64748B'), marginTop: 4 }}>
              {vehicles.length > 0 ? `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} registered` : 'Manage your registered vehicles'}
            </p>
          </div>
          {vehicles.length > 0 && (
            <button onClick={() => setModal('add')} style={{
              background: '#F39C12', color: '#1a1a2e', fontSize: 13, fontWeight: 700,
              padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 12px rgba(243,156,18,.25)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Vehicle
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #E2E8F0' }}>
                <div style={{ height: 130, background: 'linear-gradient(140deg,#E2E8F0,#CBD5E1)' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 14, background: '#F1F5F9', borderRadius: 7, width: '70%', marginBottom: 10 }} />
                  <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #E2E8F0' }}>
            <EmptyState onAdd={() => setModal('add')} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} onDelete={handleDelete} onEdit={v => setModal(v)} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <VehicleModal
          vehicle={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
