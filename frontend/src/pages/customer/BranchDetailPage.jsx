import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../utils/leafletFix'
import client from '../../api/client'

const CATEGORY_BADGE = {
  automatic: 'bg-purple-100 text-purple-700',
  traditional: 'bg-yellow-100 text-yellow-700',
  mobile: 'bg-green-100 text-green-700',
}

export default function BranchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`branches/${id}/`)
      .then(({ data }) => setBranch(data))
      .catch(() => setError('Branch not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to branches
        </button>
      </div>
    )
  }

  const lat = parseFloat(branch.latitude)
  const lng = parseFloat(branch.longitude)
  const services = branch.service_types ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
          ← All branches
        </button>

        {/* Branch header */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-extrabold text-gray-800">{branch.name}</h2>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${branch.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {branch.is_active ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{branch.address}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>🕐 {branch.opening_time?.slice(0, 5)} – {branch.closing_time?.slice(0, 5)}</span>
            <span>🚗 Capacity: {branch.capacity} vehicles</span>
          </div>
        </div>

        {/* Mini map */}
        <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: 240 }}>
          <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>{branch.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Available Services</h3>

          {services.length === 0 && (
            <p className="text-gray-500 text-sm">No services listed for this branch yet.</p>
          )}

          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-800">{svc.name}</h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CATEGORY_BADGE[svc.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {svc.category_display ?? svc.category}
                    </span>
                    {!svc.is_available && (
                      <span className="text-xs text-gray-400 italic">Unavailable</span>
                    )}
                  </div>
                  {svc.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{svc.description}</p>
                  )}
                  <p className="text-xs text-gray-400">{svc.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-lg font-extrabold text-blue-700">
                    RWF {Number(svc.price).toLocaleString()}
                  </span>
                  <button
                    disabled={!svc.is_available}
                    onClick={() => navigate(`/book?branch=${branch.id}&service=${svc.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
