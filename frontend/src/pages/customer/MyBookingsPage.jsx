import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'

const STORAGE_KEY = 'smartshine_pending_payment'

// Station wash progression
const STATION_FLOW = ['pending', 'confirmed', 'received', 'washing', 'rinsing', 'drying', 'done']
// Pickup progression (pre-wash driver phase)
const PICKUP_DRIVER_FLOW = ['pending', 'confirmed', 'driver_assigned', 'en_route_pickup', 'at_customer', 'en_route_branch']
// Post-wash shared
const WASH_FLOW = ['received', 'washing', 'rinsing', 'drying', 'done']

const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed',
  driver_assigned: 'Driver Assigned', en_route_pickup: 'Driver En Route',
  at_customer: 'Driver Arrived', en_route_branch: 'To Branch',
  received: 'Received', washing: 'Washing', rinsing: 'Rinsing', drying: 'Drying',
  done: 'Ready', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', collected: 'Collected', cancelled: 'Cancelled',
}

const ACTIVE_STATUSES  = [
  'pending', 'confirmed',
  'driver_assigned', 'en_route_pickup', 'at_customer', 'en_route_branch',
  'received', 'washing', 'rinsing', 'drying',
]
const DONE_STATUSES    = ['done', 'out_for_delivery']
const HISTORY_STATUSES = ['collected', 'delivered', 'cancelled']

const STATUS_STYLE = {
  pending:          { bg: '#FEF3C7', text: '#92400E' },
  confirmed:        { bg: '#DBEAFE', text: '#1D4ED8' },
  driver_assigned:  { bg: '#EDE9FE', text: '#7C3AED' },
  en_route_pickup:  { bg: '#E9D5FF', text: '#6D28D9' },
  at_customer:      { bg: '#CFFAFE', text: '#155E75' },
  en_route_branch:  { bg: '#FEF9C3', text: '#B45309' },
  received:         { bg: '#EDE9FE', text: '#6D28D9' },
  washing:          { bg: '#CFFAFE', text: '#155E75' },
  rinsing:          { bg: '#E9D5FF', text: '#7C3AED' },
  drying:           { bg: '#FEF9C3', text: '#B45309' },
  done:             { bg: '#DCFCE7', text: '#15803D' },
  out_for_delivery: { bg: '#DBEAFE', text: '#1D4ED8' },
  delivered:        { bg: '#D1FAE5', text: '#065F46' },
  collected:        { bg: '#D1FAE5', text: '#065F46' },
  cancelled:        { bg: '#FEE2E2', text: '#B91C1C' },
}

const PAYMENT_BADGE = {
  unpaid:       { bg: '#FEF3C7', text: '#92400E', label: 'Unpaid' },
  deposit_paid: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Deposit Paid' },
  fully_paid:   { bg: '#DCFCE7', text: '#15803D', label: 'Fully Paid' },
  refunded:     { bg: '#F3F4F6', text: '#6B7280', label: 'Refunded' },
}

const toLocalDT = (b) => {
  if (b.date && b.time_slot) return new Date(`${b.date}T${b.time_slot.slice(0, 5)}`)
  return null
}

function timeAgo(isoString) {
  if (!isoString) return null
  const diff = (Date.now() - new Date(isoString)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/* ─── Station Progress Bar ───────────────────────────────────────────────── */
function StationProgressBar({ status, statusUpdatedAt }) {
  const flow = STATION_FLOW
  const idx  = flow.indexOf(status)
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
        {flow.map((s, i) => {
          const done    = i < idx
          const current = i === idx
          return (
            <div key={s} style={{ display: 'contents' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#15803D' : current ? '#F39C12' : '#E9ECEF',
                  animation: current ? 'livePulse 1.8s ease-in-out infinite' : 'none',
                  transition: 'background 300ms', flexShrink: 0,
                }}>
                  {done    && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                  {current && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ fontSize: 9, fontWeight: current ? 700 : 400, whiteSpace: 'nowrap', color: done ? '#15803D' : current ? '#F39C12' : '#9CA3AF', fontFamily: "'DM Sans',sans-serif" }}>
                  {STATUS_LABEL[s]}
                </span>
              </div>
              {i < flow.length - 1 && (
                <div style={{ flex: 1, height: 2, minWidth: 8, background: i < idx ? '#15803D' : '#E9ECEF', margin: '0 2px', marginBottom: 16, transition: 'background 300ms' }} />
              )}
            </div>
          )
        })}
      </div>
      {statusUpdatedAt && (
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>
          Updated {timeAgo(statusUpdatedAt)}
        </div>
      )}
    </div>
  )
}

/* ─── Pickup Status Bar (driver journey + wash) ──────────────────────────── */
function PickupStatusBar({ booking }) {
  const status = booking.status

  const driverPhase = ['pending', 'confirmed', 'driver_assigned', 'en_route_pickup', 'at_customer', 'en_route_branch']
  const washPhase   = ['received', 'washing', 'rinsing', 'drying', 'done']
  const afterPhase  = ['out_for_delivery', 'delivered', 'collected']

  const inDriver = driverPhase.includes(status)
  const inWash   = washPhase.includes(status)
  const inAfter  = afterPhase.includes(status)

  const driverIcons = { pending: '⏳', confirmed: '✅', driver_assigned: '🚗', en_route_pickup: '🛣️', at_customer: '📍', en_route_branch: '🏁' }
  const driverLabels = { pending: 'Pending', confirmed: 'Confirmed', driver_assigned: 'Driver assigned', en_route_pickup: 'Driver on the way', at_customer: 'Driver arrived', en_route_branch: 'Taking car to branch' }

  return (
    <div style={{ marginTop: 14 }}>
      {/* Driver phase pill */}
      {(inDriver || inWash || inAfter) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
            {inDriver ? 'Driver Phase' : inWash ? 'Wash Phase' : 'Return Phase'}
          </div>

          {inDriver && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F3FF', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 20 }}>{driverIcons[status] || '🚗'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4C1D95', fontFamily: "'DM Sans',sans-serif" }}>{driverLabels[status] || STATUS_LABEL[status]}</div>
                {booking.status_updated_at && <div style={{ fontSize: 10, color: '#7C3AED', fontFamily: "'DM Sans',sans-serif" }}>Updated {timeAgo(booking.status_updated_at)}</div>}
              </div>
              {booking.assigned_driver_name && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#4C1D95', fontFamily: "'DM Sans',sans-serif" }}>{booking.assigned_driver_name}</div>
                  <div style={{ fontSize: 10, color: '#7C3AED', fontFamily: "'DM Sans',sans-serif" }}>Your driver</div>
                </div>
              )}
            </div>
          )}

          {inWash && <StationProgressBar status={status} statusUpdatedAt={booking.status_updated_at} />}

          {inAfter && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: status === 'delivered' || status === 'collected' ? '#F0FDF4' : '#EFF6FF', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 20 }}>{status === 'out_for_delivery' ? '🚚' : status === 'delivered' ? '✅' : '🔓'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: status === 'out_for_delivery' ? '#1D4ED8' : '#065F46', fontFamily: "'DM Sans',sans-serif" }}>
                  {status === 'out_for_delivery' ? 'Your car is on its way to you!' : status === 'delivered' ? 'Car delivered successfully' : 'Car collected — all done!'}
                </div>
                {booking.status_updated_at && <div style={{ fontSize: 10, color: '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>Updated {timeAgo(booking.status_updated_at)}</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Done Banner (station) ──────────────────────────────────────────────── */
function DoneBanner({ booking, onPayBalance, onChooseReturn, onShowQR }) {
  const balance = Math.round(Number(booking.service_price || 0) * 0.7)
  const isPickup = booking.service_type === 'pickup'

  return (
    <div style={{ marginTop: 14, background: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)', borderRadius: 12, padding: '16px 18px', border: '1.5px solid #86EFAC' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>🎉</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>
        {isPickup ? 'Your car is washed and ready!' : 'Your car is ready for pickup!'}
      </div>
      {!isPickup && booking.branch_address && (
        <div style={{ fontSize: 12, color: '#166534', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
          📍 {booking.branch_name} — {booking.branch_address}
        </div>
      )}

      {/* Payment section */}
      {booking.payment_status === 'deposit_paid' && balance > 0 && (
        <button onClick={() => onPayBalance(booking)} style={{ background: '#15803D', color: 'white', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 12px rgba(21,128,61,.3)', marginRight: 8, marginBottom: 8 }}>
          💳 Pay Balance — {balance.toLocaleString()} RWF
        </button>
      )}
      {booking.payment_status === 'fully_paid' && (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>✓ Fully paid</div>
      )}

      {/* Pickup return method selection */}
      {isPickup && !booking.return_method && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065F46', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>How would you like your car returned?</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => onChooseReturn(booking, 'delivery')} style={{ flex: 1, minWidth: 120, padding: '11px 16px', background: '#1A5276', color: 'white', fontSize: 13, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              🚗 Deliver to Me
            </button>
            <button onClick={() => onChooseReturn(booking, 'self_pickup')} style={{ flex: 1, minWidth: 120, padding: '11px 16px', background: 'white', color: '#15803D', fontSize: 13, fontWeight: 700, borderRadius: 10, border: '1.5px solid #86EFAC', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              📍 I'll Pick Up
            </button>
          </div>
        </div>
      )}

      {/* QR code for self pickup */}
      {isPickup && booking.return_method === 'self_pickup' && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: '#166534', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Show your QR code at the gate to collect your car.</div>
          <button onClick={() => onShowQR(booking)} style={{ padding: '9px 18px', background: 'white', color: '#15803D', fontSize: 13, fontWeight: 700, borderRadius: 10, border: '1.5px solid #86EFAC', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            📱 Show QR Code
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── QR Code Modal ──────────────────────────────────────────────────────── */
function QRModal({ booking, onClose }) {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`bookings/${booking.id}/qr-code/`)
      .then(({ data }) => { setQrData(data); setLoading(false) })
      .catch(err => { setError(err.response?.data?.detail || 'Failed to load QR code.'); setLoading(false) })
  }, [booking.id])

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>Gate QR Code</h3>
        <p style={{ fontSize: 13, color: '#888', fontFamily: "'DM Sans',sans-serif", marginBottom: 20 }}>Show this to the gate worker to collect your car</p>

        {loading && <div style={{ padding: 40, color: '#888', fontFamily: "'DM Sans',sans-serif" }}>Loading...</div>}
        {error && <div style={{ padding: 20, color: '#B91C1C', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{error}</div>}
        {qrData?.qr_code && (
          <>
            <img src={qrData.qr_code} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 12 }} />
            <div style={{ fontSize: 13, color: '#888', fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>Booking Ref</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: '#1A5276', letterSpacing: '0.08em', marginBottom: 20 }}>{qrData.booking_ref}</div>
          </>
        )}
        <button onClick={onClose} style={{ width: '100%', padding: '12px 0', background: '#1A5276', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
          Close
        </button>
      </div>
    </div>
  )
}

/* ─── LIVE Badge ─────────────────────────────────────────────────────────── */
function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: '#DC2626', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif" }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', animation: 'liveDot 1.4s ease-in-out infinite', display: 'inline-block' }} />
      LIVE
    </span>
  )
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#065F46', color: 'white', borderRadius: 12, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 24px rgba(0,0,0,.18)', zIndex: 9999, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", animation: 'toastIn 0.3s ease', whiteSpace: 'nowrap' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
      {message}
    </div>
  )
}

/* ─── Cancel Modal ───────────────────────────────────────────────────────── */
function CancelModal({ booking, onConfirm, onClose, cancelling }) {
  const dt = toLocalDT(booking)
  const displayTime = dt ? dt.toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' }) : '-'
  const hoursUntil  = dt ? (dt - new Date()) / 3600000 : Infinity
  const hasPaidDeposit = ['deposit_paid', 'fully_paid'].includes(booking.payment_status)

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.2)', animation: 'modalIn 0.2s ease' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>Cancel this booking?</h3>
        <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
          {[['Service', booking.service_name || '-'], ['Branch', booking.branch_name || '-'], ['Date & Time', displayTime]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ color: '#888' }}>{k}</span>
              <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{v}</span>
            </div>
          ))}
        </div>
        {!hasPaidDeposit ? (
          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#15803D', marginBottom: 20, fontFamily: "'DM Sans',sans-serif" }}>
            No deposit paid — cancelled at no charge.
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Cancellation Policy</div>
            {hoursUntil > 2
              ? <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#1D4ED8', fontFamily: "'DM Sans',sans-serif" }}>Full refund within 24 hours.</div>
              : <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#92400E', fontFamily: "'DM Sans',sans-serif" }}>50% refund (within 2 hours of appointment).</div>}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'white', border: '1.5px solid #E9ECEF', color: '#555', fontSize: 14, fontWeight: 600, padding: '11px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Keep Booking</button>
          <button onClick={() => onConfirm(booking.id)} disabled={cancelling} style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, padding: '11px 16px', borderRadius: 10, cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: cancelling ? 0.7 : 1 }}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('active')
  const [payingId, setPayingId]       = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelling, setCancelling]   = useState(false)
  const [toast, setToast]             = useState('')
  const [qrModal, setQrModal]         = useState(null)
  const [settingReturn, setSettingReturn] = useState(null)
  const pollingRef = useRef(null)

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await client.get('bookings/')
      setBookings(data.results ?? data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    pollingRef.current = setInterval(fetchBookings, 10000)
    return () => clearInterval(pollingRef.current)
  }, [fetchBookings])

  const active      = bookings.filter(b => [...ACTIVE_STATUSES, ...DONE_STATUSES].includes(b.status))
  const historyList = bookings.filter(b => HISTORY_STATUSES.includes(b.status))
  const list        = tab === 'active' ? active : historyList

  const handlePayDeposit = async (bookingId) => {
    setPayingId(bookingId)
    try {
      const { data: bd } = await client.get(`bookings/${bookingId}/`)
      const service  = { name: bd.service_name, price: bd.service_price, duration_minutes: bd.service_duration_minutes }
      const branch   = { name: bd.branch_name, address: bd.branch_address }
      const dt       = toLocalDT(bd)
      const date     = dt ? dt.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' }) : bd.date
      const time     = bd.time_slot ? bd.time_slot.slice(0, 5) : ''
      const deposit  = Math.round(Number(bd.service_price || 0) * 0.3)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ booking: bd, service, branch, date, time, dueNow: deposit, paymentType: 'deposit' }))
      navigate('/payment')
    } catch {
      alert('Could not load booking details. Please try again.')
    }
    setPayingId(null)
  }

  const handlePayBalance = async (booking) => {
    const totalPrice = Number(booking.service_price || 0)
    const balance    = Math.round(totalPrice * 0.7)
    const service    = { name: booking.service_name, price: booking.service_price }
    const branch     = { name: booking.branch_name, address: booking.branch_address }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ booking, service, branch, date: booking.date, time: booking.time_slot?.slice(0, 5), dueNow: balance, paymentType: 'balance' }))
    navigate('/payment')
  }

  const handleChooseReturn = async (booking, method) => {
    setSettingReturn(booking.id)
    try {
      const { data } = await client.patch(`bookings/${booking.id}/return-method/`, { method })
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...data } : b))
      if (method === 'self_pickup') setQrModal({ ...booking, ...data })
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to set return method.')
    }
    setSettingReturn(null)
  }

  const handleCancelConfirm = useCallback(async (bookingId) => {
    setCancelling(true)
    try {
      await client.patch(`bookings/${bookingId}/cancel/`)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      setCancelModal(null)
      setToast('Booking cancelled successfully')
    } catch {
      setCancelModal(null)
      setToast('Failed to cancel. Please try again.')
    }
    setCancelling(false)
  }, [])

  const needsPayment = (b) => b.payment_status === 'unpaid'
  const canCancel    = (b) => ['pending', 'confirmed'].includes(b.status)
  const isActiveStatus = (b) => ACTIVE_STATUSES.includes(b.status)
  const isDone       = (b) => b.status === 'done'

  const css = `
    @keyframes toastIn { from { transform: translateX(-50%) translateY(-16px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    @keyframes modalIn { from { transform: scale(.96) translateY(8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    @keyframes liveDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.7); } }
    @keyframes livePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(243,156,18,.5); } 50% { box-shadow: 0 0 0 6px rgba(243,156,18,0); } }
  `

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <style>{css}</style>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {cancelModal && <CancelModal booking={cancelModal} onConfirm={handleCancelConfirm} onClose={() => setCancelModal(null)} cancelling={cancelling} />}
      {qrModal && <QRModal booking={qrModal} onClose={() => setQrModal(null)} />}

      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>My Bookings</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 12, padding: 4, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)', width: 'fit-content' }}>
          {[['active', `Active (${active.length})`], ['history', `History (${historyList.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms', background: tab === id ? '#1A5276' : 'transparent', color: tab === id ? 'white' : '#888' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                <div style={{ height: 16, background: '#E9ECEF', borderRadius: 8, width: '40%', marginBottom: 10 }} />
                <div style={{ height: 12, background: '#E9ECEF', borderRadius: 6, width: '70%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(b => {
              const sc     = STATUS_STYLE[b.status] || { bg: '#F3F4F6', text: '#6B7280' }
              const pBadge = PAYMENT_BADGE[b.payment_status]
              const dt     = toLocalDT(b)
              const displayTime = dt ? dt.toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' }) : (b.date || '-')
              const isPickup = b.service_type === 'pickup'

              const showPayBtn    = needsPayment(b) && canCancel(b) && tab === 'active'
              const showCancelBtn = canCancel(b) && tab === 'active'

              const showStationProgress = tab === 'active' && !isDone(b) && !isPickup && STATION_FLOW.includes(b.status) && isActiveStatus(b)
              const showPickupProgress  = tab === 'active' && isPickup && !['collected', 'delivered'].includes(b.status)
              const showDoneBanner      = tab === 'active' && isDone(b)

              return (
                <div key={b.id} style={{
                  background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                  padding: '16px 20px',
                  border: isActiveStatus(b) ? '1.5px solid #DBEAFE' : isDone(b) ? '1.5px solid #86EFAC' : '1.5px solid transparent',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
                          {b.booking_ref || `#${b.id}`} — {b.branch_name || 'Branch'}
                        </div>
                        {isPickup && <span style={{ fontSize: 10, fontWeight: 700, background: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: 9999, fontFamily: "'DM Sans',sans-serif" }}>PICKUP</span>}
                        {isActiveStatus(b) && !isDone(b) && <LiveBadge />}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>
                        {b.service_name || 'Service'} · {displayTime}
                      </div>
                      {b.vehicle_plate && (
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 1, fontFamily: 'monospace' }}>
                          {b.vehicle_plate} {b.vehicle_make ? `· ${b.vehicle_make} ${b.vehicle_model}` : ''}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                      <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, textTransform: 'capitalize', fontFamily: "'DM Sans',sans-serif" }}>
                        {STATUS_LABEL[b.status] || (b.status || '').replace(/_/g, ' ')}
                      </span>
                      {pBadge && (
                        <span style={{ background: pBadge.bg, color: pBadge.text, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, fontFamily: "'DM Sans',sans-serif" }}>
                          {pBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress tracking */}
                  {showStationProgress && <StationProgressBar status={b.status} statusUpdatedAt={b.status_updated_at} />}
                  {showPickupProgress && <PickupStatusBar booking={b} />}

                  {/* Done banner */}
                  {showDoneBanner && (
                    <DoneBanner
                      booking={b}
                      onPayBalance={handlePayBalance}
                      onChooseReturn={handleChooseReturn}
                      onShowQR={setQrModal}
                    />
                  )}

                  {/* Out for delivery tracking */}
                  {b.status === 'out_for_delivery' && tab === 'active' && (
                    <div style={{ marginTop: 14, background: '#EFF6FF', borderRadius: 12, padding: '14px 16px', border: '1.5px solid #BFDBFE' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>🚚</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8', fontFamily: "'DM Sans',sans-serif" }}>Your car is on its way!</div>
                          <div style={{ fontSize: 12, color: '#3B82F6', fontFamily: "'DM Sans',sans-serif" }}>Your driver is delivering your freshly washed car.</div>
                        </div>
                      </div>
                      {b.assigned_driver_name && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#1D4ED8', fontFamily: "'DM Sans',sans-serif" }}>
                          Driver: <strong>{b.assigned_driver_name}</strong> {b.assigned_driver_phone ? `· ${b.assigned_driver_phone}` : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  {(showPayBtn || showCancelBtn) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                      {showPayBtn && (
                        <button
                          onClick={() => handlePayDeposit(b.id)}
                          disabled={payingId === b.id}
                          style={{ background: '#F39C12', color: '#1a1a2e', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: payingId === b.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: payingId === b.id ? 0.7 : 1 }}
                        >
                          {payingId === b.id ? 'Loading...' : '💳 Pay Deposit'}
                        </button>
                      )}
                      {showCancelBtn && (
                        <button
                          onClick={() => setCancelModal(b)}
                          style={{ background: 'transparent', color: '#DC2626', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #DC2626', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}

                  {/* Self-pickup QR button if already chose */}
                  {b.return_method === 'self_pickup' && b.status === 'done' && tab === 'active' && (
                    <div style={{ marginTop: 10 }}>
                      <button onClick={() => setQrModal(b)} style={{ padding: '9px 18px', background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 700, borderRadius: 10, border: '1.5px solid #86EFAC', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                        📱 Show Gate QR Code
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {list.length === 0 && (
              <p style={{ color: '#aaa', fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
                No {tab === 'active' ? 'active' : 'past'} bookings.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
