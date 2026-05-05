import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const C = { primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1', accent: '#F39C12', bg: '#F8F9FA', surface: '#FFFFFF', border: '#E9ECEF', text: '#1a1a2e', sub: '#888888', dim: '#AAAAAA', success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D', error: '#DC2626', errorBg: '#FEE2E2', errorText: '#B91C1C' }

const MILESTONES = [{ id: 'on_way', label: 'On Way' }, { id: 'arrived', label: 'Arrived' }, { id: 'collected', label: 'Collected' }, { id: 'at_branch', label: 'At Branch' }, { id: 'returning', label: 'Returning' }, { id: 'delivered', label: 'Delivered' }]
const REQUESTS = [
  { id: 1, plate: 'RAC 123 A', customer: 'Sandrine U.', service: 'Full Body Wash', address: 'KN 4 Ave, Nyarugenge', distance: '2.3 km', price: 8000, eta: '8 min' },
  { id: 2, plate: 'RAD 789 C', customer: 'Jean C.', service: 'Premium Detail', address: 'KG 11 Ave, Gasabo', distance: '4.1 km', price: 18000, eta: '14 min' },
]

const f = (size, weight = 400, color = '#1a1a2e') => ({ fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color })
const card = (extra = {}) => ({ background: C.surface, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 16, ...extra })

function TopBar({ isOnline, setIsOnline }) {
  return (
    <div style={{ background: C.primary, padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.55)')}>Driver Portal</div>
      </div>
      <button onClick={() => setIsOnline(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: isOnline ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.1)',
        border: 'none', borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? C.success : C.dim }} />
        <span style={f(12, 700, isOnline ? '#86EFAC' : 'rgba(255,255,255,.4)')}>{isOnline ? 'Online' : 'Offline'}</span>
      </button>
    </div>
  )
}

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'requests', label: 'Requests', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg> },
    { id: 'active', label: 'Active', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> },
    { id: 'earnings', label: 'Earnings', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '10px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
          color: page === t.id ? C.primary : C.dim, position: 'relative', transition: 'color 150ms',
        }}>
          {page === t.id && <div style={{ position: 'absolute', top: 0, width: 40, height: 2, background: C.primary, borderRadius: 1 }} />}
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: page === t.id ? 700 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function FullMap({ showRoute, milestone, height = 220 }) {
  return (
    <div style={{ width: '100%', height, background: '#d4e9f0', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 430 220" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect width="430" height="220" fill="#d4e9f0" />
        <line x1="0" y1="110" x2="430" y2="110" stroke="#c0d8e4" strokeWidth="16" />
        <line x1="215" y1="0" x2="215" y2="220" stroke="#c0d8e4" strokeWidth="12" />
        <line x1="0" y1="55" x2="430" y2="165" stroke="#c0d8e4" strokeWidth="7" />
        <line x1="0" y1="110" x2="430" y2="110" stroke="white" strokeWidth="2" strokeDasharray="20,14" />
        <line x1="215" y1="0" x2="215" y2="220" stroke="white" strokeWidth="2" strokeDasharray="20,14" />
        <circle cx="80" cy="160" r="16" fill="#b8d9b0" opacity=".7" />
        <circle cx="350" cy="60" r="14" fill="#b8d9b0" opacity=".7" />
        {showRoute && <path d="M 70 155 Q 180 110 215 110 Q 300 110 360 65" stroke={C.accent} strokeWidth="4" fill="none" strokeDasharray="10,6" strokeLinecap="round" />}
        <circle cx="70" cy="155" r="16" fill={C.secondary} opacity=".9" />
        <circle cx="70" cy="155" r="7" fill="white" />
        <circle cx="360" cy="65" r="16" fill={C.primary} opacity=".9" />
        <circle cx="360" cy="65" r="7" fill="white" />
        {showRoute && <>
          <circle cx="215" cy="110" r="18" fill={C.accent} opacity=".2" />
          <circle cx="215" cy="110" r="12" fill={C.accent} />
          <circle cx="215" cy="110" r="5" fill="white" />
        </>}
      </svg>
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[['Customer', C.secondary], ['Branch', C.primary], ...(showRoute ? [['You', C.accent]] : [])].map(([label, color]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,.92)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: C.sub, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />{label}
          </div>
        ))}
      </div>
      {milestone && <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(26,82,118,.92)', color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>{milestone}</div>}
    </div>
  )
}

function RequestsPage({ setPage, setActiveReq, isOnline }) {
  const [accepting, setAccepting] = useState(null)

  if (!isOnline) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center', paddingBottom: 80 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>&#128308;</div>
      <div style={f(18, 700)}>You're Offline</div>
      <div style={f(14, 400, C.sub)}>Go online to start receiving pickup requests from customers.</div>
    </div>
  )

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={f(16, 700)}>Incoming Requests</div>
        <span style={f(12, 400, C.sub)}>{REQUESTS.length} nearby</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 16px 0' }}>
        {REQUESTS.map(req => (
          <div key={req.id} style={card({ border: `1px solid ${C.border}`, padding: 0, overflow: 'hidden' })}>
            <FullMap height={160} />
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={f(17, 700)}>{req.plate}</div>
                  <div style={f(13, 400, C.sub)}>{req.customer}</div>
                  <div style={f(12, 400, C.dim)}>{req.address}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.primary }}>RWF {Number(req.price).toLocaleString()}</div>
                  <div style={f(11, 400, C.dim)}>{req.distance} - ~{req.eta}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button style={{ height: 52, background: '#F3F4F6', color: C.sub, fontSize: 15, fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Decline</button>
                <button onClick={() => { setAccepting(req.id); setTimeout(() => { setActiveReq(req); setPage('active') }, 700) }}
                  disabled={accepting === req.id}
                  style={{
                    height: 52, background: accepting === req.id ? C.primaryDark : C.accent,
                    color: accepting === req.id ? 'white' : C.text, fontSize: 15, fontWeight: 700,
                    borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                    boxShadow: '0 4px 12px rgba(243,156,18,.2)', transition: 'all 150ms',
                  }}>
                  {accepting === req.id ? 'Accepting...' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActiveJobPage({ req, setPage }) {
  const [mIdx, setMIdx] = useState(0)
  const current = MILESTONES[mIdx]
  const isDone = mIdx >= MILESTONES.length - 1

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <FullMap showRoute={true} milestone={current.label} height={240} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={f(18, 700)}>{req.plate}</div>
              <div style={f(13, 400, C.sub)}>{req.customer} - {req.service}</div>
              <div style={f(12, 400, C.dim)}>📍 {req.address}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.primary, textAlign: 'right', flexShrink: 0 }}>
              RWF {Number(req.price).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={card()}>
          <div style={f(11, 700, C.sub)}>JOURNEY MILESTONES</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {MILESTONES.map((m, i) => {
              const d = i < mIdx, a = i === mIdx, fut = i > mIdx
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < MILESTONES.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: d ? C.primary : a ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {d && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                    {a && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={f(14, a ? 700 : fut ? 400 : 500, a ? C.text : fut ? C.dim : C.sub)}>{m.label}</span>
                  {a && <span style={{ marginLeft: 'auto', ...f(11, 700, C.accent) }}>← Now</span>}
                  {d && <span style={{ marginLeft: 'auto', ...f(12, 400, C.dim) }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={() => !isDone && setMIdx(i => i + 1)}
          style={{
            width: '100%', height: 64, background: isDone ? C.successBg : C.accent,
            color: isDone ? C.successText : C.text, fontSize: 18, fontWeight: 700,
            borderRadius: 14, border: 'none', cursor: isDone ? 'default' : 'pointer',
            fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: isDone ? 'none' : '0 4px 20px rgba(243,156,18,.25)', transition: 'all 150ms',
          }}>
          {isDone ? (<><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>Job Delivered!</>) : `Mark as ${MILESTONES[mIdx + 1]?.label || ''}`}
        </button>
      </div>
    </div>
  )
}

function EarningsPage() {
  const vals = [3, 5, 4, 7, 6, 9, 2]
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const max = Math.max(...vals)
  return (
    <div style={{ flex: 1, paddingBottom: 80, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 14 }}>
          {labels.map((d, i) => (
            <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', borderRadius: '5px 5px 0 0', height: `${(vals[i] / max) * 72}px`, background: i === 5 ? C.accent : C.primary, opacity: i === 6 ? .35 : 1 }} />
              <span style={f(10, i === 5 ? 700 : 400, i === 5 ? C.accent : C.dim)}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={card()}>
        <div style={{ ...f(12, 700, C.sub), marginBottom: 12 }}>RECENT TRIPS</div>
        {[{ p: 'RAC 123 A', s: 'Full Body Wash', a: 8000, t: '10:45 AM' }, { p: 'RAB 456 B', s: 'Premium Detail', a: 18000, t: '09:10 AM' }, { p: 'RAE 012 D', s: 'Quick Rinse', a: 3000, t: 'Yesterday' }].map((t, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div>
              <div style={f(13, 600)}>{t.p}</div>
              <div style={f(11, 400, C.dim)}>{t.s} - {t.t}</div>
            </div>
            <div style={f(14, 700, C.primary)}>RWF {t.a.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DriverPortal() {
  const [page, setPage] = useState('requests')
  const [activeReq, setActiveReq] = useState(null)
  const [isOnline, setIsOnline] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: C.bg }}>
      <TopBar isOnline={isOnline} setIsOnline={setIsOnline} />
      {page === 'requests' && <RequestsPage setPage={setPage} setActiveReq={setActiveReq} isOnline={isOnline} />}
      {page === 'active' && activeReq && <ActiveJobPage req={activeReq} setPage={setPage} />}
      {page === 'active' && !activeReq && <RequestsPage setPage={setPage} setActiveReq={setActiveReq} isOnline={isOnline} />}
      {page === 'earnings' && <EarningsPage />}
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
