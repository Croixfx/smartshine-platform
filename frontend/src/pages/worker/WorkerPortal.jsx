import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1',
  accent: '#F39C12', bg: '#F0F4F8', surface: '#FFFFFF', border: '#E2E8F0',
  text: '#1E293B', sub: '#64748B', dim: '#94A3B8',
  success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D',
  warning: '#F59E0B', warningBg: '#FEF3C7', warningText: '#92400E',
  sidebar: '#0F2744',
}

const STATUS_FLOW = ['received', 'washing', 'rinsing', 'drying', 'done']
const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed',
  received: 'Received', washing: 'Washing', rinsing: 'Rinsing', drying: 'Drying',
  done: 'Done', collected: 'Collected',
  driver_assigned: 'Driver Assigned', en_route_pickup: 'En Route',
  at_customer: 'At Customer', en_route_branch: 'To Branch',
}
const STEP_ACTION = {
  received: 'Start Washing', washing: 'Start Rinsing',
  rinsing: 'Start Drying', drying: 'Mark as Done ✨',
}
const STEP_COLOR = {
  received: '#2E86C1', washing: '#8B5CF6', rinsing: '#D97706', drying: '#22C55E',
}

const f = (size, weight = 400, color = C.text) => ({
  fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color,
})
const card = (extra = {}) => ({
  background: C.surface, borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,.07)', padding: 20, ...extra,
})
const statusBadge = (s) => {
  const map = {
    pending:   { bg: '#FEF3C7', text: '#92400E' },
    confirmed: { bg: '#DBEAFE', text: '#1D4ED8' },
    received:  { bg: '#EDE9FE', text: '#7C3AED' },
    washing:   { bg: '#DBEAFE', text: '#1E40AF' },
    rinsing:   { bg: '#E9D5FF', text: '#6D28D9' },
    drying:    { bg: '#FEF9C3', text: '#B45309' },
    done:      { bg: '#D1FAE5', text: '#065F46' },
    collected: { bg: '#DCFCE7', text: '#166534' },
  }
  const sc = map[s] || { bg: '#F1F5F9', text: '#64748B' }
  return {
    background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700,
    padding: '3px 10px', borderRadius: 9999, display: 'inline-block',
    textTransform: 'capitalize',
  }
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const QueueIcon   = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
const ActiveIcon  = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const HistoryIcon = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/></svg>
const GateIcon    = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
const CameraIcon  = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const LogoutIcon  = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const RefreshIcon = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
const CheckIcon   = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>

function useDesktop(bp = 900) {
  const [d, setD] = useState(() => window.innerWidth >= bp)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${bp}px)`)
    const h = e => setD(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [bp])
  return d
}

const isToday = (dateStr) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

const mapBooking = (b) => ({
  id: b.id,
  booking_ref: b.booking_ref,
  plate: b.vehicle_plate || `#${b.id}`,
  vehicle_make: b.vehicle_make || '',
  vehicle_model: b.vehicle_model || '',
  vehicle_color: b.vehicle_color || '',
  vehicle_info: [b.vehicle_make, b.vehicle_model, b.vehicle_color].filter(Boolean).join(' · '),
  service_name: b.service_name || 'Service',
  service_duration: b.service_duration_minutes ? `${b.service_duration_minutes} min` : '--',
  customer_name: b.customer_name || 'Customer',
  customer_phone: b.customer_phone || '',
  scheduled_time: b.time_slot ? b.time_slot.slice(0, 5) : '--:--',
  date: b.date || '',
  status: b.status,
  payment_status: b.payment_status,
  branch_name: b.branch_name || '',
  status_updated_at: b.status_updated_at,
  updated_at: b.updated_at,
})

/* ─── Sidebar (desktop) ──────────────────────────────────────────────────── */
function Sidebar({ page, setPage, workerName, queueCount, activeCount, gateCount, logout }) {
  const nav = [
    { id: 'queue',   label: 'Queue',        Icon: QueueIcon,   count: queueCount },
    { id: 'active',  label: 'Active Jobs',  Icon: ActiveIcon,  count: activeCount },
    { id: 'gate',    label: 'Release Gate', Icon: GateIcon,    count: gateCount },
    { id: 'history', label: 'History',      Icon: HistoryIcon, count: null },
  ]
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Worker Portal</div>
      </div>
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {nav.map(({ id, label, Icon, count }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
              borderRadius: 9, marginBottom: 2, cursor: 'pointer', textAlign: 'left',
              background: active ? 'rgba(255,255,255,.11)' : 'none',
              border: `1px solid ${active ? 'rgba(255,255,255,.16)' : 'transparent'}`,
              color: active ? 'white' : 'rgba(255,255,255,.45)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400,
            }}>
              <Icon />
              {label}
              {count != null && count > 0 && (
                <span style={{ marginLeft: 'auto', background: id === 'gate' ? '#DC2626' : C.accent, color: id === 'gate' ? 'white' : '#1a1a2e', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 9999 }}>{count}</span>
              )}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '16px 20px 28px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={f(13, 600, 'rgba(255,255,255,.9)')}>{workerName}</div>
          <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Worker</div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          <LogoutIcon />Logout
        </button>
      </div>
    </aside>
  )
}

/* ─── Bottom nav (mobile) ────────────────────────────────────────────────── */
function BottomNav({ page, setPage, gateCount }) {
  const tabs = [
    { id: 'queue',   label: 'Queue',   Icon: QueueIcon },
    { id: 'active',  label: 'Active',  Icon: ActiveIcon },
    { id: 'gate',    label: 'Gate',    Icon: GateIcon },
    { id: 'history', label: 'History', Icon: HistoryIcon },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = page === id
        return (
          <button key={id} onClick={() => setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0 9px', background: 'none', border: 'none', cursor: 'pointer', color: active ? (id === 'gate' ? '#DC2626' : C.primary) : C.dim, position: 'relative' }}>
            {active && <div style={{ position: 'absolute', top: 0, width: 36, height: 2, borderRadius: 1, background: id === 'gate' ? '#DC2626' : C.primary }} />}
            {id === 'gate' && gateCount > 0 && !active && (
              <span style={{ position: 'absolute', top: 6, right: 'calc(50% - 16px)', background: '#DC2626', color: 'white', fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 9999 }}>{gateCount}</span>
            )}
            <Icon />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Done confirmation modal ────────────────────────────────────────────── */
function DoneModal({ job, onConfirm, onClose, busy }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>✨</div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 8px', textAlign: 'center' }}>Mark as Ready?</h3>
        <p style={f(13, 400, C.sub)}>This will notify the customer that their car is ready for pickup.</p>
        <div style={{ background: C.bg, borderRadius: 10, padding: '12px 16px', margin: '16px 0' }}>
          {[
            ['Plate', job.plate],
            ['Vehicle', job.vehicle_info || `${job.vehicle_make} ${job.vehicle_model}`],
            ['Service', job.service_name],
            ['Customer', job.customer_name],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
              <span style={{ color: C.sub }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', ...f(14, 600, C.sub) }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ flex: 1, padding: '11px 0', background: C.success, border: 'none', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer', ...f(14, 700, 'white'), opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Marking...' : 'Yes, Done! ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Gate Release Modal ─────────────────────────────────────────────────── */
function GateModal({ job, onRelease, onClose, busy }) {
  const [plateText, setPlateText] = useState(job.plate || '')
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCameraActive(true)
      setCameraError('')
    } catch (err) {
      setCameraError('Camera unavailable: ' + err.message)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => { setCapturedBlob(blob); stopCamera() }, 'image/jpeg', 0.82)
  }

  const notPaid = job.payment_status !== 'fully_paid'

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Release Gate</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: C.dim, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Booking summary */}
        <div style={{ background: C.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
          {[
            ['Plate', job.plate],
            ['Vehicle', job.vehicle_info || '—'],
            ['Customer', job.customer_name],
            ['Service', job.service_name],
            ['Payment', (job.payment_status || '').replace(/_/g, ' ')],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ color: C.sub }}>{k}</span>
              <span style={{ fontWeight: 600, color: k === 'Payment' && !notPaid ? '#15803D' : C.text, textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Payment gate */}
        {notPaid && (
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400E', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
            ⚠ Balance not paid — car cannot be released until the customer settles the full balance.
          </div>
        )}

        {/* Camera capture */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exit Plate Photo (optional)</div>
          {!cameraActive && !capturedBlob && (
            <button onClick={startCamera} style={{ width: '100%', padding: '11px 0', background: C.bg, border: '1.5px dashed #CBD5E1', borderRadius: 10, cursor: 'pointer', color: C.sub, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CameraIcon /> Open Camera
            </button>
          )}
          {cameraError && <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>{cameraError}</div>}
          {cameraActive && (
            <div>
              <video ref={videoRef} style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 200, objectFit: 'cover' }} muted playsInline />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={capture} style={{ flex: 1, padding: '10px 0', background: C.primary, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>📸 Capture Plate</button>
                <button onClick={stopCamera} style={{ padding: '10px 14px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: C.sub, fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              </div>
            </div>
          )}
          {capturedBlob && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 22 }}>📷</span>
              <span style={{ flex: 1, fontSize: 12, color: '#15803D', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Photo captured</span>
              <button onClick={() => setCapturedBlob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>Re-take</button>
            </div>
          )}
        </div>

        {/* Plate text */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.dim, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Plate Number</label>
          <input
            value={plateText}
            onChange={e => setPlateText(e.target.value)}
            style={{ width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', fontSize: 16, fontFamily: 'monospace', color: C.text, outline: 'none', boxSizing: 'border-box', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            placeholder="RAB 123 A"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', ...f(14, 600, C.sub) }}>Cancel</button>
          <button
            onClick={() => onRelease({ plateText, capturedBlob })}
            disabled={busy || notPaid}
            style={{ flex: 1, padding: '12px 0', background: busy || notPaid ? '#CBD5E1' : '#15803D', color: 'white', border: 'none', borderRadius: 10, cursor: busy || notPaid ? 'not-allowed' : 'pointer', ...f(14, 700, 'white') }}
          >
            {busy ? 'Releasing...' : notPaid ? '⚠ Balance Unpaid' : 'Release Car ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Status Stepper (shared) ────────────────────────────────────────────── */
function StatusStepper({ currentStatus }) {
  const idx = STATUS_FLOW.indexOf(currentStatus)
  return (
    <div style={{ padding: '12px 0' }}>
      {STATUS_FLOW.map((s, i) => {
        const done   = i < idx
        const active = i === idx
        const future = i > idx
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? C.primary : active ? C.accent : '#E2E8F0',
                transition: 'all 250ms',
              }}>
                {done   && <CheckIcon />}
                {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white', animation: 'wPulse 1.5s ease-in-out infinite' }} />}
                {future && <span style={f(11, 700, '#CBD5E1')}>{i + 1}</span>}
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div style={{ width: 2, height: 24, background: i < idx ? C.primary : '#E2E8F0', transition: 'background 250ms' }} />
              )}
            </div>
            <div style={{ paddingTop: 5, paddingBottom: i < STATUS_FLOW.length - 1 ? 12 : 0 }}>
              <div style={f(14, active ? 700 : 400, active ? C.text : future ? C.dim : C.sub)}>
                {STATUS_LABELS[s]}
              </div>
              {active && <div style={f(11, 400, C.accent)}>In progress</div>}
              {done   && <div style={f(11, 400, C.dim)}>Completed</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Active Job Card ────────────────────────────────────────────────────── */
function ActiveJobCard({ job, onAdvance, advancing }) {
  const busy  = advancing === job.id
  const isDone = job.status === 'done'
  const actionLabel = STEP_ACTION[job.status]
  const actionColor = STEP_COLOR[job.status] || C.secondary

  return (
    <div style={card({ marginBottom: 16 })}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{job.plate}</div>
          <div style={f(13, 400, C.sub)}>{job.vehicle_info}</div>
          <div style={f(12, 400, C.dim)}>Customer: {job.customer_name} · {job.customer_phone}</div>
        </div>
        <span style={statusBadge(job.status)}>{STATUS_LABELS[job.status]}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['Service', job.service_name], ['Duration', job.service_duration], ['Scheduled', job.scheduled_time]].map(([k, v]) => (
          <div key={k} style={{ background: C.bg, borderRadius: 8, padding: '8px 12px', minWidth: 80 }}>
            <div style={f(9, 700, C.dim)}>{k.toUpperCase()}</div>
            <div style={f(13, 600)}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'end' }}>
        <StatusStepper currentStatus={job.status} />
        {!isDone && (
          <button
            onClick={() => onAdvance(job)}
            disabled={busy}
            style={{
              padding: '12px 20px', background: busy ? '#CBD5E1' : actionColor, color: 'white',
              border: 'none', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
              whiteSpace: 'nowrap', minWidth: 140,
              boxShadow: busy ? 'none' : '0 4px 12px rgba(0,0,0,.15)',
            }}
          >
            {busy ? 'Updating...' : actionLabel}
          </button>
        )}
        {isDone && (
          <div style={{ background: C.successBg, borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
            <div style={f(13, 700, C.successText)}>Job Complete!</div>
            <div style={f(11, 400, C.dim)}>See Gate tab to release</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Queue Tab ──────────────────────────────────────────────────────────── */
function QueueTab({ queue, onConfirm, onMarkReceived, confirming, advancing, isDesktop }) {
  const pending   = queue.filter(j => j.status === 'pending')
  const confirmed = queue.filter(j => j.status === 'confirmed')

  if (isDesktop) {
    const th = { padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }
    const td = { padding: '12px 16px', borderBottom: `1px solid ${C.border}` }

    const renderSection = (title, jobs, isPending) => (
      jobs.length > 0 && (
        <>
          <tr style={{ display: 'table-row' }}>
            <td colSpan={7} style={{ padding: '10px 20px 6px', borderBottom: `1px solid ${C.border}`, background: isPending ? '#FFFBEB' : '#F0F9FF' }}>
              <span style={f(11, 700, isPending ? C.warningText : C.secondary)}>{title} ({jobs.length})</span>
            </td>
          </tr>
          {jobs.map(job => (
            <tr key={job.id} style={{ display: 'table-row', background: 'white' }}>
              <td style={td}><span style={f(14, 700)}>{job.plate}</span></td>
              <td style={td}><span style={f(13, 400, C.sub)}>{job.vehicle_info || '—'}</span></td>
              <td style={td}><span style={f(13, 400)}>{job.service_name}</span></td>
              <td style={td}><span style={f(12, 600, C.primary)}>{job.scheduled_time}</span></td>
              <td style={td}><span style={f(12, 400, C.sub)}>{job.date}</span></td>
              <td style={td}><span style={statusBadge(job.status)}>{STATUS_LABELS[job.status]}</span></td>
              <td style={{ ...td, textAlign: 'right' }}>
                {isPending ? (
                  <button onClick={() => onConfirm(job)} disabled={confirming === job.id} style={{ padding: '7px 16px', background: confirming === job.id ? '#CBD5E1' : C.secondary, color: 'white', border: 'none', borderRadius: 8, cursor: confirming === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
                    {confirming === job.id ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                ) : (
                  <button onClick={() => onMarkReceived(job)} disabled={advancing === job.id} style={{ padding: '7px 16px', background: advancing === job.id ? '#CBD5E1' : C.accent, color: '#1a1a2e', border: 'none', borderRadius: 8, cursor: advancing === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700 }}>
                    {advancing === job.id ? 'Updating...' : 'Mark as Received'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </>
      )
    )

    return (
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={f(16, 700)}>Job Queue</div>
          <div style={f(13, 400, C.sub)}>{pending.length} pending confirmation · {confirmed.length} waiting to receive</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Plate No.', 'Vehicle', 'Service', 'Time', 'Date', 'Status', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {renderSection('AWAITING CONFIRMATION', pending, true)}
              {renderSection('AWAITING VEHICLE', confirmed, false)}
              {queue.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48 }}>
                  <div style={f(15, 600, C.success)}>Queue is clear!</div>
                  <div style={f(13, 400, C.dim)}>Great work today.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {queue.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={f(15, 600, C.success)}>Queue Clear</div>
          <div style={f(13, 400, C.dim)}>Great work!</div>
        </div>
      )}
      {pending.length > 0 && <div style={f(11, 700, C.warningText)}>AWAITING CONFIRMATION</div>}
      {pending.map(job => (
        <div key={job.id} style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={f(16, 700)}>{job.plate}</span>
                <span style={statusBadge(job.status)}>{STATUS_LABELS[job.status]}</span>
              </div>
              <div style={f(12, 400, C.sub)}>{job.service_name} · {job.vehicle_info}</div>
              <div style={f(11, 400, C.dim)}>{job.customer_name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={f(14, 600, C.primary)}>{job.scheduled_time}</div>
              <div style={f(11, 400, C.dim)}>{job.date}</div>
            </div>
          </div>
          <button onClick={() => onConfirm(job)} disabled={confirming === job.id} style={{ width: '100%', height: 44, background: confirming === job.id ? '#CBD5E1' : C.secondary, color: 'white', fontSize: 14, fontWeight: 700, borderRadius: 10, border: 'none', cursor: confirming === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            {confirming === job.id ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      ))}
      {confirmed.length > 0 && <div style={{ ...f(11, 700, C.secondary), marginTop: 4 }}>AWAITING VEHICLE</div>}
      {confirmed.map(job => (
        <div key={job.id} style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={f(16, 700)}>{job.plate}</span>
                <span style={statusBadge(job.status)}>{STATUS_LABELS[job.status]}</span>
              </div>
              <div style={f(12, 400, C.sub)}>{job.service_name} · {job.vehicle_info}</div>
              <div style={f(11, 400, C.dim)}>{job.customer_name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={f(14, 600, C.primary)}>{job.scheduled_time}</div>
              <div style={f(11, 400, C.dim)}>{job.date}</div>
            </div>
          </div>
          <button onClick={() => onMarkReceived(job)} disabled={advancing === job.id} style={{ width: '100%', height: 44, background: advancing === job.id ? '#CBD5E1' : C.accent, color: '#1a1a2e', fontSize: 14, fontWeight: 700, borderRadius: 10, border: 'none', cursor: advancing === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            {advancing === job.id ? 'Updating...' : 'Mark as Received'}
          </button>
        </div>
      ))}
    </div>
  )
}

/* ─── Active Tab ─────────────────────────────────────────────────────────── */
function ActiveTab({ activeJobs, onAdvance, advancing }) {
  if (activeJobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
        <div style={f(16, 600, C.sub)}>No active jobs</div>
        <div style={f(13, 400, C.dim)}>Mark a booking as Received from the Queue to start</div>
      </div>
    )
  }
  return (
    <div style={{ padding: 0 }}>
      {activeJobs.map(job => (
        <ActiveJobCard key={job.id} job={job} onAdvance={onAdvance} advancing={advancing} />
      ))}
    </div>
  )
}

/* ─── Gate Tab (plate capture + release) ─────────────────────────────────── */
function GateTab({ gateJobs, onOpenGate, releasing, isDesktop }) {
  if (gateJobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <div style={f(16, 600, C.sub)}>No cars ready for pickup</div>
        <div style={f(13, 400, C.dim)}>Finished washes will appear here for gate release</div>
      </div>
    )
  }

  if (isDesktop) {
    const th = { padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }
    const td = { padding: '12px 16px', borderBottom: `1px solid ${C.border}` }
    return (
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={f(16, 700)}>Release Gate</div>
          <div style={f(13, 400, C.sub)}>{gateJobs.length} car{gateJobs.length !== 1 ? 's' : ''} ready for pickup — verify plate and release</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Plate', 'Vehicle', 'Customer', 'Service', 'Payment', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {gateJobs.map(job => {
              const paid = job.payment_status === 'fully_paid'
              return (
                <tr key={job.id}>
                  <td style={td}><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{job.plate}</span></td>
                  <td style={td}><span style={f(13, 400, C.sub)}>{job.vehicle_info || '—'}</span></td>
                  <td style={td}><div style={f(13, 600)}>{job.customer_name}</div><div style={f(11, 400, C.dim)}>{job.customer_phone}</div></td>
                  <td style={td}><span style={f(13, 400)}>{job.service_name}</span></td>
                  <td style={td}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: paid ? '#D1FAE5' : '#FEF3C7', color: paid ? '#065F46' : '#92400E', textTransform: 'capitalize' }}>
                      {(job.payment_status || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenGate(job)}
                      disabled={releasing === job.id}
                      style={{ padding: '8px 18px', background: releasing === job.id ? '#CBD5E1' : paid ? '#15803D' : '#F59E0B', color: paid ? 'white' : '#1a1a2e', border: 'none', borderRadius: 8, cursor: releasing === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700 }}
                    >
                      {releasing === job.id ? 'Releasing...' : paid ? '🔓 Release Car' : '⚠ View (Unpaid)'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={f(11, 700, '#B91C1C')}>CARS READY FOR PICKUP ({gateJobs.length})</div>
      {gateJobs.map(job => {
        const paid = job.payment_status === 'fully_paid'
        return (
          <div key={job.id} style={{ ...card(), borderLeft: `4px solid ${paid ? '#22C55E' : '#F59E0B'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', color: C.text, marginBottom: 4 }}>{job.plate}</div>
                <div style={f(12, 400, C.sub)}>{job.vehicle_info}</div>
                <div style={f(12, 500)}>{job.customer_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: paid ? '#D1FAE5' : '#FEF3C7', color: paid ? '#065F46' : '#92400E' }}>
                  {paid ? 'Fully Paid' : 'Unpaid'}
                </span>
                <div style={f(11, 400, C.dim)}>
                  {job.service_name}
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpenGate(job)}
              disabled={releasing === job.id}
              style={{ width: '100%', height: 44, background: releasing === job.id ? '#CBD5E1' : paid ? '#15803D' : '#F59E0B', color: paid ? 'white' : '#1a1a2e', fontSize: 14, fontWeight: 700, borderRadius: 10, border: 'none', cursor: releasing === job.id ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >
              {releasing === job.id ? 'Processing...' : paid ? '🔓 Release Car' : '⚠ Open Gate (Unpaid)'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* ─── History Tab ────────────────────────────────────────────────────────── */
function HistoryTab({ history, isDesktop }) {
  const todayDone = history.filter(j => isToday(j.updated_at))

  if (isDesktop) {
    return (
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={f(16, 700)}>Completed Today</div>
          <div style={f(13, 400, C.sub)}>{todayDone.length} jobs done</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Plate', 'Vehicle', 'Service', 'Customer', 'Payment', 'Status', 'Completed'].map(h =>
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {todayDone.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, ...f(14, 400, C.dim) }}>No completed jobs today yet.</td></tr>
            )}
            {todayDone.map(j => (
              <tr key={j.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 16px' }}><span style={f(14, 700)}>{j.plate}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(13, 400, C.sub)}>{j.vehicle_info}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(13, 400)}>{j.service_name}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(13, 400, C.sub)}>{j.customer_name}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ ...statusBadge(j.payment_status === 'fully_paid' ? 'done' : 'pending'), textTransform: 'capitalize' }}>{(j.payment_status || '').replace(/_/g, ' ')}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={statusBadge(j.status)}>{STATUS_LABELS[j.status] || j.status}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(12, 400, C.sub)}>{j.updated_at ? new Date(j.updated_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={f(11, 700, C.dim)}>COMPLETED TODAY ({todayDone.length})</div>
      {todayDone.length === 0 && <div style={{ textAlign: 'center', padding: 32, ...f(14, 400, C.dim) }}>No completed jobs today.</div>}
      {todayDone.map(j => (
        <div key={j.id} style={{ ...card(), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={f(15, 700)}>{j.plate}</div>
            <div style={f(12, 400, C.sub)}>{j.service_name} · {j.customer_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={statusBadge(j.status)}>{STATUS_LABELS[j.status] || j.status}</span>
            <div style={f(11, 400, C.dim)}>{j.updated_at ? new Date(j.updated_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function WorkerPortal() {
  const { user, logout } = useAuth()
  const isDesktop = useDesktop()
  const [page, setPage]         = useState('queue')
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [apiError, setApiError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [advancing, setAdvancing]   = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [releasing, setReleasing]   = useState(null)
  const [doneModal, setDoneModal]   = useState(null)
  const [gateModal, setGateModal]   = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchJobs = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const { data } = await client.get('bookings/')
      setJobs((data.results ?? data).map(mapBooking))
      setLastRefresh(new Date())
      setApiError('')
    } catch (err) {
      const s = err.response?.status
      const msg = s === 401 ? 'Session expired — please log out and log back in.'
        : s === 403 ? 'Your account does not have worker access.'
        : !err.response ? 'Cannot reach the server. Make sure the backend is running on port 8000.'
        : `Server error (${s}) — ${err.response?.data?.detail || 'please try again.'}`
      setApiError(msg)
    }
    setRefreshing(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs(false)
    const timer = setInterval(() => fetchJobs(true), 15000)
    return () => clearInterval(timer)
  }, [fetchJobs])

  const queue      = jobs.filter(j => ['pending', 'confirmed'].includes(j.status))
  const activeJobs = jobs.filter(j => ['received', 'washing', 'rinsing', 'drying'].includes(j.status))
  const gateJobs   = jobs.filter(j => j.status === 'done')
  const history    = jobs.filter(j => ['done', 'collected', 'delivered'].includes(j.status))

  const handleConfirm = async (job) => {
    setConfirming(job.id)
    try {
      const { data } = await client.post(`bookings/${job.id}/confirm/`)
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: data.status } : j))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to confirm booking.')
    }
    setConfirming(null)
  }

  const handleMarkReceived = async (job) => {
    setAdvancing(job.id)
    try {
      const { data } = await client.patch(`bookings/${job.id}/status/`)
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: data.status } : j))
      setPage('active')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to mark as received.')
    }
    setAdvancing(null)
  }

  const handleAdvance = (job) => {
    if (job.status === 'drying') { setDoneModal(job); return }
    advanceJob(job)
  }

  const advanceJob = async (job) => {
    setAdvancing(job.id)
    try {
      const { data } = await client.patch(`bookings/${job.id}/status/`)
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: data.status } : j))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    }
    setAdvancing(null)
  }

  const handleConfirmDone = async () => {
    if (!doneModal) return
    const job = doneModal
    setDoneModal(null)
    setAdvancing(job.id)
    try {
      const { data } = await client.patch(`bookings/${job.id}/status/`)
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: data.status } : j))
      setPage('gate')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to mark as done.')
    }
    setAdvancing(null)
  }

  const handleRelease = async ({ plateText, capturedBlob }) => {
    if (!gateModal) return
    const job = gateModal
    setReleasing(job.id)
    try {
      const fd = new FormData()
      fd.append('plate_text', plateText)
      if (capturedBlob) fd.append('plate_image', capturedBlob, 'plate_exit.jpg')
      const { data } = await client.post(`bookings/${job.id}/release-car/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: data.status, payment_status: data.payment_status } : j))
      setGateModal(null)
      setPage('history')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to release car. Check payment status.')
    }
    setReleasing(null)
  }

  const workerName = user?.full_name || user?.phone || 'Worker'

  const pageContent = () => {
    if (loading) return <div style={{ padding: 40, textAlign: 'center', ...f(14, 400, C.dim) }}>Loading jobs...</div>
    if (apiError) return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 12, padding: '16px 20px', margin: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Connection Error</div>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{apiError}</div>
        <button onClick={() => fetchJobs(false)} style={{ marginTop: 12, padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>Try Again</button>
      </div>
    )
    if (page === 'queue')   return <QueueTab queue={queue} onConfirm={handleConfirm} onMarkReceived={handleMarkReceived} confirming={confirming} advancing={advancing} isDesktop={isDesktop} />
    if (page === 'active')  return <ActiveTab activeJobs={activeJobs} onAdvance={handleAdvance} advancing={advancing} />
    if (page === 'gate')    return <GateTab gateJobs={gateJobs} onOpenGate={setGateModal} releasing={releasing} isDesktop={isDesktop} />
    if (page === 'history') return <HistoryTab history={history} isDesktop={isDesktop} />
    return null
  }

  const pageTitles = {
    queue:   ['Job Queue',      `${queue.length} job${queue.length !== 1 ? 's' : ''} awaiting action`],
    active:  ['Active Jobs',    `${activeJobs.length} job${activeJobs.length !== 1 ? 's' : ''} in progress`],
    gate:    ['Release Gate',   `${gateJobs.length} car${gateJobs.length !== 1 ? 's' : ''} ready for pickup`],
    history: ['History',        'Completed jobs today'],
  }

  const css = `
    @keyframes wPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.85); } }
  `

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <style>{css}</style>
        <Sidebar page={page} setPage={setPage} workerName={workerName} queueCount={queue.length} activeCount={activeJobs.length} gateCount={gateJobs.length} logout={logout} />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 1200 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: C.text }}>{pageTitles[page]?.[0]}</div>
                <div style={f(13, 400, C.sub)}>{pageTitles[page]?.[1]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {lastRefresh && <span style={f(11, 400, C.dim)}>Refreshed {lastRefresh.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>}
                <button onClick={() => fetchJobs(false)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', border: `1px solid ${C.border}`, borderRadius: 9, cursor: 'pointer', ...f(13, 600, C.sub) }}>
                  <span style={{ animation: refreshing ? 'wPulse 1s ease-in-out infinite' : 'none', display: 'flex' }}><RefreshIcon /></span>
                  Refresh
                </button>
              </div>
            </div>
            {pageContent()}
          </div>
        </main>
        {doneModal && <DoneModal job={doneModal} onConfirm={handleConfirmDone} onClose={() => setDoneModal(null)} busy={advancing === doneModal?.id} />}
        {gateModal && <GateModal job={gateModal} onRelease={handleRelease} onClose={() => setGateModal(null)} busy={releasing === gateModal?.id} />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <style>{css}</style>
      <div style={{ background: C.primary, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
          <div style={f(10, 400, 'rgba(255,255,255,.45)')}>Worker Portal</div>
        </div>
        <button onClick={() => fetchJobs(false)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
          <span style={{ animation: refreshing ? 'wPulse 1s ease-in-out infinite' : 'none', display: 'flex' }}><RefreshIcon /></span>
          Refresh
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: page === 'active' ? 16 : 0, paddingBottom: 80 }}>
        {pageContent()}
      </div>
      <BottomNav page={page} setPage={setPage} gateCount={gateJobs.length} />
      {doneModal && <DoneModal job={doneModal} onConfirm={handleConfirmDone} onClose={() => setDoneModal(null)} busy={advancing === doneModal?.id} />}
      {gateModal && <GateModal job={gateModal} onRelease={handleRelease} onClose={() => setGateModal(null)} busy={releasing === gateModal?.id} />}
    </div>
  )
}
