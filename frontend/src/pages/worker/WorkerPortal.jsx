import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

const C = {
  primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1',
  accent: '#F39C12', bg: '#F0F4F8', surface: '#FFFFFF', border: '#E2E8F0',
  text: '#1E293B', sub: '#64748B', dim: '#94A3B8',
  success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D',
  warning: '#F59E0B', warningBg: '#FEF3C7', warningText: '#92400E',
  purple: '#8B5CF6', purpleBg: '#EDE9FE', sidebar: '#0F2744',
}

const STATUS_FLOW = ['received', 'washing', 'rinsing', 'drying', 'done']
const STATUS_LABELS = { received: 'Received', washing: 'Washing', rinsing: 'Rinsing', drying: 'Drying', done: 'Done' }
const STATUS_COLORS = {
  received: { bg: '#FEF3C7', text: '#92400E' },
  washing:  { bg: '#DBEAFE', text: '#1D4ED8' },
  rinsing:  { bg: '#EDE9FE', text: '#7C3AED' },
  drying:   { bg: '#FEF9C3', text: '#B45309' },
  done:     { bg: '#DCFCE7', text: '#15803D' },
}
const NEXT_ACTION        = { received: 'Mark Washing', washing: 'Mark Rinsing', rinsing: 'Mark Drying', drying: 'Mark Done', done: 'Done' }
const NEXT_ACTION_BG     = { received: '#2E86C1', washing: '#8B5CF6', rinsing: '#D97706', drying: '#22C55E', done: '#DCFCE7' }
const NEXT_ACTION_COLOR  = { received: '#fff', washing: '#fff', rinsing: '#fff', drying: '#fff', done: '#15803D' }

const f = (size, weight = 400, color = C.text) => ({ fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color })
const card = (extra = {}) => ({ background: C.surface, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.07)', padding: 20, ...extra })
const badge = (status) => {
  const sc = STATUS_COLORS[status] || { bg: '#F1F5F9', text: '#64748B' }
  return { background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, display: 'inline-block', textTransform: 'capitalize' }
}

const QueueIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
const ActiveIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const HistoryIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/></svg>
const LogoutIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const CameraIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>

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

function Sidebar({ page, setPage, workerName, onShift, setOnShift, logout }) {
  const nav = [
    { id: 'queue',   label: 'Queue',      Icon: QueueIcon },
    { id: 'active',  label: 'Active Job', Icon: ActiveIcon },
    { id: 'history', label: 'History',    Icon: HistoryIcon },
  ]
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Worker Portal</div>
      </div>
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {nav.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
              borderRadius: 9, marginBottom: 2, cursor: 'pointer', textAlign: 'left',
              background: active ? 'rgba(255,255,255,.11)' : 'none',
              border: `1px solid ${active ? 'rgba(255,255,255,.16)' : 'transparent'}`,
              color: active ? 'white' : 'rgba(255,255,255,.45)',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'all 150ms',
            }}>
              <Icon size={18} />
              {label}
              {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.accent }} />}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '16px 20px 28px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={f(13, 600, 'rgba(255,255,255,.9)')}>{workerName}</div>
          <div style={f(11, 400, 'rgba(255,255,255,.35)')}>Worker</div>
        </div>
        <button onClick={() => setOnShift(s => !s)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', borderRadius: 8,
          padding: '8px 12px', cursor: 'pointer', marginBottom: 8, transition: 'all 150ms',
          background: onShift ? 'rgba(34,197,94,.13)' : 'rgba(255,255,255,.05)',
          border: `1px solid ${onShift ? 'rgba(34,197,94,.28)' : 'rgba(255,255,255,.09)'}`,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: onShift ? C.success : 'rgba(255,255,255,.25)', flexShrink: 0 }} />
          <span style={f(12, 600, onShift ? '#86EFAC' : 'rgba(255,255,255,.35)')}>{onShift ? 'On Shift' : 'Off Shift'}</span>
          <div style={{ marginLeft: 'auto', width: 32, height: 18, borderRadius: 9, background: onShift ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.1)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: onShift ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: onShift ? C.success : 'rgba(255,255,255,.3)', transition: 'left 200ms' }} />
          </div>
        </button>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.35)', transition: 'color 150ms' }}>
          <LogoutIcon size={15} />Logout
        </button>
      </div>
    </aside>
  )
}

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'queue', label: 'Queue', Icon: QueueIcon },
    { id: 'active', label: 'Active', Icon: ActiveIcon },
    { id: 'history', label: 'History', Icon: HistoryIcon },
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

function StatsRow({ jobs, isDesktop }) {
  const pending = jobs.filter(j => j.status !== 'done').length
  const done = jobs.filter(j => j.status === 'done').length
  return (
    <div style={{ display: 'flex', gap: isDesktop ? 20 : 10, marginBottom: isDesktop ? 28 : 16 }}>
      {[[pending, 'In Queue', C.secondary], [done, 'Completed Today', C.success], ['--', 'Avg Time (min)', C.accent]].map(([v, label, color]) => (
        <div key={label} style={{ ...card({ padding: isDesktop ? '22px 24px' : 12 }), flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isDesktop ? 32 : 22, fontWeight: 700, color, lineHeight: 1 }}>{v}</div>
          <div style={f(isDesktop ? 13 : 10, 500, C.sub)}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function JobTable({ jobs, setActiveJob, setPage }) {
  const pending = jobs.filter(j => j.status !== 'done')
  const done = jobs.filter(j => j.status === 'done')
  const th = { padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }
  const td = { padding: '13px 16px', borderBottom: `1px solid ${C.border}` }
  return (
    <div style={card({ padding: 0, overflow: 'hidden' })}>
      <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={f(16, 700)}>Job Queue</div>
        <span style={f(13, 400, C.sub)}>{pending.length} pending</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Plate No.', 'Vehicle', 'Service', 'Status', 'Scheduled', 'Duration', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {pending.map(job => (
              <tr key={job.id} style={{ background: 'white', transition: 'background 100ms', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={td}><span style={f(14, 700)}>{job.plate}</span></td>
                <td style={td}><span style={f(13, 400, C.sub)}>{job.vehicle_info || '—'}</span></td>
                <td style={td}><span style={f(13, 400)}>{job.service_name}</span></td>
                <td style={td}><span style={badge(job.status)}>{STATUS_LABELS[job.status] || job.status}</span></td>
                <td style={td}><span style={f(13, 600, C.primary)}>{job.scheduled_time}</span></td>
                <td style={td}><span style={f(13, 400, C.sub)}>{job.duration !== '--' ? `${job.duration} min` : '—'}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button onClick={() => { setActiveJob(job); setPage('active') }} style={{ padding: '7px 18px', background: NEXT_ACTION_BG[job.status] || C.secondary, color: NEXT_ACTION_COLOR[job.status] || 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Start Job
                  </button>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                <div style={f(15, 600, C.success)}>Queue is clear</div>
                <div style={f(13, 400, C.dim)}>Great work today!</div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {done.length > 0 && (
        <>
          <div style={{ padding: '10px 20px 8px', borderTop: `1px solid ${C.border}`, background: '#FAFBFC' }}>
            <span style={f(11, 700, C.dim)}>COMPLETED TODAY ({done.length})</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {done.map(job => (
                <tr key={job.id} style={{ opacity: 0.55 }}>
                  <td style={{ padding: '10px 16px' }}><span style={f(14, 600)}>{job.plate}</span></td>
                  <td style={{ padding: '10px 16px' }}><span style={f(13, 400, C.sub)}>{job.vehicle_info || '—'}</span></td>
                  <td style={{ padding: '10px 16px' }}><span style={f(13, 400)}>{job.service_name}</span></td>
                  <td style={{ padding: '10px 16px' }}><span style={badge('done')}>Done</span></td>
                  <td colSpan={3} />
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

function DesktopActiveJob({ job, jobs, setJobs, setPage }) {
  const [photoTaken, setPhotoTaken] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [localStatus, setLocalStatus] = useState(job.status)
  const idx = STATUS_FLOW.indexOf(localStatus)
  const isDone = localStatus === 'done'

  const advance = () => {
    if (isDone) return
    const next = STATUS_FLOW[idx + 1]
    setLocalStatus(next)
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: next } : j))
    if (job.id) client.patch(`bookings/${job.id}/`, { status: next === 'done' ? 'completed' : next }).catch(() => {})
  }

  return (
    <div>
      <div style={{ ...card(), marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{job.plate}</div>
          <div style={f(13, 400, C.sub)}>{[job.vehicle_info, job.customer_name].filter(Boolean).join(' · ')}</div>
        </div>
        <span style={{ ...badge(localStatus), fontSize: 13, padding: '5px 14px' }}>{STATUS_LABELS[localStatus]}</span>
        <div style={{ display: 'flex', gap: 28, marginLeft: 'auto' }}>
          {[['SERVICE', job.service_name], ['DURATION', job.duration !== '--' ? `${job.duration} min` : '—']].map(([k, v]) => (
            <div key={k}><div style={f(10, 700, C.sub)}>{k}</div><div style={f(14, 600)}>{v}</div></div>
          ))}
        </div>
        <button onClick={() => setPage('queue')} style={{ padding: '8px 18px', background: '#F1F5F9', border: 'none', borderRadius: 9, cursor: 'pointer', ...f(13, 600, C.sub) }}>
          ← Back to Queue
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card()}>
          <div style={f(11, 700, C.sub)}>PROGRESS</div>
          <div style={{ marginTop: 20 }}>
            {STATUS_FLOW.map((s, i) => {
              const done = i < idx, active = i === idx, future = i > idx
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? C.primary : active ? C.accent : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 250ms' }}>
                      {done && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                      {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white' }} />}
                      {future && <span style={f(12, 700, '#CBD5E1')}>{i + 1}</span>}
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div style={{ width: 2, height: 28, background: i < idx ? C.primary : '#E2E8F0', transition: 'background 250ms' }} />}
                  </div>
                  <div style={{ paddingTop: 7, paddingBottom: i < STATUS_FLOW.length - 1 ? 16 : 0 }}>
                    <div style={f(15, active ? 700 : future ? 400 : 500, active ? C.text : future ? C.dim : C.sub)}>{STATUS_LABELS[s]}</div>
                    {active && <div style={f(12, 400, C.accent)}>In progress</div>}
                    {done && <div style={f(12, 400, C.dim)}>Completed</div>}
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={advance} disabled={isDone} style={{ width: '100%', height: 52, marginTop: 24, border: 'none', borderRadius: 10, cursor: isDone ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 150ms', background: isDone ? C.successBg : (NEXT_ACTION_BG[localStatus] || C.secondary), color: isDone ? C.successText : (NEXT_ACTION_COLOR[localStatus] || 'white'), boxShadow: isDone ? 'none' : '0 4px 14px rgba(0,0,0,.1)' }}>
            {isDone ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Job Complete!</> : NEXT_ACTION[localStatus]}
          </button>
        </div>

        <div style={card()}>
          <div style={f(11, 700, C.sub)}>PLATE PHOTO</div>
          {!photoTaken ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 190, background: '#F8FAFC', borderRadius: 10, marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #CBD5E1', gap: 8, color: C.dim }}>
                <CameraIcon size={40} />
                <div style={f(13, 400, C.dim)}>No photo captured yet</div>
              </div>
              <button onClick={() => { setCapturing(true); setTimeout(() => { setCapturing(false); setPhotoTaken(true) }, 1100) }} style={{ width: '100%', height: 52, background: capturing ? C.primaryDark : C.primary, color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 150ms' }}>
                {capturing
                  ? <><div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: 'white', animation: 'wpSpin 0.8s linear infinite' }} />Capturing...</>
                  : <><CameraIcon size={20} />Capture Plate Photo</>}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 16, background: C.successBg, borderRadius: 10, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>📸</div>
              <div style={f(15, 700, C.successText)}>Photo Captured</div>
              <div style={f(12, 400, C.successText)}>plate_photo.jpg</div>
              <button onClick={() => setPhotoTaken(false)} style={{ marginTop: 14, padding: '7px 20px', background: 'none', border: `1px solid ${C.successText}`, borderRadius: 8, cursor: 'pointer', ...f(13, 600, C.successText) }}>Retake</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileQueue({ jobs, setActiveJob, setPage }) {
  const pending = jobs.filter(j => j.status !== 'done')
  const done = jobs.filter(j => j.status === 'done')
  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatsRow jobs={jobs} isDesktop={false} />
      {pending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={f(15, 600, C.success)}>Queue Clear</div>
          <div style={f(13, 400, C.dim)}>Great work!</div>
        </div>
      )}
      {pending.map(job => (
        <div key={job.id} style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={f(16, 700)}>{job.plate}</span>
                <span style={badge(job.status)}>{STATUS_LABELS[job.status] || job.status}</span>
              </div>
              <div style={f(13, 400, C.sub)}>{job.service_name}</div>
              <div style={f(11, 400, C.dim)}>{job.vehicle_info}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={f(14, 600, C.primary)}>{job.scheduled_time}</div>
              <div style={f(11, 400, C.dim)}>{job.duration !== '--' ? `${job.duration} min` : ''}</div>
            </div>
          </div>
          <button onClick={() => { setActiveJob(job); setPage('active') }} style={{ width: '100%', height: 52, background: NEXT_ACTION_BG[job.status] || C.secondary, color: NEXT_ACTION_COLOR[job.status] || 'white', fontSize: 15, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            Start Job
          </button>
        </div>
      ))}
      {done.length > 0 && (
        <>
          <div style={f(11, 700, C.dim)}>COMPLETED TODAY ({done.length})</div>
          {done.map(j => (
            <div key={j.id} style={{ ...card({ padding: 12 }), opacity: 0.65, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><span style={f(14, 600)}>{j.plate}</span><span style={{ ...f(12, 400, C.sub), marginLeft: 8 }}>{j.service_name}</span></div>
              <span style={badge('done')}>Done</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function MobileActiveJob({ job, jobs, setJobs, setPage }) {
  const [photoTaken, setPhotoTaken] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [localStatus, setLocalStatus] = useState(job.status)
  const idx = STATUS_FLOW.indexOf(localStatus)
  const isDone = localStatus === 'done'

  const advance = () => {
    if (isDone) return
    const next = STATUS_FLOW[idx + 1]
    setLocalStatus(next)
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: next } : j))
    if (job.id) client.patch(`bookings/${job.id}/`, { status: next === 'done' ? 'completed' : next }).catch(() => {})
  }

  return (
    <div style={{ padding: 16, paddingBottom: 88, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{job.plate}</div>
            <div style={f(13, 400, C.sub)}>{job.vehicle_info}</div>
            <div style={f(12, 400, C.dim)}>Customer: {job.customer_name || 'Customer'}</div>
          </div>
          <span style={badge(localStatus)}>{STATUS_LABELS[localStatus]}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Service', job.service_name], ['Duration', job.duration !== '--' ? `${job.duration} min` : '—']].map(([k, v]) => (
            <div key={k} style={{ background: C.bg, borderRadius: 8, padding: '10px 12px' }}>
              <div style={f(10, 700, C.dim)}>{k.toUpperCase()}</div>
              <div style={f(13, 600)}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card()}>
        <div style={f(11, 700, C.sub)}>PROGRESS</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
          {STATUS_FLOW.map((s, i) => {
            const done = i < idx, active = i === idx
            return (
              <div key={s} style={{ display: 'contents' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? C.primary : active ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}>
                    {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={f(9, active ? 700 : 400, active ? C.primary : C.dim)}>{STATUS_LABELS[s]}</span>
                </div>
                {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? C.primary : C.border, margin: '0 3px', marginBottom: 16, transition: 'background 200ms' }} />}
              </div>
            )
          })}
        </div>
      </div>

      <div style={card()}>
        <div style={f(11, 700, C.sub)}>PLATE PHOTO</div>
        {!photoTaken ? (
          <button onClick={() => { setCapturing(true); setTimeout(() => { setCapturing(false); setPhotoTaken(true) }, 1100) }} style={{ width: '100%', height: 56, marginTop: 12, background: capturing ? C.primaryDark : C.primary, color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {capturing ? <><div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: 'white', animation: 'wpSpin 0.8s linear infinite' }} />Capturing...</> : <><CameraIcon size={20} />Capture Plate Photo</>}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.successBg, borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
            <div style={{ fontSize: 22 }}>📸</div>
            <div><div style={f(13, 700, C.successText)}>Photo captured</div><div style={f(11, 400, C.successText)}>plate_photo.jpg</div></div>
            <button onClick={() => setPhotoTaken(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', ...f(12, 700, C.successText) }}>Retake</button>
          </div>
        )}
      </div>

      <button onClick={advance} disabled={isDone} style={{ width: '100%', height: 60, border: 'none', borderRadius: 14, cursor: isDone ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 150ms', background: isDone ? C.successBg : (NEXT_ACTION_BG[localStatus] || C.secondary), color: isDone ? C.successText : (NEXT_ACTION_COLOR[localStatus] || 'white'), boxShadow: isDone ? 'none' : '0 4px 16px rgba(0,0,0,.12)' }}>
        {isDone ? <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Job Complete!</> : NEXT_ACTION[localStatus]}
      </button>
      {!isDone && <p style={{ textAlign: 'center', ...f(11, 400, C.dim), margin: 0 }}>Next: {STATUS_LABELS[STATUS_FLOW[idx + 1]]}</p>}
    </div>
  )
}

function HistoryList({ isDesktop }) {
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    client.get('bookings/?status=completed')
      .then(({ data }) => setBookings((data.results ?? data).slice(0, 20)))
      .catch(() => {})
  }, [])

  if (isDesktop) {
    return (
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={f(16, 700)}>Job History</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Plate No.', 'Service', 'Status', 'Date'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', ...f(11, 600, C.sub), textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, ...f(14, 400, C.dim) }}>No completed jobs yet.</td></tr>}
            {bookings.map((h, i) => (
              <tr key={h.id} style={{ borderBottom: i < bookings.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '12px 16px' }}><span style={f(14, 700)}>{h.vehicle_plate || `#${h.id}`}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(13, 400)}>{h.service_name || 'Service'}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={badge('done')}>Done</span></td>
                <td style={{ padding: '12px 16px' }}><span style={f(13, 400, C.sub)}>{h.created_at ? new Date(h.created_at).toLocaleDateString() : '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bookings.length === 0 && <div style={{ textAlign: 'center', padding: 32, ...f(14, 400, C.dim) }}>No completed jobs yet.</div>}
      {bookings.map(h => (
        <div key={h.id} style={{ ...card(), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={f(15, 700)}>{h.vehicle_plate || `#${h.id}`}</div><div style={f(12, 400, C.sub)}>{h.service_name || 'Service'}</div></div>
          <span style={badge('done')}>Done</span>
        </div>
      ))}
    </div>
  )
}

export default function WorkerPortal() {
  const { user, logout } = useAuth()
  const isDesktop = useDesktop()
  const [page, setPage] = useState('queue')
  const [activeJob, setActiveJob] = useState(null)
  const [jobs, setJobs] = useState([])
  const [onShift, setOnShift] = useState(true)

  useEffect(() => {
    client.get('bookings/?status=confirmed,in_progress,pending')
      .then(({ data }) => {
        const results = data.results ?? data
        setJobs(results.map(b => ({
          id: b.id,
          plate: b.vehicle_plate || `#${b.id}`,
          service_name: b.service_name || 'Service',
          vehicle_info: b.vehicle_info || '',
          customer_name: b.customer_name || 'Customer',
          scheduled_time: b.scheduled_at ? new Date(b.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
          duration: b.duration_minutes || '--',
          status: b.status === 'confirmed' ? 'received' : b.status === 'in_progress' ? 'washing' : 'received',
        })))
      })
      .catch(() => {
        setJobs([
          { id: 1, plate: 'RAC 123 A', service_name: 'Full Body Wash', vehicle_info: 'Toyota Corolla · White', customer_name: 'John D.', scheduled_time: '10:30', duration: 45, status: 'washing' },
          { id: 2, plate: 'RAB 456 B', service_name: 'Quick Rinse', vehicle_info: 'Honda CR-V · Silver', customer_name: 'Marie C.', scheduled_time: '11:00', duration: 20, status: 'received' },
          { id: 3, plate: 'RAE 789 C', service_name: 'Premium Detail', vehicle_info: 'Toyota RAV4 · Black', customer_name: 'Patrick N.', scheduled_time: '12:15', duration: 90, status: 'received' },
        ])
      })
  }, [])

  const navigate = (p) => {
    if (p === 'active' && !activeJob) return
    setPage(p)
  }

  const activePage = (page === 'active' && !activeJob) ? 'queue' : page
  const workerName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Worker'

  const pageTitle = { queue: ['Job Queue', 'Manage your wash queue for today'], active: ['Active Job', 'Track progress and capture plate photo'], history: ['Job History', 'All completed wash jobs'] }

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <style>{`@keyframes wpSpin{to{transform:rotate(360deg)}}`}</style>
        <Sidebar page={activePage} setPage={navigate} workerName={workerName} onShift={onShift} setOnShift={setOnShift} logout={logout} />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 1200 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, marginBottom: 4, color: C.text }}>{pageTitle[activePage]?.[0]}</div>
              <div style={f(14, 400, C.sub)}>{pageTitle[activePage]?.[1]}</div>
            </div>
            {activePage === 'queue' && <><StatsRow jobs={jobs} isDesktop /><JobTable jobs={jobs} setActiveJob={setActiveJob} setPage={setPage} /></>}
            {activePage === 'active' && activeJob && <DesktopActiveJob job={activeJob} jobs={jobs} setJobs={setJobs} setPage={setPage} />}
            {activePage === 'history' && <HistoryList isDesktop />}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <style>{`@keyframes wpSpin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background: C.primary, padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
          <div style={f(11, 400, 'rgba(255,255,255,.5)')}>Worker Portal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: onShift ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.1)', borderRadius: 20, padding: '5px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: onShift ? C.success : C.dim }} />
          <span style={f(11, 600, onShift ? '#86EFAC' : 'rgba(255,255,255,.4)')}>{onShift ? 'On Shift' : 'Off Shift'}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activePage === 'queue' && <MobileQueue jobs={jobs} setActiveJob={setActiveJob} setPage={setPage} />}
        {activePage === 'active' && activeJob && <MobileActiveJob job={activeJob} jobs={jobs} setJobs={setJobs} setPage={setPage} />}
        {activePage === 'history' && <HistoryList isDesktop={false} />}
      </div>
      <BottomNav page={activePage} setPage={navigate} />
    </div>
  )
}
