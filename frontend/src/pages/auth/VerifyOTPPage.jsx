import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import client from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import BrandPanel from '../../components/auth/BrandPanel'

const ROLE_REDIRECT = { customer: '/dashboard', worker: '/worker', driver: '/driver', admin: '/admin' }

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const phone = location.state?.phone
  const otpChannel = location.state?.otpChannel || 'phone'
  const otpDestinationMasked = location.state?.otpDestinationMasked

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(120)
  const otpRefs = useRef([])

  useEffect(() => { otpRefs.current[0]?.focus() }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [seconds])

  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  if (!phone) return <Navigate to="/login" replace />

  const maskPhone = (value) => {
    const clean = String(value || '').replace(/\D/g, '')
    if (clean.length <= 4) return '07******'
    if (clean.startsWith('250') && clean.length >= 12) {
      return `+250${clean.slice(3, 5)}*****${clean.slice(-2)}`
    }
    return `${clean.slice(0, 2)}*****${clean.slice(-2)}`
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const code = digits.join('')
  const destination = otpDestinationMasked || (otpChannel === 'email' ? 'y***@e***' : maskPhone(phone))
  const verifyTitle = otpChannel === 'email' ? 'Verify your email' : 'Verify your phone'
  const sentLabel = otpChannel === 'email' ? 'We sent a code to your email' : 'We sent a code to your phone'

  const handleDigit = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = clean; setDigits(next)
    if (clean && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    pasted.split('').forEach((c, j) => { next[j] = c })
    setDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const submitOTP = async (e) => {
    e.preventDefault()
    if (code.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('accounts/otp/verify/', { phone, code })
      const user = await login(data.access, data.refresh)
      navigate(ROLE_REDIRECT[user.role] || '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
      setDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const resend = async () => {
    try {
      await client.post('accounts/otp/request/', { phone })
      setDigits(['', '', '', '', '', ''])
      setSeconds(120)
      setError('')
      otpRefs.current[0]?.focus()
    } catch { setError('Failed to resend OTP.') }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <BrandPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#F8F9FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{verifyTitle}</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>{sentLabel}: <strong>{destination}</strong></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#1A5276', color: 'white' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ flex: 1, height: 2, background: '#1A5276' }} />
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#1A5276', color: 'white' }}>2</div>
          </div>

          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

          <form onSubmit={submitOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 16px' }}>
                Code sent to <strong>{destination}</strong>.{' '}
                <button type="button" onClick={() => navigate('/login')} style={{ color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Change</button>
              </p>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 10 }}>Enter 6-digit code</label>
              <div style={{ display: 'flex', gap: 6 }} onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    style={{ flex: '0 0 calc((100% - 30px) / 6)', width: 0, minWidth: 0, height: 54, borderRadius: 10, border: `2px solid ${d ? '#2E86C1' : '#E9ECEF'}`, background: d ? '#EFF6FF' : 'white', fontSize: 20, fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', color: '#1A5276', outline: 'none', transition: 'all 150ms', boxSizing: 'border-box' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: seconds > 0 ? '#888' : '#2E86C1', cursor: seconds === 0 ? 'pointer' : 'default' }}
                onClick={() => { if (seconds === 0) resend() }}>
                {seconds > 0 ? `Resend in ${mm}:${ss}` : 'Resend OTP'}
              </span>
              <span style={{ color: '#888' }}>{code.length}/6 digits</span>
            </div>

            <button type="submit" disabled={loading || code.length !== 6}
              style={{ width: '100%', background: (loading || code.length !== 6) ? '#CBD5E1' : '#F39C12', color: (loading || code.length !== 6) ? '#94A3B8' : '#1a1a2e', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none', cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: (loading || code.length !== 6) ? 'none' : '0 4px 16px rgba(243,156,18,.25)', transition: 'all 150ms' }}>
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
