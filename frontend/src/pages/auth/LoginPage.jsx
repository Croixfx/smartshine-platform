import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

const ROLE_REDIRECT = {
  customer: '/',
  worker: '/worker',
  driver: '/driver',
  admin: '/admin',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1 = phone, 2 = otp
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Step 1: request OTP ─────────────────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('accounts/otp/request/', { phone })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.phone?.[0] || err.response?.data?.detail || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(phone, code)
      navigate(ROLE_REDIRECT[user.role] ?? '/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">SmartShine</h1>
          <p className="text-gray-500 text-sm mt-1">Car Wash Platform</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>2</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0782693724"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                OTP sent to <span className="font-semibold">{phone}</span>.{' '}
                <button type="button" onClick={() => { setStep(1); setCode(''); setError('') }} className="text-blue-600 hover:underline">
                  Change number
                </button>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-widest text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
