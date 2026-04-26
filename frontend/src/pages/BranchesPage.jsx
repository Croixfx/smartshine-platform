import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function BranchesPage() {
  const { data, loading, error } = useApi('/branches/')

  const branches = data?.results ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Branch Locations</h2>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">Failed to load branches.</p>}

        {branches.length > 0 && (
          <MapContainer
            center={[parseFloat(branches[0].latitude), parseFloat(branches[0].longitude)]}
            zoom={13}
            style={{ height: '400px', borderRadius: '1rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {branches.map((b) => (
              <Marker key={b.id} position={[parseFloat(b.latitude), parseFloat(b.longitude)]}>
                <Popup>
                  <strong>{b.name}</strong><br />{b.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow p-5">
              <p className="font-bold text-gray-800">{b.name}</p>
              <p className="text-sm text-gray-500">{b.address}</p>
              {b.phone && <p className="text-xs text-gray-400 mt-1">{b.phone}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
