import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: bookings, loading } = useApi('/bookings/')

  const statusCounts = bookings?.results?.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {}) ?? {}

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.full_name || user?.phone}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['pending', 'confirmed', 'completed'].map((s) => (
            <div key={s} className="bg-white rounded-2xl shadow p-5">
              <p className="text-gray-500 capitalize text-sm">{s}</p>
              <p className="text-3xl font-bold mt-1 text-blue-700">{statusCounts[s] ?? 0}</p>
            </div>
          ))}
        </div>

        {!loading && chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  )
}
