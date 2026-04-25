import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function BookingsPage() {
  const { data, loading, error } = useApi('/bookings/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">Failed to load bookings.</p>}
        <div className="space-y-4">
          {data?.results?.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Booking #{b.id}</p>
                <p className="text-sm text-gray-500">{new Date(b.scheduled_at).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[b.status] ?? ''}`}>
                {b.status}
              </span>
            </div>
          ))}
          {!loading && !data?.results?.length && (
            <p className="text-gray-500">No bookings yet.</p>
          )}
        </div>
      </main>
    </div>
  )
}
