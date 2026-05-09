import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const C = {
  primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1',
  accent: '#F39C12', bg: '#F0F4F8', surface: '#FFFFFF', border: '#E2E8F0',
  text: '#1E293B', sub: '#64748B', dim: '#94A3B8',
  success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D',
  sidebar: '#0F2744',
}

const MILESTONES = [
  { id: 'on_way', label: 'On Way' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'collected', label: 'Collected' },
  { id: 'at_branch', label: 'At Branch' },
  { id: 'returning', label: 'Returning' },
  { id: 'delivered', label: 'Delivered' },
]

const REQUESTS = [
  { id: 1, plate: 'RAC 123 A', customer: 'Sandrine U.', service: 'Full Body Wash', address: 'KN 4 Ave, Nyarugenge', distance: '2.3 km', price: 8000, eta: '8 min' },
  { id: 2, plate: 'RAD 789 C', customer: 'Jean C.', service: 'Premium Detail', address: 'KG 11 Ave, Gasabo', distance: '4.1 km', price: 18000, eta: '14 min' },
]

const f = (size, weight = 400, color = '#1E293B') => ({ fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color })
const card = (extra = {}) => ({ background: C.surface, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.07)', padding: 20, ...extra })

const RequestsIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
const ActiveIcon  = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
const EarningsIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
const LogoutIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

function useDesktop(bp = 900) {
  const [d, setD] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= bp : true)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${bp}px)`)
    const h = e => setD(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [bp])
  return d
}

function Sidebar({ page, setPage, driverName, isOnline, setIsOnline, logout }) {
  const nav = [
    { id: 'requests', label: 'Requests', Icon: RequestsIcon },
    { id: 'active',   label: 'Active Job', Icon: ActiveIcon },
    { id: 'earnings', label: 'Earnings',  Icon: EarningsIcon },
  ]
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Driver Portal</div>
      </div>
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {nav.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 9, marginBottom: 2, cursor: 'pointer', textAlign: 'left', background: active ? 'rgba(255,255,255,.11)' : 'none', border: `1px solid ${active ? 'rgba(255,255,255,.16)' : 'transparent'}`, color: active ? 'white' : 'rgba(255,255,255,.45)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all 150ms' }}>
              <Icon size={18} />{label}
              {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.accent }} />}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '16px 20px 28px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={f(13, 600, 'rgba(255,255,255,.9)')}>{driverName}</div>
          <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Driver</div>
        </div>
        <button onClick={() => setIsOnline(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginBottom: 8, transition: 'all 150ms', background: isOnline ? 'rgba(34,197,94,.13)' : 'rgba(255,255,255,.05)', border: `1px solid ${isOnline ? 'rgba(34,197,94,.28)' : 'rgba(255,255,255,.09)'}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? C.success : 'rgba(255,255,255,.25)', flexShrink: 0 }} />
          <span style={f(12, 600, isOnline ? '#86EFAC' : 'rgba(255,255,255,.35)')}>{isOnline ? 'Online' : 'Offline'}</span>
          <div style={{ marginLeft: 'auto', width: 32, height: 18, borderRadius: 9, background: isOnline ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.1)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: isOnline ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: isOnline ? C.success : 'rgba(255,255,255,.3)', transition: 'left 200ms' }} />
          </div>
        </button>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          <LogoutIcon size={15} />Logout
        </button>
      </div>
    </aside>
  )
}

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'requests', label: 'Requests', Icon: RequestsIcon },
    { id: 'active',   label: 'Active',   Icon: ActiveIcon },
    { id: 'earnings', label: 'Earnings', Icon: EarningsIcon },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
      {tabs.map(({ id, label, Icon }) => {
        const active = page === id
        return (
          <button key={id} onClick={() => setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0 9px', background: 'none', border: 'none', cursor: 'pointer', color: active ? C.primary : C.dim, position: 'relative', transition: 'color 150ms' }}>
            {active && <div style={{ position: 'absolute', top: 0, width: 36, height: 2, borderRadius: 1, background: C.primary }} />}
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function MapSVG({ showRoute = false, milestone = null, height = 260, fullWidth = false }) {
  return (
    <div style={{ width: '100%', height, background: '#d4e9f0', position: 'relative', overflow: 'hidden', borderRadius: fullWidth ? 0 : 10 }}>
      <svg width="100%" height="100%" viewBox="0 0 900 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <rect width="900" height="300" fill="#d4e9f0"/>
        <line x1="0" y1="150" x2="900" y2="150" stroke="#c0d8e4" strokeWidth="22"/>
        <line x1="450" y1="0" x2="450" y2="300" stroke="#c0d8e4" strokeWidth="16"/>
        <line x1="0" y1="75" x2="900" y2="225" stroke="#c0d8e4" strokeWidth="9"/>
        <line x1="0" y1="150" x2="900" y2="150" stroke="white" strokeWidth="2" strokeDasharray="28,18"/>
        <line x1="450" y1="0" x2="450" y2="300" stroke="white" strokeWidth="2" strokeDasharray="28,18"/>
        <circle cx="140" cy="220" r="22" fill="#b8d9b0" opacity=".7"/>
        <circle cx="760" cy="80" r="18" fill="#b8d9b0" opacity=".7"/>
        {showRoute && <path d="M 130 215 Q 350 150 450 150 Q 640 150 770 82" stroke={C.accent} strokeWidth="5" fill="none" strokeDasharray="14,8" strokeLinecap="round"/>}
        <circle cx="130" cy="215" r="20" fill={C.secondary} opacity=".9"/>
        <circle cx="130" cy="215" r="8" fill="white"/>
        <circle cx="770" cy="82" r="20" fill={C.primary} opacity=".9"/>
        <circle cx="770" cy="82" r="8" fill="white"/>
        {showRoute && <>
          <circle cx="450" cy="150" r="24" fill={C.accent} opacity=".2"/>
          <circle cx="450" cy="150" r="15" fill={C.accent}/>
          <circle cx="450" cy="150" r="6" fill="white"/>
        </>}
      </svg>
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[['Customer', C.secondary], ['Branch', C.primary], ...(showRoute ? [['You', C.accent]] : [])].map(([label, color]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,.92)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: C.sub, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>{label}
          </div>
        ))}
      </div>
      {milestone && <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(26,82,118,.92)', color: 'white', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>{milestone}</div>}
    </div>
  )
}

function OfflineState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, textAlign: 'center', flex: 1 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>⭕</div>
      <div style={f(20, 700)}>You're Offline</div>
      <div style={f(14, 400, C.sub)}>Go online to start receiving pickup requests from customers.</div>
    </div>
  )
}

function DesktopRequests({ setPage, setActiveReq, isOnline }) {
  const [accepting, setAccepting] = useState(null)
  if (!isOnline) return <OfflineState />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {REQUESTS.map(req => (
        <div key={req.id} style={card({ padding: 0, overflow: 'hidden' })}>
          <MapSVG height={200} />
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={f(18, 700)}>{req.plate}</div>
                <div style={f(13, 500, C.sub)}>{req.customer}</div>
                <div style={f(12, 400, C.dim)}>📍 {req.address}</div>
                <div style={f(12, 400, C.dim)}>{req.service}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.primary }}>RWF {req.price.toLocaleString()}</div>
                <div style={f(11, 400, C.dim)}>{req.distance} · ~{req.eta}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button style={{ height: 44, background: '#F1F5F9', color: C.sub, fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Decline</button>
              <button onClick={() => { setAccepting(req.id); setTimeout(() => { setActiveReq(req); setPage('active') }, 700) }} disabled={accepting === req.id} style={{ height: 44, background: accepting === req.id ? C.primaryDark : C.accent, color: accepting === req.id ? 'white' : C.text, fontSize: 14, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 12px rgba(243,156,18,.2)', transition: 'all 150ms' }}>
                {accepting === req.id ? 'Accepting…' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MobileRequests({ setPage, setActiveReq, isOnline }) {
  const [accepting, setAccepting] = useState(null)
  if (!isOnline) return <div style={{ paddingBottom: 80 }}><OfflineState /></div>

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={f(16, 700)}>Incoming Requests</div>
        <span style={f(12, 400, C.sub)}>{REQUESTS.length} nearby</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 16px 0' }}>
        {REQUESTS.map(req => (
          <div key={req.id} style={card({ padding: 0, overflow: 'hidden' })}>
            <MapSVG height={160} />
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={f(17, 700)}>{req.plate}</div>
                  <div style={f(13, 400, C.sub)}>{req.customer}</div>
                  <div style={f(12, 400, C.dim)}>{req.address}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.primary }}>RWF {req.price.toLocaleString()}</div>
                  <div style={f(11, 400, C.dim)}>{req.distance} · ~{req.eta}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button style={{ height: 52, background: '#F1F5F9', color: C.sub, fontSize: 15, fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Decline</button>
                <button onClick={() => { setAccepting(req.id); setTimeout(() => { setActiveReq(req); setPage('active') }, 700) }} disabled={accepting === req.id} style={{ height: 52, background: accepting === req.id ? C.primaryDark : C.accent, color: accepting === req.id ? 'white' : C.text, fontSize: 15, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 12px rgba(243,156,18,.2)', transition: 'all 150ms' }}>
                  {accepting === req.id ? 'Accepting…' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopActiveJob({ req, setPage }) {
  const [mIdx, setMIdx] = useState(0)
  const current = MILESTONES[mIdx]
  const isDone = mIdx >= MILESTONES.length - 1

  return (
    <div>
      <MapSVG showRoute height={380} fullWidth />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={f(22, 700)}>{req.plate}</div>
              <div style={f(14, 500, C.sub)}>{req.customer} · {req.service}</div>
              <div style={f(13, 400, C.dim)}>📍 {req.address}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.primary }}>RWF {Number(req.price).toLocaleString()}</div>
              <div style={f(12, 400, C.dim)}>{req.distance}</div>
            </div>
          </div>
          <button onClick={() => setPage('requests')} style={{ width: '100%', height: 44, background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', ...f(14, 600, C.sub) }}>
            ← Back to Requests
          </button>
        </div>

        <div style={card()}>
          <div style={f(11, 700, C.sub)}>JOURNEY MILESTONES</div>
          <div style={{ marginTop: 12 }}>
            {MILESTONES.map((m, i) => {
              const done = i < mIdx, active = i === mIdx, future = i > mIdx
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < MILESTONES.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: done ? C.primary : active ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={f(14, active ? 700 : future ? 400 : 500, active ? C.text : future ? C.dim : C.sub)}>{m.label}</span>
                  {active && <span style={{ marginLeft: 'auto', ...f(11, 700, C.accent) }}>← Now</span>}
                  {done && <span style={{ marginLeft: 'auto', ...f(12, 400, C.dim) }}>✓</span>}
                </div>
              )
            })}
          </div>
          <button onClick={() => !isDone && setMIdx(i => i + 1)} style={{ width: '100%', height: 52, marginTop: 16, border: 'none', borderRadius: 10, cursor: isDone ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 150ms', background: isDone ? C.successBg : C.accent, color: isDone ? C.successText : C.text, boxShadow: isDone ? 'none' : '0 4px 16px rgba(243,156,18,.25)' }}>
            {isDone ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Job Delivered!</> : `Mark as ${MILESTONES[mIdx + 1]?.label || ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function MobileActiveJob({ req, setPage }) {
  const [mIdx, setMIdx] = useState(0)
  const isDone = mIdx >= MILESTONES.length - 1

  return (
    <div style={{ paddingBottom: 80 }}>
      <MapSVG showRoute milestone={MILESTONES[mIdx].label} height={240} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={f(18, 700)}>{req.plate}</div>
              <div style={f(13, 400, C.sub)}>{req.customer} · {req.service}</div>
              <div style={f(12, 400, C.dim)}>📍 {req.address}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.primary, flexShrink: 0 }}>RWF {Number(req.price).toLocaleString()}</div>
          </div>
        </div>
        <div style={card()}>
          <div style={f(11, 700, C.sub)}>JOURNEY MILESTONES</div>
          <div style={{ marginTop: 12 }}>
            {MILESTONES.map((m, i) => {
              const done = i < mIdx, active = i === mIdx, future = i > mIdx
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < MILESTONES.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: done ? C.primary : active ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={f(14, active ? 700 : future ? 400 : 500, active ? C.text : future ? C.dim : C.sub)}>{m.label}</span>
                  {active && <span style={{ marginLeft: 'auto', ...f(11, 700, C.accent) }}>← Now</span>}
                  {done && <span style={{ marginLeft: 'auto', ...f(12, 400, C.dim) }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>
        <button onClick={() => !isDone && setMIdx(i => i + 1)} style={{ width: '100%', height: 64, border: 'none', borderRadius: 14, cursor: isDone ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 150ms', background: isDone ? C.successBg : C.accent, color: isDone ? C.successText : C.text, boxShadow: isDone ? 'none' : '0 4px 20px rgba(243,156,18,.25)' }}>
          {isDone ? <><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Job Delivered!</> : `Mark as ${MILESTONES[mIdx + 1]?.label || ''}`}
        </button>
      </div>
    </div>
  )
}

const TRIP_DATA = [
  { p: 'RAC 123 A', s: 'Full Body Wash', a: 8000, t: '10:45 AM' },
  { p: 'RAB 456 B', s: 'Premium Detail', a: 18000, t: '09:10 AM' },
  { p: 'RAE 012 D', s: 'Quick Rinse', a: 3000, t: 'Yesterday' },
  { p: 'RAF 333 E', s: 'Full Body Wash', a: 8000, t: 'Yesterday' },
  { p: 'RAG 777 F', s: 'Premium Detail', a: 18000, t: '2 days ago' },
]

function BarChart() {
  const vals = [3, 5, 4, 7, 6, 9, 2]
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const max = Math.max(...vals)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginTop: 16 }}>
      {labels.map((d, i) => (
        <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ width: '100%', borderRadius: '5px 5px 0 0', height: `${(vals[i] / max) * 80}px`, background: i === 5 ? C.accent : C.primary, opacity: i === 6 ? 0.35 : 1, transition: 'height 300ms' }} />
          <span style={f(10, i === 5 ? 700 : 400, i === 5 ? C.accent : C.dim)}>{d}</span>
        </div>
      ))}
    </div>
  )
}

function DesktopEarnings() {
  const stats = [['Today', 'RWF 18,000', C.accent], ['This Week', 'RWF 94,500', C.primary], ['This Month', 'RWF 312,000', C.secondary], ['Total Trips', '12', C.success]]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {stats.map(([l, v, c]) => (
          <div key={l} style={{ ...card({ padding: '22px 24px' }), flex: 1, textAlign: 'center' }}>
            <div style={f(11, 700, C.sub)}>{l.toUpperCase()}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: c, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div style={card()}>
          <div style={f(12, 700, C.sub)}>TRIPS THIS WEEK</div>
          <BarChart />
        </div>
        <div style={card({ padding: 0, overflow: 'hidden' })}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={f(15, 700)}>Recent Trips</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Plate No.', 'Service', 'Time', 'Amount'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {TRIP_DATA.map((t, i) => (
                <tr key={i} style={{ borderBottom: i < TRIP_DATA.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '12px 16px' }}><span style={f(14, 600)}>{t.p}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={f(13, 400)}>{t.s}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={f(13, 400, C.sub)}>{t.t}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={f(14, 700, C.primary)}>RWF {t.a.toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MobileEarnings() {
  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={f(18, 700)}>Earnings</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['Today', 'RWF 18,000', C.accent], ['This Week', 'RWF 94,500', C.primary], ['This Month', 'RWF 312k', C.secondary], ['Trips', '12', C.success]].map(([l, v, c]) => (
          <div key={l} style={card({ padding: 14 })}>
            <div style={f(10, 700, C.sub)}>{l.toUpperCase()}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: c, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <div style={f(12, 700, C.sub)}>TRIPS THIS WEEK</div>
        <BarChart />
      </div>
      <div style={card()}>
        <div style={{ ...f(12, 700, C.sub), marginBottom: 12 }}>RECENT TRIPS</div>
        {TRIP_DATA.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < TRIP_DATA.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div>
              <div style={f(13, 600)}>{t.p}</div>
              <div style={f(11, 400, C.dim)}>{t.s} · {t.t}</div>
            </div>
            <div style={f(14, 700, C.primary)}>RWF {t.a.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DriverPortal() {
  const { user, logout } = useAuth()
  const isDesktop = useDesktop()
  const [page, setPage] = useState('requests')
  const [activeReq, setActiveReq] = useState(null)
  const [isOnline, setIsOnline] = useState(true)

  const navigate = (p) => {
    if (p === 'active' && !activeReq) return
    setPage(p)
  }

  const activePage = (page === 'active' && !activeReq) ? 'requests' : page
  const driverName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Driver'

  const pageTitle = {
    requests: ['Incoming Requests', 'Accept or decline pickup requests'],
    active:   ['Active Job', 'Track your current delivery'],
    earnings: ['Earnings', 'Your trips and revenue'],
  }

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar page={activePage} setPage={navigate} driverName={driverName} isOnline={isOnline} setIsOnline={setIsOnline} logout={logout} />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 1200 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, marginBottom: 4, color: C.text }}>{pageTitle[activePage]?.[0]}</div>
              <div style={f(14, 400, C.sub)}>{pageTitle[activePage]?.[1]}</div>
            </div>
            {activePage === 'requests' && <DesktopRequests setPage={setPage} setActiveReq={setActiveReq} isOnline={isOnline} />}
            {activePage === 'active' && activeReq && <DesktopActiveJob req={activeReq} setPage={setPage} />}
            {activePage === 'earnings' && <DesktopEarnings />}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <div style={{ background: C.primary, padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
          <div style={f(11, 400, 'rgba(255,255,255,.5)')}>Driver Portal</div>
        </div>
        <button onClick={() => setIsOnline(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: isOnline ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.1)', border: 'none', borderRadius: 20, padding: '7px 14px', cursor: 'pointer' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? C.success : C.dim }} />
          <span style={f(12, 700, isOnline ? '#86EFAC' : 'rgba(255,255,255,.4)')}>{isOnline ? 'Online' : 'Offline'}</span>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activePage === 'requests' && <MobileRequests setPage={setPage} setActiveReq={setActiveReq} isOnline={isOnline} />}
        {activePage === 'active' && activeReq && <MobileActiveJob req={activeReq} setPage={setPage} />}
        {activePage === 'earnings' && <MobileEarnings />}
      </div>
      <BottomNav page={activePage} setPage={navigate} />
    </div>
  )
}
