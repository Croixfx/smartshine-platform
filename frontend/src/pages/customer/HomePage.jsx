import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../utils/leafletFix'
import client from '../../api/client'

const DEFAULT_CENTER = [-1.9441, 30.0619]

function BranchCard({ branch, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 16,
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,.08)' : '0 2px 12px rgba(0,0,0,.04)',
        padding: 20, cursor: 'pointer', transition: 'box-shadow 200ms',
        display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left',
        border: 'none', width: '100%', fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: hovered ? '#2E86C1' : '#1a1a2e', transition: 'color 150ms' }}>{branch.name}</div>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 9999,
          background: branch.is_active ? '#DCFCE7' : '#F3F4F6',
          color: branch.is_active ? '#15803D' : '#6B7280', flexShrink: 0,
        }}>
          {branch.is_active ? 'Open' : 'Closed'}
        </span>
      </div>
      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>{branch.address}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#aaa', paddingTop: 4 }}>
        <span>{branch.opening_time?.slice(0, 5)} - {branch.closing_time?.slice(0, 5)}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#2E86C1' }}>View &rarr;</span>
      </div>
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    client.get('branches/')
      .then(({ data }) => setBranches(data.results ?? data))
      .catch(() => setError('Failed to load branches.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = branches.filter(b =>
    (b.name + b.address).toLowerCase().includes(search.toLowerCase())
  )

  const mapCenter = branches.length > 0 && branches[0].latitude
    ? [parseFloat(branches[0].latitude), parseFloat(branches[0].longitude)]
    : DEFAULT_CENTER

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0B2740 0%,#1A5276 60%,#2E86C1 100%)',
        padding: '56px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(243,156,18,.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(243,156,18,.15)', border: '1px solid rgba(243,156,18,.3)',
            borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#F39C12',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
          }}>
            Kigali's #1 Car Wash
          </div>
          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em',
          }}>
            Find a Branch<br /><span style={{ color: '#F39C12' }}>Near You</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', margin: '0 0 28px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Premium car wash services across Kigali - book in 2 minutes, pay with MoMo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['4.8 rating', true], ['5 locations', false], ['Open 7 days', false]].map(([text, hasStar]) => (
              <div key={text} style={{
                background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
                borderRadius: 10, padding: '8px 18px', fontSize: 13, color: 'white',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {hasStar && <span style={{ color: '#F39C12' }}>&#9733;</span>}
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        {/* Map */}
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', height: 280 }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {branches.map(b => {
              if (!b.latitude || !b.longitude) return null
              return (
                <CircleMarker
                  key={b.id}
                  center={[parseFloat(b.latitude), parseFloat(b.longitude)]}
                  radius={12}
                  pathOptions={{
                    fillColor: b.is_active ? '#1A5276' : '#9ca3af',
                    fillOpacity: 0.9, color: 'white', weight: 2,
                  }}
                  eventHandlers={{ click: () => navigate(`/branches/${b.id}`) }}
                >
                  <Popup>
                    <strong>{b.name}</strong><br />
                    {b.address}<br />
                    <span
                      onClick={() => navigate(`/branches/${b.id}`)}
                      style={{ color: '#2E86C1', cursor: 'pointer', fontSize: 12 }}
                    >
                      View details &rarr;
                    </span>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Branch list */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>All Branches</h3>
            <input
              placeholder="Search branches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'white', border: '1.5px solid #E9ECEF', borderRadius: 10,
                padding: '8px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                outline: 'none', width: 200, color: '#1a1a2e',
              }}
            />
          </div>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                  <div style={{ height: 16, background: '#E9ECEF', borderRadius: 8, width: '60%', marginBottom: 12 }} />
                  <div style={{ height: 12, background: '#E9ECEF', borderRadius: 6, width: '100%', marginBottom: 8 }} />
                  <div style={{ height: 12, background: '#E9ECEF', borderRadius: 6, width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>}

          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {filtered.map(b => (
                <BranchCard key={b.id} branch={b} onClick={() => navigate(`/branches/${b.id}`)} />
              ))}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 14 }}>No branches match your search.</p>
          )}
        </div>

        {/* How it Works */}
        <div style={{ marginTop: 56 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: 8 }}>
            How It Works
          </h3>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#888', marginBottom: 32 }}>Book a car wash in 3 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {[
              { icon: '📍', title: 'Find a Branch', desc: 'Browse branches on the map or search by location. See hours, capacity, and services.' },
              { icon: '📅', title: 'Book & Choose', desc: 'Select your service, pick a time slot, and confirm your vehicle.' },
              { icon: '💳', title: 'Pay with MoMo', desc: 'Pay securely via MTN Mobile Money. Your booking is confirmed instantly.' },
            ].map(s => (
              <div key={s.title} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{
          marginTop: 48, marginBottom: 16,
          background: 'linear-gradient(135deg,#1A5276,#2E86C1)', borderRadius: 20,
          padding: '36px 40px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
              Ready for a spotless car?
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
              Book your wash now - slots filling fast this weekend.
            </div>
          </div>
          <button
            onClick={() => { if (branches[0]) navigate(`/branches/${branches[0].id}`) }}
            style={{
              background: '#F39C12', color: '#1a1a2e', fontSize: 14, fontWeight: 700,
              padding: '13px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 16px rgba(243,156,18,.3)',
              flexShrink: 0,
            }}
          >
            Book Now &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
