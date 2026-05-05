import { useState, useEffect } from 'react'
import client from '../../api/client'

const inp = { width: '100%', background: '#fafbfc', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }

function VehicleCard({ vehicle }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 18 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', letterSpacing: '.04em', fontFamily: "'DM Sans',sans-serif" }}>{vehicle.plate_number}</div>
      <div style={{ fontSize: 13, color: '#555', marginTop: 5, fontFamily: "'DM Sans',sans-serif" }}>{vehicle.make} {vehicle.model} - {vehicle.vehicle_type}</div>
      {vehicle.color && <div style={{ fontSize: 11, color: '#aaa', marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{vehicle.color}</div>}
    </div>
  )
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plate_number: '', make: '', model: '', vehicle_type: 'Sedan', color: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    client.get('vehicles/')
      .then(({ data }) => setVehicles(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.plate_number || !form.make || !form.model) { setFormError('Plate, make, and model are required'); return }
    setSaving(true)
    try {
      const { data } = await client.post('vehicles/', form)
      setVehicles(prev => [...prev, data])
      setForm({ plate_number: '', make: '', model: '', vehicle_type: 'Sedan', color: '' })
      setShowForm(false)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        setFormError(msgs)
      } else setFormError('Failed to add vehicle.')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>My Vehicles</h2>
          <button onClick={() => setShowForm(v => !v)} style={{
            background: showForm ? '#F3F4F6' : '#F39C12',
            color: showForm ? '#888' : '#1a1a2e',
            fontSize: 13, fontWeight: 600, padding: '9px 20px', borderRadius: 12,
            border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms',
          }}>
            {showForm ? '✕ Cancel' : '+ Add Vehicle'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 24, marginBottom: 20, border: '1.5px dashed #E9ECEF' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Add New Vehicle</div>
            {formError && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{formError}</div>}
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Plate Number', 'plate_number', 'RAX 000 X'], ['Make', 'make', 'Toyota'], ['Model', 'model', 'Corolla'], ['Color', 'color', 'White']].map(([label, key, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))} style={{ ...inp, appearance: 'none' }}>
                  {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={saving} style={{
                  width: '100%', background: '#1A5276', color: 'white', fontSize: 13, fontWeight: 600,
                  padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                }}>
                  {saving ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                <div style={{ height: 16, background: '#E9ECEF', borderRadius: 8, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 12, background: '#E9ECEF', borderRadius: 6, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
            {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
        {!loading && vehicles.length === 0 && !showForm && (
          <p style={{ color: '#aaa', fontSize: 14 }}>No vehicles yet. Add one to get started!</p>
        )}
      </div>
    </div>
  )
}
