import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '', full_name: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/accounts/register/', form)
      navigate('/login')
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? 'Registration failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-700">Create Account</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded-lg px-4 py-2" required />
        <input type="text" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full border rounded-lg px-4 py-2" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border rounded-lg px-4 py-2">
          <option value="customer">Customer</option>
          <option value="worker">Worker</option>
          <option value="driver">Driver</option>
        </select>
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded-lg px-4 py-2" required />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Creating…' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
