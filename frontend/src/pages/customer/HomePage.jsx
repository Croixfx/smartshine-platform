import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../utils/leafletFix'
import client from '../../api/client'

// Kigali default centre
const DEFAULT_CENTER = [-1.9441, 30.0619]

export default function HomePage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('branches/')
      .then(({ data }) => setBranches(data.results ?? data))
      .catch(() => setError('Failed to load branches.'))
      .finally(() => setLoading(false))
  }, [])

  const mapCenter = branches.length > 0
    ? [parseFloat(branches[0].latitude), parseFloat(branches[0].longitude)]
    : DEFAULT_CENTER

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-blue-700 text-white py-10 px-6 text-center">
        <h2 className="text-3xl font-extrabold">Find a Branch Near You</h2>
        <p className="mt-2 text-blue-200 text-sm">Premium car wash services across Kigali</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: 340 }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {branches.map((b) => (
              <Marker
                key={b.id}
                position={[parseFloat(b.latitude), parseFloat(b.longitude)]}
                eventHandlers={{ click: () => navigate(`/branches/${b.id}`) }}
              >
                <Popup>
                  <strong>{b.name}</strong><br />
                  {b.address}<br />
                  <button
                    onClick={() => navigate(`/branches/${b.id}`)}
                    className="text-blue-600 hover:underline text-sm mt-1"
                  >
                    View details →
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Branch cards */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Branches</h3>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && branches.length === 0 && (
            <p className="text-gray-500 text-sm">No branches available yet.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/branches/${b.id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-md transition-shadow p-5 text-left space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {b.name}
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.is_active ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{b.address}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <span>{b.opening_time?.slice(0, 5)} – {b.closing_time?.slice(0, 5)}</span>
                  <span className="text-blue-600 font-medium">View →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
