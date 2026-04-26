import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  reversed: 'bg-gray-100 text-gray-600',
}

export default function PaymentsPage() {
  const { data, loading, error } = useApi('/payments/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h2>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">Failed to load payments.</p>}
        <div className="space-y-4">
          {data?.results?.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">RWF {parseFloat(p.amount).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{p.method.toUpperCase()} · {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[p.status] ?? ''}`}>
                {p.status}
              </span>
            </div>
          ))}
          {!loading && !data?.results?.length && <p className="text-gray-500">No payments yet.</p>}
        </div>
      </main>
    </div>
  )
}
