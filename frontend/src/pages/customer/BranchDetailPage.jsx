import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../utils/leafletFix'
import client from '../../api/client'

const BACKEND = 'http://localhost:8000'

const CATEGORY_STYLES = {
  automatic:   { background: '#EDE9FE', color: '#6D28D9' },
  traditional: { background: '#FEF3C7', color: '#92400E' },
  mobile:      { background: '#DCFCE7', color: '#15803D' },
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'mobile', label: 'Mobile' },
]

// ── Branch visual theming (same as HomePage) ──────────────────────────────────

function getBranchTheme(name = '', idx = 0) {
  const n = name.toLowerCase()
  if (n.includes('kicukiro'))   return { gradient: 'linear-gradient(135deg,#0D2137 0%,#1A5276 50%,#2980B9 100%)', pattern: 'car' }
  if (n.includes('kimironko'))  return { gradient: 'linear-gradient(135deg,#0A3D2B 0%,#0E6655 55%,#1ABC9C 100%)', pattern: 'drops' }
  if (n.includes('nyamirambo')) return { gradient: 'linear-gradient(135deg,#3B1F5E 0%,#6C3483 55%,#A569BD 100%)', pattern: 'sparkle' }
  const themes = [
    { gradient: 'linear-gradient(135deg,#0D2137 0%,#1A5276 50%,#2980B9 100%)', pattern: 'car' },
    { gradient: 'linear-gradient(135deg,#0A3D2B 0%,#0E6655 55%,#1ABC9C 100%)', pattern: 'drops' },
    { gradient: 'linear-gradient(135deg,#3B1F5E 0%,#6C3483 55%,#A569BD 100%)', pattern: 'sparkle' },
  ]
  return themes[idx % themes.length]
}

function BranchPattern({ type }) {
  if (type === 'car') return (
    <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', bottom: 0, right: -10, height: '100%', opacity: 0.12 }}>
      <path d="M100,120 L145,68 L182,53 L268,53 L305,68 L330,120 Z" fill="white"/>
      <path d="M182,53 L201,28 L249,28 L268,53 Z" fill="white" opacity="0.7"/>
      <circle cx="140" cy="120" r="21" fill="white"/>
      <circle cx="310" cy="120" r="21" fill="white"/>
      <rect x="194" y="58" width="62" height="14" rx="3" fill="white" opacity="0.4"/>
    </svg>
  )
  if (type === 'drops') return (
    <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
      {[[50,105],[120,65],[200,95],[285,60],[360,95]].map(([cx, cy], i) => (
        <path key={i} d={`M${cx},${cy-36} C${cx-20},${cy-18} ${cx-20},${cy+5} ${cx},${cy+18} C${cx+20},${cy+5} ${cx+20},${cy-18} ${cx},${cy-36}`} fill="white"/>
      ))}
    </svg>
  )
  if (type === 'sparkle') return (
    <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.13 }}>
      {[[45,32,14],[120,22,9],[200,40,16],[290,24,10],[360,48,13],[80,100,8],[190,90,11],[310,85,9]].map(([x, y, r], i) => (
        <path key={i} d={`M${x},${y-r} L${x+r*.28},${y-r*.28} L${x+r},${y} L${x+r*.28},${y+r*.28} L${x},${y+r} L${x-r*.28},${y+r*.28} L${x-r},${y} L${x-r*.28},${y-r*.28}Z`} fill="white"/>
      ))}
    </svg>
  )
  return null
}

// ── Service card ──────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0' }}>
        <div style={{ height: 260, background: '#E9ECEF' }} />
        <div style={{ padding: '24px 20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: i === 1 ? 80 : 56, background: '#E9ECEF', borderRadius: 16, marginBottom: 14 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 16 }}>
          ← Back to branches
        </button>
      </div>
    )
  }

  const services = branch.service_types ?? []
  const filtered = activeTab === 'all' ? services : services.filter(s => s.category === activeTab)
  const lat = parseFloat(branch.latitude)
  const lng = parseFloat(branch.longitude)
  const hasCoords = !isNaN(lat) && !isNaN(lng)

  const theme = getBranchTheme(branch.name, branch.id)
  const realImg = branch.image_url || (branch.image
    ? (branch.image.startsWith('http') ? branch.image : `${BACKEND}${branch.image}`)
    : null)

  const handleBook = (svc) => navigate(`/book?branch=${branch.id}&service=${svc.id}`)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* ── Full-width hero ── */}
      <div style={{ width: '100%', height: 260, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {realImg ? (
          <img src={realImg} alt={branch.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: theme.gradient, position: 'relative' }}>
            <BranchPattern type={theme.pattern} />
          </div>
        )}
        {/* Dark overlay at bottom for text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.68) 0%, rgba(0,0,0,.15) 50%, transparent 100%)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.25)', borderRadius: 10,
            color: 'white', fontSize: 13, fontWeight: 500,
            padding: '7px 14px', cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif", transition: 'background 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.15)' }}
        >
          ← All branches
        </button>

        {/* Branch info overlay */}
        <div style={{ position: 'absolute', bottom: 18, left: 22, right: 22 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700,
            color: 'white', margin: '0 0 10px', textShadow: '0 2px 10px rgba(0,0,0,.4)',
            lineHeight: 1.2,
          }}>
            {branch.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Star rating */}
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="14" height="14" viewBox="0 0 24 24"
                  fill={star <= 4 ? '#F39C12' : 'rgba(255,255,255,.35)'} stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', fontFamily: "'DM Sans',sans-serif" }}>
              4.8 · 127 reviews
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 9999,
              background: branch.is_active ? 'rgba(220,252,231,.92)' : 'rgba(243,244,246,.92)',
              color: branch.is_active ? '#15803D' : '#6B7280',
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {branch.is_active ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>

        {/* Info row */}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#555', flexWrap: 'wrap', marginBottom: 20 }}>
          <span>📍 {branch.address}</span>
          <span>🕐 {branch.opening_time?.slice(0, 5)} – {branch.closing_time?.slice(0, 5)}</span>
          <span>🚗 Capacity: {branch.capacity} vehicles</span>
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
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20,
                border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                transition: 'all 150ms',
                background: activeTab === t.id ? '#1A5276' : 'white',
                color: activeTab === t.id ? 'white' : '#888',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(26,82,118,.2)' : '0 1px 4px rgba(0,0,0,.06)',
              }}>
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
