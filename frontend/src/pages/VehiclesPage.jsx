import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'

export default function VehiclesPage() {
  const { data, loading, error } = useApi('/vehicles/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Vehicles</h2>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">Failed to load vehicles.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data?.results?.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl shadow p-5">
              <p className="font-bold text-gray-800">{v.plate_number}</p>
              <p className="text-sm text-gray-600">{v.make} {v.model} · {v.vehicle_type}</p>
              {v.color && <p className="text-xs text-gray-400 mt-1">{v.color}</p>}
            </div>
          ))}
          {!loading && !data?.results?.length && <p className="text-gray-500">No vehicles registered.</p>}
        </div>
      </main>
    </div>
  )
}
