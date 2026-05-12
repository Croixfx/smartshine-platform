import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

const STORAGE_KEY = 'smartshine_pending_payment'

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } }
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes drawCheck { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }
`

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [bookingData, setBookingData] = useState(null)
  const [method, setMethod] = useState('momo')
  const [phone, setPhone] = useState('')
  const [simState, setSimState] = useState('idle') // idle | stepA | stepB | success | failed
  const [error, setError] = useState('')
  const [paymentResult, setPaymentResult] = useState(null)
  const [confNum] = useState(`SS-${Math.floor(100000 + Math.random() * 900000)}`)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setBookingData(JSON.parse(stored)); return } catch {}
    }
    if (location.state?.booking) {
      setBookingData(location.state)
      return
    }
    navigate('/bookings', { replace: true })
  }, [])

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone.replace(/^\+?250/, '0'))
    }
  }, [user])

  if (!bookingData) return null

  const { booking, service, branch, date, time, dueNow, paymentType = 'deposit' } = bookingData
  const totalPrice  = Number(service?.price || 0)
  const isBalance   = paymentType === 'balance'
  const deposit     = dueNow ?? (isBalance ? Math.round(totalPrice * 0.7) : Math.round(totalPrice * 0.3))
  const balance     = totalPrice - Math.round(totalPrice * 0.3)
  const methodLabel = method === 'momo' ? 'MTN MoMo' : 'Airtel Money'

  const handlePay = async () => {
    if (!booking?.id) { setError('Missing booking details.'); return }
    if (!phone.trim()) { setError('Please enter your MoMo phone number.'); return }
    setError('')

    // ── Step A: show "sending" UI briefly ────────────────────────────────
    setSimState('stepA')
    await new Promise(r => setTimeout(r, 1200))

    // ── Step B: show "waiting on phone" UI briefly ────────────────────────
    setSimState('stepB')
    await new Promise(r => setTimeout(r, 1500))

    try {
      await client.post('payments/initiate/', {
        booking_id:   booking.id,
        amount:       deposit,
        payment_type: paymentType,
        method:       method === 'momo' ? 'momo' : 'airtel',
        phone:        phone.trim(),
      })
      localStorage.removeItem(STORAGE_KEY)
      setSimState('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process payment. Please try again.')
      setSimState('failed')
    }
  }

  // ── Step A / B ────────────────────────────────────────────────────────────
  if (simState === 'stepA' || simState === 'stepB') {
    const isA = simState === 'stepA'
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, minHeight: '60vh' }}>
        <style>{css}</style>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #E9ECEF', borderTopColor: '#1A5276', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>
            {isA ? `Sending payment request to ${methodLabel}...` : 'Waiting for you to confirm on your phone...'}
          </div>
          {isA ? (
            <div style={{ fontSize: 14, color: '#555', fontFamily: "'DM Sans',sans-serif" }}>
              Check your phone: <strong>+250 {phone.replace(/^0/, '')}</strong>
            </div>
          ) : (
            <div style={{ fontSize: 48, marginTop: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>📱</div>
          )}
        </div>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (simState === 'success') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, minHeight: '60vh' }}>
        <style>{css}</style>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.5s ease forwards' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" stroke="#15803D" strokeWidth="2.5"
              style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawCheck 0.6s ease 0.3s forwards' }} />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>Payment Successful!</div>
          <div style={{ fontSize: 13, color: '#888', fontFamily: "'DM Sans',sans-serif" }}>Confirmation: <strong>{confNum}</strong></div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', padding: '20px 24px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Confirmation #', confNum, { fontWeight: 700, color: '#1A5276', letterSpacing: '0.05em' }],
            ['Amount Paid', `${Number(deposit).toLocaleString()} RWF`, { fontWeight: 700, color: '#1a1a2e' }],
            ['Payment Method', methodLabel, { fontWeight: 600, color: '#1a1a2e' }],
            ['Booking Ref', `#${booking?.id}`, { fontWeight: 600, color: '#1a1a2e' }],
          ].map(([k, v, st]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#888', fontFamily: "'DM Sans',sans-serif" }}>{k}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", ...st }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/bookings')} style={{ background: '#1A5276', color: 'white', fontSize: 14, fontWeight: 600, padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          View My Bookings →
        </button>
        <button onClick={() => navigate('/')} style={{ background: 'none', color: '#888', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Back to Home
        </button>
      </div>
    )
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (simState === 'failed') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, minHeight: '60vh' }}>
        <style>{css}</style>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>Payment Failed</div>
          <div style={{ fontSize: 13, color: '#B91C1C', fontFamily: "'DM Sans',sans-serif" }}>{error || 'Something went wrong'}</div>
        </div>
        <button onClick={() => { setSimState('idle'); setError('') }} style={{ background: '#F39C12', color: '#1a1a2e', fontSize: 14, fontWeight: 700, padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Try Again
        </button>
        <button style={{ background: 'none', color: '#888', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Contact Support
        </button>
      </div>
    )
  }

  // ── Payment form (idle) ───────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <style>{css}</style>
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0 }}>
          ← Back
        </button>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
          {isBalance ? 'Pay Remaining Balance' : 'Complete Payment'}
        </h2>

        {/* Order summary */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Order Summary</div>
          {[
            ['Service', service?.name || '-'],
            ['Branch', branch?.name || '-'],
            ['Date', date || '-'],
            ['Time', time || '-'],
            ['Duration', service?.duration_minutes ? `${service.duration_minutes} min` : '-'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ color: '#888' }}>{k}</span>
              <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
            <span style={{ color: '#888' }}>Total Price</span>
            <span style={{ fontWeight: 700, color: '#1a1a2e' }}>{totalPrice.toLocaleString()} RWF</span>
          </div>
          {isBalance ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0' }}>
              <span style={{ color: '#15803D', fontWeight: 600 }}>Remaining Balance</span>
              <span style={{ fontWeight: 700, color: '#15803D' }}>{deposit.toLocaleString()} RWF</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ color: '#F39C12', fontWeight: 600 }}>Deposit (30%)</span>
                <span style={{ fontWeight: 700, color: '#F39C12' }}>{deposit.toLocaleString()} RWF now</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Balance on completion</span>
                <span style={{ fontWeight: 500, color: '#888' }}>{balance.toLocaleString()} RWF</span>
              </div>
            </>
          )}
        </div>

        {/* Payment method */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['momo', '📱 MTN MoMo'], ['airtel', '📱 Airtel Money']].map(([id, label]) => (
              <button key={id} onClick={() => setMethod(id)} style={{
                flex: 1, padding: '11px 12px', borderRadius: 9999,
                border: 'none', cursor: 'pointer',
                background: method === id ? '#1A5276' : '#F3F4F6',
                color: method === id ? 'white' : '#555',
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                transition: 'all 150ms',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>MoMo Phone Number</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', background: '#fafbfc', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }}
            placeholder="07xxxxxxxx"
          />
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>A payment prompt will be sent to this number</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button onClick={handlePay} style={{
          width: '100%', background: '#F39C12', color: '#1a1a2e', fontSize: 16, fontWeight: 700,
          padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 16px rgba(243,156,18,.25)',
        }}>
          Pay {deposit.toLocaleString()} RWF
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 10 }}>
          Secured by {methodLabel} · Payments processed in Rwanda
        </p>
      </div>
    </div>
  )
}
