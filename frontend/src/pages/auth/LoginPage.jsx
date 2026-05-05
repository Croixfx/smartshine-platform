import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'
import BrandPanel from '../../components/auth/BrandPanel'

const ROLE_REDIRECT = { customer: '/dashboard', worker: '/worker', driver: '/driver', admin: '/admin' }
const inp = (err) => ({ width: '100%', background: 'white', border: `1.5px solid ${err ? '#DC2626' : '#E9ECEF'}`, borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' })
const primaryBtn = (dis) => ({ width: '100%', background: dis ? '#CBD5E1' : '#F39C12', color: dis ? '#94A3B8' : '#1a1a2e', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none', cursor: dis ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: dis ? 'none' : '0 4px 16px rgba(243,156,18,.25)', transition: 'all 150ms' })

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [mode, setMode] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const formatPhone = (p) => {
    const clean = p.replace(/^0/, '')
    return `+250${clean}`
  }

  const requestEmailOtp = async () => {
    setError('')
    setInfo('')
    if (!phone.match(/^0?7\d{8}$/)) { setError('Enter a valid Rwandan phone (e.g. 782693724)'); return }
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      const { data } = await client.post('accounts/otp/request/', { phone: formatted })
      setPassword('')
      setShowPwd(false)
      setError('')
      setInfo('')
      navigate('/verify', {
        state: {
          phone: formatted,
          otpChannel: 'email',
          otpDestinationMasked: data?.masked_email || 'y***@e***',
        },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    if (!phone || !password) { setError('Enter both phone and password.'); return }
    if (!phone.match(/^0?7\d{8}$/)) { setError('Enter a valid Rwandan phone number.'); return }
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      const { data } = await client.post('token/', { phone: formatted, password })
      const user = await login(data.access, data.refresh)
      setPhone('')
      setPassword('')
      setShowPwd(false)
      setError('')
      navigate(ROLE_REDIRECT[user.role] || '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <BrandPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#F8F9FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Sign in to your SmartShine account</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#1A5276', color: 'white' }}>1</div>
            <div style={{ flex: 1, height: 2, background: '#E9ECEF' }} />
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#E9ECEF', color: '#aaa' }}>2</div>
          </div>

          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handlePasswordLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <div style={{ display: 'flex' }}>
                <div style={{ background: 'white', border: '1.5px solid #E9ECEF', borderRight: 'none', borderRadius: '10px 0 0 10px', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🇷🇼</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>+250</span>
                </div>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="78******* or 078*******"
                  autoComplete="tel-national"
                  style={{ ...inp(!!error && !phone), borderRadius: '0 10px 10px 0', flex: 1 }} autoFocus />
              </div>
            </div>

            {mode === 'password' ? (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>Password</label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      autoComplete="current-password"
                      style={{ ...inp(false), paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}>
                      {showPwd
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                    </button>
                  </div>
                </div>

                <button type="submit" style={primaryBtn(loading)} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('otp'); setPassword(''); setShowPwd(false); setError(''); setInfo('') }}
                  style={{ background: 'none', border: 'none', color: '#2E86C1', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}
                >
                  Login using OTP
                </button>
              </>
            ) : (
              <>
                {info && <div style={{ background: '#ECFEFF', border: '1px solid #A5F3FC', color: '#0F766E', fontSize: 13, borderRadius: 10, padding: '10px 14px' }}>{info}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: '#E9ECEF' }} />
                  <span style={{ fontSize: 12, color: '#aaa' }}>Choose OTP delivery</span>
                  <div style={{ flex: 1, height: 1, background: '#E9ECEF' }} />
                </div>
                <button type="button" onClick={requestEmailOtp} style={primaryBtn(loading)} disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Send OTP via Email →'}
                </button>
                <button
                  type="button"
                  onClick={() => { setError(''); setInfo('SMS OTP is coming soon. Please use email OTP for now.') }}
                  style={{ width: '100%', background: 'white', color: '#1A5276', fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 12, border: '1.5px solid #D1D5DB', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  Send OTP via SMS
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('password'); setError(''); setInfo('') }}
                  style={{ background: 'none', border: 'none', color: '#2E86C1', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}
                >
                  Back to password login
                </button>
              </>
            )}

            <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: 0 }}>
              No account?{' '}
              <span onClick={() => navigate('/register')} style={{ color: '#2E86C1', cursor: 'pointer', fontWeight: 600 }}>Create one →</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
