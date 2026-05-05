import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../utils/leafletFix'
import client from '../../api/client'

const CATEGORY_STYLES = {
  automatic: { background: '#EDE9FE', color: '#6D28D9' },
  traditional: { background: '#FEF3C7', color: '#92400E' },
  mobile: { background: '#DCFCE7', color: '#15803D' },
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'mobile', label: 'Mobile' },
]

function ServiceCard({ service, onBook }) {
  const catStyle = CATEGORY_STYLES[service.category] || { background: '#F3F4F6', color: '#6B7280' }
  return (
    <div style={{
      background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)',
      padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', fontFamily: "'DM Sans',sans-serif" }}>{service.name}</span>
          <span style={{ ...catStyle, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, fontFamily: "'DM Sans',sans-serif" }}>
            {service.category_display ?? service.category}
          </span>
          {!service.is_available && <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>Unavailable</span>}
        </div>
        {service.description && <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>{service.description}</div>}
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{service.duration_minutes} min</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A5276', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>
          RWF {Number(service.price).toLocaleString()}
        </span>
        <button
          disabled={!service.is_available}
          onClick={() => service.is_available && onBook(service)}
          style={{
            background: service.is_available ? '#2E86C1' : '#e5e7eb',
            color: service.is_available ? 'white' : '#aaa',
            fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 10,
            border: 'none', cursor: service.is_available ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', transition: 'background 150ms',
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export default function BranchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    client.get(`branches/${id}/`)
      .then(({ data }) => setBranch(data))
      .catch(() => setError('Branch not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: i === 1 ? 120 : 60, background: '#E9ECEF', borderRadius: 16, marginBottom: 16 }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 16 }}>
          &larr; Back to branches
        </button>
      </div>
    )
  }

  const services = branch.service_types ?? []
  const filtered = activeTab === 'all' ? services : services.filter(s => s.category === activeTab)
  const lat = parseFloat(branch.latitude)
  const lng = parseFloat(branch.longitude)
  const hasCoords = !isNaN(lat) && !isNaN(lng)

  const handleBook = (svc) => {
    navigate(`/book?branch=${branch.id}&service=${svc.id}`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0 }}
        >
          &larr; All branches
        </button>

        {/* Branch header */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{branch.name}</h2>
            <span style={{
              fontSize: 13, fontWeight: 600, padding: '4px 14px', borderRadius: 9999,
              background: branch.is_active ? '#DCFCE7' : '#F3F4F6',
              color: branch.is_active ? '#15803D' : '#6B7280',
            }}>
              {branch.is_active ? 'Open' : 'Closed'}
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>{branch.address}</p>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#555', flexWrap: 'wrap' }}>
            <span>&#128336; {branch.opening_time?.slice(0, 5)} - {branch.closing_time?.slice(0, 5)}</span>
            <span>&#128663; Capacity: {branch.capacity} vehicles</span>
          </div>
        </div>

        {/* Mini map */}
        {hasCoords && (
          <div style={{ borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 24 }}>
            <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CircleMarker center={[lat, lng]} radius={14} pathOptions={{ fillColor: '#1A5276', fillOpacity: 0.9, color: 'white', weight: 2 }} />
            </MapContainer>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Available Services</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20,
                  border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                  transition: 'all 150ms',
                  background: activeTab === t.id ? '#1A5276' : 'white',
                  color: activeTab === t.id ? 'white' : '#888',
                  boxShadow: activeTab === t.id ? '0 2px 8px rgba(26,82,118,.2)' : '0 1px 4px rgba(0,0,0,.06)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(svc => <ServiceCard key={svc.id} service={svc} onBook={handleBook} />)}
          {filtered.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No services in this category.</p>}
        </div>
      </div>
    </div>
  )
}
