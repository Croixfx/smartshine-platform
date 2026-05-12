import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

const C = {
  primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1',
  accent: '#F39C12', bg: '#F0F4F8', surface: '#FFFFFF', border: '#E2E8F0',
  text: '#1E293B', sub: '#64748B', dim: '#94A3B8',
  success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D',
  sidebar: '#0F2744',
}

const DRIVER_ACTIONS = {
  driver_assigned:  { label: '🚗 Start — En Route to Customer',    color: '#2563EB' },
  en_route_pickup:  { label: '📍 I\'ve Arrived at Customer',        color: '#7C3AED' },
  at_customer:      { label: '🔑 Car Collected — Heading to Branch', color: '#D97706' },
  done:             { label: '🚚 Start Delivery',                    color: '#2563EB' },
  out_for_delivery: { label: '✅ Car Delivered',                     color: '#15803D' },
}

const WASH_STATUSES = ['en_route_branch', 'received', 'washing', 'rinsing', 'drying']

const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed',
  driver_assigned: 'Assigned — Action Required',
  en_route_pickup: 'Heading to Customer',
  at_customer: 'At Customer Location',
  en_route_branch: 'Taking Car to Branch',
  received: 'Car at Branch',
  washing: 'Washing', rinsing: 'Rinsing', drying: 'Drying',
  done: 'Wash Complete',
  out_for_delivery: 'Delivering',
  delivered: 'Delivered',
  collected: 'Customer Collected',
}

const f = (size, weight = 400, color = C.text) => ({ fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color })
const card = (extra = {}) => ({ background: C.surface, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.07)', padding: 20, ...extra })

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const AvailableIcon = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
const JobsIcon      = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const ActiveIcon    = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
const DoneIcon      = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const LogoutIcon    = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const RefreshIcon   = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>

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

const mapBooking = b => ({
  ...b,
  plate: b.vehicle_plate || `#${b.id}`,
  vehicle_info: [b.vehicle_make, b.vehicle_model, b.vehicle_color].filter(Boolean).join(' · '),
})

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
function Sidebar({ page, setPage, driverName, availableCount, activeCount, completedCount, logout }) {
  const nav = [
    { id: 'available',  label: 'Available Pickups', Icon: AvailableIcon, count: availableCount },
    { id: 'active',     label: 'My Jobs',           Icon: JobsIcon,      count: activeCount },
    { id: 'inprogress', label: 'In Progress',       Icon: ActiveIcon,    count: null },
    { id: 'completed',  label: 'Completed',         Icon: DoneIcon,      count: completedCount },
  ]
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Driver Portal</div>
      </div>
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {nav.map(({ id, label, Icon, count }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 9, marginBottom: 2, cursor: 'pointer', textAlign: 'left', background: active ? 'rgba(255,255,255,.11)' : 'none', border: `1px solid ${active ? 'rgba(255,255,255,.16)' : 'transparent'}`, color: active ? 'white' : 'rgba(255,255,255,.45)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400 }}>
              <Icon />
              {label}
              {count != null && count > 0 && (
                <span style={{ marginLeft: 'auto', background: C.accent, color: '#1a1a2e', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 9999 }}>{count}</span>
              )}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '16px 20px 28px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={f(13, 600, 'rgba(255,255,255,.9)')}>{driverName}</div>
          <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Driver</div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          <LogoutIcon />Logout
        </button>
      </div>
    </aside>
  )
}

/* ─── Bottom nav (mobile) ────────────────────────────────────────────────── */
function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'available',  label: 'Available', Icon: AvailableIcon },
    { id: 'active',     label: 'My Jobs',   Icon: JobsIcon },
    { id: 'inprogress', label: 'Progress',  Icon: ActiveIcon },
    { id: 'completed',  label: 'Done',      Icon: DoneIcon },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = page === id
        return (
          <button key={id} onClick={() => setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0 9px', background: 'none', border: 'none', cursor: 'pointer', color: active ? C.primary : C.dim, position: 'relative' }}>
            {active && <div style={{ position: 'absolute', top: 0, width: 36, height: 2, borderRadius: 1, background: C.primary }} />}
            <Icon />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── GPS pill ───────────────────────────────────────────────────────────── */
function GPSIndicator({ tracking }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: tracking ? '#DCFCE7' : '#F3F4F6', borderRadius: 9999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: tracking ? '#15803D' : '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tracking ? '#22C55E' : '#9CA3AF', animation: tracking ? 'gpsPulse 1.5s ease-in-out infinite' : 'none', display: 'inline-block', flexShrink: 0 }} />
      {tracking ? 'GPS Active' : 'GPS Off'}
    </div>
  )
}

/* ─── Wash Phase Waiting Card ────────────────────────────────────────────── */
function WashWaiting({ booking }) {
  const washProgress = ['received', 'washing', 'rinsing', 'drying', 'done']
  const idx = washProgress.indexOf(booking.status)

  return (
    <div style={{ ...card(), borderLeft: '4px solid #8B5CF6', marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{booking.plate}</div>
        <div style={f(13, 400, C.sub)}>{booking.vehicle_info}</div>
        <div style={f(12, 400, C.dim)}>Customer: {booking.customer_name}</div>
      </div>

      <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Wash Progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {washProgress.map((s, i) => (
            <div key={s} style={{ display: 'contents' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < idx ? '#7C3AED' : i === idx ? '#F59E0B' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i < idx && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                  {i === idx && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', animation: 'gpsPulse 1.5s ease-in-out infinite' }} />}
                </div>
                <span style={{ fontSize: 9, whiteSpace: 'nowrap', color: i <= idx ? '#7C3AED' : '#9CA3AF', fontWeight: i === idx ? 700 : 400, fontFamily: "'DM Sans',sans-serif" }}>
                  {s === 'done' ? 'Done' : s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
              {i < washProgress.length - 1 && (
                <div style={{ flex: 1, height: 2, minWidth: 10, background: i < idx ? '#7C3AED' : '#E2E8F0', margin: '0 2px', marginBottom: 14 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {booking.status !== 'done' && (
        <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: C.sub, fontFamily: "'DM Sans',sans-serif" }}>
          ⏳ The wash team is working on the car. Please wait.
        </div>
      )}
      {booking.status === 'done' && booking.return_method === 'delivery' && (
        <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400E', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
          ✅ Wash complete! Customer chose delivery. Go collect and deliver.
        </div>
      )}
      {booking.status === 'done' && !booking.return_method && (
        <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1D4ED8', fontFamily: "'DM Sans',sans-serif" }}>
          ✅ Wash complete! Waiting for customer to choose delivery or self-pickup.
        </div>
      )}
      {booking.status === 'done' && booking.return_method === 'self_pickup' && (
        <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#065F46', fontFamily: "'DM Sans',sans-serif" }}>
          ✅ Wash complete — customer will self-pickup. Job done for you!
        </div>
      )}
    </div>
  )
}

/* ─── Active Job Card ────────────────────────────────────────────────────── */
function ActiveJobCard({ booking, onAction, advancing }) {
  const busy   = advancing === booking.id
  const action = DRIVER_ACTIONS[booking.status]
  const isWaiting = WASH_STATUSES.includes(booking.status)

  if (isWaiting) return <WashWaiting booking={booking} />

  const phaseColors = {
    driver_assigned: '#2563EB', en_route_pickup: '#7C3AED',
    at_customer: '#D97706', done: '#1D4ED8', out_for_delivery: '#1D4ED8',
  }
  const phaseColor = phaseColors[booking.status] || C.primary
  const phaseLabel = STATUS_LABEL[booking.status] || booking.status.replace(/_/g, ' ')

  return (
    <div style={{ ...card(), borderLeft: `4px solid ${phaseColor}`, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{booking.plate}</div>
          <div style={f(13, 400, C.sub)}>{booking.vehicle_info}</div>
        </div>
        <div style={{ background: `${phaseColor}18`, color: phaseColor, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, maxWidth: 130, wordBreak: 'break-word', fontFamily: "'DM Sans',sans-serif", flexShrink: 0, textAlign: 'center' }}>
          {phaseLabel}
        </div>
      </div>

      <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        {[
          ['Customer', booking.customer_name],
          ['Phone',    booking.customer_phone],
          ['Service',  booking.service_name],
          ['Branch',   booking.branch_name],
          ...(booking.pickup_address ? [['Pickup Addr', booking.pickup_address]] : []),
          ...(booking.return_method  ? [['Return',      booking.return_method.replace('_', ' ')]] : []),
        ].map(([k, v]) => v ? (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', fontFamily: "'DM Sans',sans-serif" }}>
            <span style={{ color: C.sub, minWidth: 80, flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: 500, color: C.text, textAlign: 'right', textTransform: 'capitalize', flex: 1, marginLeft: 8 }}>{v}</span>
          </div>
        ) : null)}
      </div>

      {action && (
        <button onClick={() => onAction(booking)} disabled={busy} style={{
          width: '100%', padding: '14px 0', background: busy ? '#CBD5E1' : action.color,
          color: 'white', border: 'none', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
          boxShadow: busy ? 'none' : '0 4px 14px rgba(0,0,0,.15)', transition: 'all 150ms',
        }}>
          {busy ? 'Updating...' : action.label}
        </button>
      )}

      {booking.status === 'done' && booking.return_method === 'self_pickup' && (
        <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#065F46', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
          ✅ Customer collecting themselves — job complete!
        </div>
      )}
    </div>
  )
}

/* ─── Available Pickups Tab ──────────────────────────────────────────────── */
function AvailableTab({ pickups, onAccept, accepting, loading, onRefresh }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center', ...f(14, 400, C.dim) }}>Loading available pickups...</div>

  if (pickups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
        <div style={f(16, 600, C.sub)}>No pickups available right now</div>
        <div style={f(13, 400, C.dim)}>Broadcast pickup jobs appear here when customers book</div>
        <button onClick={onRefresh} style={{ marginTop: 16, padding: '8px 20px', background: C.primary, color: 'white', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ ...f(11, 700, C.sub), textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        {pickups.length} OPEN PICKUP{pickups.length !== 1 ? 'S' : ''} — FIRST COME, FIRST SERVED
      </div>
      {pickups.map(p => {
        const busy = accepting === p.id
        return (
          <div key={p.id} style={{ ...card(), borderLeft: '4px solid #F59E0B', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{p.plate}</div>
                <div style={f(13, 400, C.sub)}>{p.vehicle_info}</div>
              </div>
              <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
                OPEN
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              {[
                ['Customer', p.customer_name],
                ['Service',  p.service_name],
                ['Branch',   p.branch_name],
                ['Date',     p.date],
                ['Pickup Address', p.pickup_address],
              ].map(([k, v]) => v ? (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', fontFamily: "'DM Sans',sans-serif" }}>
                  <span style={{ color: C.sub, minWidth: 80, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 500, color: C.text, textAlign: 'right', flex: 1, marginLeft: 8 }}>{v}</span>
                </div>
              ) : null)}
            </div>
            <button onClick={() => onAccept(p)} disabled={busy} style={{
              width: '100%', padding: '14px 0', background: busy ? '#CBD5E1' : '#F59E0B',
              color: busy ? '#888' : '#1a1a2e', border: 'none', borderRadius: 10,
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
              boxShadow: busy ? 'none' : '0 4px 14px rgba(245,158,11,.25)', transition: 'all 150ms',
            }}>
              {busy ? 'Accepting...' : '🚗 Accept This Pickup'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Jobs Tab ───────────────────────────────────────────────────────────── */
function JobsTab({ jobs, onAction, advancing }) {
  const actionable  = jobs.filter(j => ['driver_assigned', 'en_route_pickup', 'at_customer'].includes(j.status))
  const waiting     = jobs.filter(j => WASH_STATUSES.includes(j.status))
  const deliverable = jobs.filter(j => ['done', 'out_for_delivery'].includes(j.status))

  if (jobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
        <div style={f(16, 600, C.sub)}>No active jobs</div>
        <div style={f(13, 400, C.dim)}>Go to "Available Pickups" to accept a job</div>
      </div>
    )
  }

  return (
    <div>
      {actionable.length > 0 && (
        <>
          <div style={{ ...f(11, 700, '#DC2626'), textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>ACTION REQUIRED ({actionable.length})</div>
          {actionable.map(j => <ActiveJobCard key={j.id} booking={j} onAction={onAction} advancing={advancing} />)}
        </>
      )}
      {waiting.length > 0 && (
        <>
          <div style={{ ...f(11, 700, '#7C3AED'), textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: actionable.length ? 12 : 0 }}>WASH IN PROGRESS ({waiting.length})</div>
          {waiting.map(j => <WashWaiting key={j.id} booking={j} />)}
        </>
      )}
      {deliverable.length > 0 && (
        <>
          <div style={{ ...f(11, 700, '#1D4ED8'), textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: (actionable.length || waiting.length) ? 12 : 0 }}>DELIVERY PHASE ({deliverable.length})</div>
          {deliverable.map(j => <ActiveJobCard key={j.id} booking={j} onAction={onAction} advancing={advancing} />)}
        </>
      )}
    </div>
  )
}

/* ─── Completed Tab ──────────────────────────────────────────────────────── */
function CompletedTab({ jobs, isDesktop }) {
  const done = jobs.filter(j => ['delivered', 'collected'].includes(j.status))

  if (done.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={f(16, 600, C.sub)}>No completed jobs yet</div>
        <div style={f(13, 400, C.dim)}>Completed deliveries will appear here</div>
      </div>
    )
  }

  if (isDesktop) {
    const th = { padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }
    const td = { padding: '12px 16px', borderBottom: `1px solid ${C.border}` }
    return (
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={f(16, 700)}>Completed Jobs</div>
          <div style={f(13, 400, C.sub)}>{done.length} deliveries completed</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Plate', 'Customer', 'Service', 'Branch', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {done.map(j => (
              <tr key={j.id}>
                <td style={td}><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{j.plate}</span></td>
                <td style={td}><span style={f(13, 400, C.sub)}>{j.customer_name}</span></td>
                <td style={td}><span style={f(13)}>{j.service_name}</span></td>
                <td style={td}><span style={f(13, 400, C.sub)}>{j.branch_name}</span></td>
                <td style={td}><span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: '#D1FAE5', color: '#065F46', textTransform: 'capitalize', fontFamily: "'DM Sans',sans-serif" }}>{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {done.map(j => (
        <div key={j.id} style={{ ...card(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>{j.plate}</div>
            <div style={f(12, 400, C.sub)}>{j.service_name} · {j.customer_name}</div>
            <div style={f(11, 400, C.dim)}>{j.branch_name}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: '#D1FAE5', color: '#065F46', textTransform: 'capitalize', fontFamily: "'DM Sans',sans-serif" }}>{j.status}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── In Progress Tab ────────────────────────────────────────────────────── */
function InProgressTab({ jobs }) {
  const inProgress = jobs.filter(j => WASH_STATUSES.includes(j.status))
  if (inProgress.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🫧</div>
        <div style={f(16, 600, C.sub)}>No cars being washed</div>
        <div style={f(13, 400, C.dim)}>Cars at the branch will appear here</div>
      </div>
    )
  }
  return <div>{inProgress.map(j => <WashWaiting key={j.id} booking={j} />)}</div>
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function DriverPortal() {
  const { user, logout } = useAuth()
  const isDesktop = useDesktop()

  const [page, setPage]                     = useState('available')
  const [jobs, setJobs]                     = useState([])
  const [availablePickups, setAvailablePickups] = useState([])
  const [loading, setLoading]               = useState(true)
  const [availLoading, setAvailLoading]     = useState(false)
  const [apiError, setApiError]             = useState('')
  const [refreshing, setRefreshing]         = useState(false)
  const [advancing, setAdvancing]           = useState(null)
  const [accepting, setAccepting]           = useState(null)
  const [gpsTracking, setGpsTracking]       = useState(false)
  const gpsWatchRef = useRef(null)

  const fetchJobs = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const { data } = await client.get('bookings/')
      setJobs((data.results ?? data).map(mapBooking))
      setApiError('')
    } catch (err) {
      const s = err.response?.status
      const msg = s === 401 ? 'Session expired — please log in again.'
        : s === 403 ? 'Your account does not have driver access.'
        : !err.response ? 'Cannot reach server. Check your connection.'
        : `Server error (${s}).`
      setApiError(msg)
    }
    setRefreshing(false)
    setLoading(false)
  }, [])

  const fetchAvailable = useCallback(async () => {
    setAvailLoading(true)
    try {
      const { data } = await client.get('bookings/available-pickups/')
      setAvailablePickups((data.results ?? data).map(mapBooking))
    } catch {
      setAvailablePickups([])
    }
    setAvailLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs(false)
    const timer = setInterval(() => fetchJobs(true), 15000)
    return () => clearInterval(timer)
  }, [fetchJobs])

  useEffect(() => {
    fetchAvailable()
    const timer = setInterval(fetchAvailable, 15000)
    return () => clearInterval(timer)
  }, [fetchAvailable])

  useEffect(() => {
    if (!navigator.geolocation) return
    const sendLocation = pos => {
      client.patch('accounts/driver/location/', {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }).catch(() => {})
    }
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      pos => { setGpsTracking(true); sendLocation(pos) },
      () => setGpsTracking(false),
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
    return () => {
      if (gpsWatchRef.current != null) navigator.geolocation.clearWatch(gpsWatchRef.current)
    }
  }, [])

  const activeJobs    = jobs.filter(j => !['delivered', 'collected', 'cancelled'].includes(j.status))
  const completedJobs = jobs.filter(j => ['delivered', 'collected'].includes(j.status))

  const handleAction = async booking => {
    setAdvancing(booking.id)
    try {
      const { data } = await client.patch(`bookings/${booking.id}/driver-status/`)
      setJobs(prev => prev.map(j => j.id === booking.id ? { ...j, status: data.status, return_method: data.return_method } : j))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    }
    setAdvancing(null)
  }

  const handleAccept = async booking => {
    setAccepting(booking.id)
    try {
      await client.post(`bookings/${booking.id}/accept-pickup/`)
      setAvailablePickups(prev => prev.filter(p => p.id !== booking.id))
      fetchJobs(false)
      setPage('active')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept pickup.')
    }
    setAccepting(null)
  }

  const doRefresh = () => page === 'available' ? fetchAvailable() : fetchJobs(false)
  const driverName = user?.full_name || user?.phone || 'Driver'

  const pageContent = () => {
    if (loading) return <div style={{ padding: 40, textAlign: 'center', ...f(14, 400, C.dim) }}>Loading your jobs...</div>
    if (apiError && page !== 'available') return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 12, padding: '16px 20px', margin: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Connection Error</div>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{apiError}</div>
        <button onClick={() => fetchJobs(false)} style={{ marginTop: 12, padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>Try Again</button>
      </div>
    )
    if (page === 'available')  return <AvailableTab pickups={availablePickups} onAccept={handleAccept} accepting={accepting} loading={availLoading} onRefresh={fetchAvailable} />
    if (page === 'active')     return <JobsTab jobs={activeJobs} onAction={handleAction} advancing={advancing} />
    if (page === 'inprogress') return <InProgressTab jobs={jobs} />
    if (page === 'completed')  return <CompletedTab jobs={completedJobs} isDesktop={isDesktop} />
    return null
  }

  const pageTitles = {
    available:  ['Available Pickups',  `${availablePickups.length} open pickup${availablePickups.length !== 1 ? 's' : ''}`],
    active:     ['My Jobs',           `${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}`],
    inprogress: ['In Progress',       'Cars being washed at branch'],
    completed:  ['Completed',         `${completedJobs.length} deliveries done`],
  }

  const css = `@keyframes gpsPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.75); } }`

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <style>{css}</style>
        <Sidebar page={page} setPage={setPage} driverName={driverName} availableCount={availablePickups.length} activeCount={activeJobs.length} completedCount={completedJobs.length} logout={logout} />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: C.text }}>{pageTitles[page]?.[0]}</div>
                <div style={f(13, 400, C.sub)}>{pageTitles[page]?.[1]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GPSIndicator tracking={gpsTracking} />
                <button onClick={doRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', border: `1px solid ${C.border}`, borderRadius: 9, cursor: 'pointer', ...f(13, 600, C.sub) }}>
                  <span style={{ display: 'flex', animation: refreshing ? 'gpsPulse 1s ease-in-out infinite' : 'none' }}><RefreshIcon /></span>
                  Refresh
                </button>
              </div>
            </div>
            {pageContent()}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <style>{css}</style>
      <div style={{ background: C.primary, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
          <div style={f(10, 400, 'rgba(255,255,255,.45)')}>Driver Portal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GPSIndicator tracking={gpsTracking} />
          <button onClick={doRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
            <RefreshIcon /> Refresh now
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
        {pageContent()}
      </div>
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
