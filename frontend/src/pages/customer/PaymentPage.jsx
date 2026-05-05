import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../../api/client'

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { booking, service, branch, date, time, dueNow } = location.state || {}
  const [method, setMethod] = useState('momo')
  const [phone, setPhone] = useState('')
  const [paymentState, setPaymentState] = useState('idle')
  const [error, setError] = useState('')
  const [paymentResult, setPaymentResult] = useState(null)

  if (!service || !branch) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: 14 }}>No booking details found.</p>
          <button onClick={() => navigate('/')} style={{ color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 12 }}>Go Home</button>
        </div>
      </div>
    )
  }

  const amountDue = dueNow ?? Math.round(Number(service.price || 0) * 0.3)
  const confNum = paymentResult ? `SS-${paymentResult.id}` : `SS-${booking?.id || Math.floor(10000 + Math.random() * 90000)}`

  const handlePay = async () => {
    if (!booking?.id) {
      setError('Missing booking details. Please book again.')
      return
    }
    setError('')
    setPaymentState('processing')
    try {
      const payload = {
        booking_id: booking.id,
        amount: amountDue,
        payment_type: 'deposit',
        method: method === 'momo' ? 'momo' : 'cash',
      }
      const { data } = await client.post('payments/initiate/', payload)
      setPaymentResult(data)
      setPaymentState('success')
    } catch (err) {
      setPaymentState('idle')
      setError(err.response?.data?.detail || 'Payment failed. Please try again.')
    }
  }

  const methodBtn = (id, logo, label, sub) => (
    <button key={id} onClick={() => setMethod(id)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      borderRadius: 12, border: `2px solid ${method === id ? '#2E86C1' : '#E9ECEF'}`,
      background: method === id ? '#EFF6FF' : 'white', cursor: 'pointer', width: '100%',
      transition: 'all 150ms', fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: id === 'momo' ? '#FFCC00' : '#DC143C',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: id === 'momo' ? '#333' : 'white', letterSpacing: '-0.02em' }}>{logo}</span>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{
        marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${method === id ? '#2E86C1' : '#E9ECEF'}`,
        background: method === id ? '#2E86C1' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {method === id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
      </div>
    </button>
  )

  if (paymentState === 'processing') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #E9ECEF', borderTopColor: '#2E86C1', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Processing Payment...</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Waiting for {method === 'momo' ? 'MTN MoMo' : 'Airtel Money'} confirmation</div>
      </div>
      <div style={{ background: '#FEF9EE', borderRadius: 12, padding: '12px 20px', fontSize: 13, color: '#888', textAlign: 'center', maxWidth: 280 }}>
        Check your phone for a payment prompt
      </div>
    </div>
  )

  if (paymentState === 'success') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Booking Confirmed!</div>
        <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>Your car wash is scheduled for {date} at {time}</div>
      </div>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', padding: '20px 24px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['Confirmation #', confNum, { fontWeight: 700, color: '#1A5276', letterSpacing: '0.05em' }],
          ['Service', service.name, { fontWeight: 600, color: '#1a1a2e' }],
          ['Branch', branch.name, { fontWeight: 600, color: '#1a1a2e' }],
          ['Amount Paid', `RWF ${Number(amountDue).toLocaleString()}`, { fontWeight: 700, color: '#1a1a2e' }],
        ].map(([k, v, style]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#888' }}>{k}</span><span style={style}>{v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: '#888' }}>Payment via</span>
          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{method === 'momo' ? 'MTN MoMo' : 'Airtel Money'}</span>
        </div>
        {paymentResult?.status_display && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#888' }}>Status</span>
            <span style={{ fontWeight: 600, color: '#15803D' }}>{paymentResult.status_display}</span>
          </div>
        )}
      </div>
      <button onClick={() => navigate('/bookings')} style={{ background: '#1A5276', color: 'white', fontSize: 14, fontWeight: 600, padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
        View My Bookings &rarr;
      </button>
      <button onClick={() => navigate('/')} style={{ background: 'none', color: '#888', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
        Back to Home
      </button>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0 }}>
          &larr; Back
        </button>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Complete Payment</h2>

        {/* Order summary */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Order Summary</div>
          {[['Service', service.name], ['Branch', branch.name], ['Date', date], ['Time', time], ['Duration', `${service.duration_minutes} min`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ color: '#888' }}>{k}</span><span style={{ fontWeight: 500, color: '#1a1a2e' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1A5276', paddingTop: 12, marginTop: 4 }}>
            <span>Deposit Due Now</span><span>RWF {Number(amountDue).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Payment Method</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {methodBtn('momo', 'MoMo', 'MTN Mobile Money', 'Recommended - Instant')}
            {methodBtn('airtel', 'AT', 'Airtel Money', 'Airtel Rwanda subscribers')}
          </div>
        </div>

        {/* Phone */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            {method === 'momo' ? 'MTN MoMo' : 'Airtel Money'} Phone Number
          </div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', background: '#fafbfc', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }}
            placeholder="078*******"
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
          fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 16px rgba(243,156,18,.25)', transition: 'all 150ms',
        }}>
          Pay RWF {Number(amountDue).toLocaleString()}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 10 }}>
          Secured by {method === 'momo' ? 'MTN MoMo' : 'Airtel Money'} - Payments processed in Rwanda
        </p>
      </div>
    </div>
  )
}
