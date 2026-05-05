import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'
import BrandPanel from '../../components/auth/BrandPanel'

const inp = { width: '100%', background: 'white', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const strength = (pwd) => {
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }
  const pwdStrength = strength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStrength]
  const strengthColor = ['#E9ECEF', '#DC2626', '#F59E0B', '#2E86C1', '#22C55E'][pwdStrength]

  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return 'y***@e***'
    const [local, domain] = email.split('@')
    const prefix = local.slice(0, 4)
    const suffix = local.length > 4 ? local.slice(-3) : ''
    const starCount = Math.max(local.length - prefix.length - suffix.length, 3)
    return `${prefix}${'*'.repeat(starCount)}${suffix}@${domain}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.phone || !form.password) { setError('Please fill in all required fields'); return }
    if (!form.phone.match(/^0?7\d{8}$/)) { setError('Enter a valid Rwandan phone number (e.g. 782693724)'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const phone = `+250${form.phone.replace(/^0/, '')}`
      const email = (form.email || '').trim()
      await client.post('accounts/register/', { phone, full_name: form.fullName, email: form.email || '', password: form.password })
      try { await client.post('accounts/otp/request/', { phone }) } catch {}
      setForm({ fullName: '', phone: '', email: '', password: '' })
      setShowPwd(false)
      setError('')
      navigate('/verify', {
        state: {
          phone,
          otpChannel: email ? 'email' : 'phone',
          otpDestinationMasked: email ? maskEmail(email) : phone,
        },
      })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || 'Registration failed. Please check your details and try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <BrandPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#F8F9FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Create account</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Join thousands of SmartShine customers in Kigali</div>

          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Jean de la Croix Niyonkuru" style={inp} autoComplete="name" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Phone Number <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ display: 'flex' }}>
                <div style={{ background: 'white', border: '1.5px solid #E9ECEF', borderRight: 'none', borderRadius: '10px 0 0 10px', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🇷🇼</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>+250</span>
                </div>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="78******* or 078*******"
                  autoComplete="tel-national"
                  style={{ ...inp, borderRadius: '0 10px 10px 0', flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Email <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>(optional)</span></label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" style={inp} autoComplete="email" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Password <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{ ...inp, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}>
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwdStrength ? strengthColor : '#E9ECEF', transition: 'background 200ms' }} />
                    ))}
                  </div>
                  {strengthLabel && <div style={{ fontSize: 11, color: strengthColor, marginTop: 4, fontWeight: 600 }}>{strengthLabel} password</div>}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#CBD5E1' : '#F39C12', color: loading ? '#94A3B8' : '#1a1a2e', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: loading ? 'none' : '0 4px 16px rgba(243,156,18,.25)', transition: 'all 150ms', marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <span style={{ color: '#2E86C1', cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: '#2E86C1', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: 0 }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color: '#2E86C1', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
