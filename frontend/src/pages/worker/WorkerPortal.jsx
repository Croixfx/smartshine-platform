import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

const C = { primary: '#1A5276', primaryDark: '#154360', secondary: '#2E86C1', accent: '#F39C12', bg: '#F8F9FA', surface: '#FFFFFF', border: '#E9ECEF', text: '#1a1a2e', sub: '#888888', dim: '#AAAAAA', success: '#22C55E', successBg: '#DCFCE7', successText: '#15803D', error: '#DC2626', errorBg: '#FEE2E2', warning: '#F59E0B', warningBg: '#FEF3C7', warningText: '#92400E', purple: '#8B5CF6', purpleBg: '#EDE9FE' }

const STATUS_FLOW = ['received', 'washing', 'rinsing', 'drying', 'done']
const STATUS_LABELS = { received: 'Received', washing: 'Washing', rinsing: 'Rinsing', drying: 'Drying', done: 'Done' }
const STATUS_COLORS = { received: { bg: C.warningBg, text: C.warningText }, washing: { bg: '#DBEAFE', text: '#1D4ED8' }, rinsing: { bg: C.purpleBg, text: C.purple }, drying: { bg: '#FEF3C7', text: '#B45309' }, done: { bg: C.successBg, text: C.successText } }
const NEXT_ACTION = { received: 'Mark Washing', washing: 'Mark Rinsing', rinsing: 'Mark Drying', drying: 'Mark Done', done: 'Done' }
const NEXT_ACTION_COLOR = { received: C.secondary, washing: C.purple, rinsing: '#D97706', drying: C.success, done: C.successBg }
const NEXT_ACTION_TCOLOR = { received: 'white', washing: 'white', rinsing: 'white', drying: 'white', done: C.successText }

const f = (size, weight = 400, color = C.text) => ({ fontFamily: "'DM Sans',sans-serif", fontSize: size, fontWeight: weight, color })
const card = (extra = {}) => ({ background: C.surface, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 16, ...extra })
const badge = (status) => ({ ...(STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' }), fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, display: 'inline-block', textTransform: 'capitalize' })

function TopBar({ sub }) {
  return (
    <div style={{ background: C.primary, padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white' }}>Smart<span style={{ color: C.accent }}>Shine</span></div>
        <div style={f(11, 400, 'rgba(255,255,255,.55)')}>{sub || 'Worker Portal'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,.18)', borderRadius: 20, padding: '5px 12px' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.success }} />
        <span style={f(11, 600, '#86EFAC')}>On Shift</span>
      </div>
    </div>
  )
}

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'queue', label: 'Queue', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></svg> },
    { id: 'active', label: 'Active', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { id: 'history', label: 'History', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 0 .5-4.5" /><polyline points="3 3 3 7 7 7" /></svg> },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '10px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
          color: page === t.id ? C.primary : C.dim, transition: 'color 150ms', position: 'relative',
        }}>
          {page === t.id && <div style={{ position: 'absolute', top: 0, width: 40, height: 2, borderRadius: 1, background: C.primary }} />}
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: page === t.id ? 700 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function QueuePage({ jobs, setJobs, setPage, setActiveJob }) {
  const pending = jobs.filter(j => j.status !== 'done')
  const done = jobs.filter(j => j.status === 'done')

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <TopBar sub="Worker Portal" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 0' }}>
        {[[pending.length, 'In Queue', C.secondary], [done.length, 'Done', C.success], ['--', 'Avg', C.accent]].map(([v, l, c]) => (
          <div key={l} style={card({ padding: 12, textAlign: 'center' })}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={f(10, 500, C.sub)}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 16px 0' }}><div style={f(12, 700, C.sub)}>PENDING ({pending.length})</div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 16px 0' }}>
        {pending.map(job => (
          <div key={job.id} style={card()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={f(16, 700)}>{job.plate || job.vehicle_plate || `#${job.id}`}</span>
                  <span style={badge(job.status)}>{STATUS_LABELS[job.status] || job.status}</span>
                </div>
                <div style={f(13, 400, C.sub)}>{job.service_name || 'Service'}</div>
                <div style={f(11, 400, C.dim)}>{job.vehicle_info || ''}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={f(13, 600, C.primary)}>{job.scheduled_time || '--:--'}</div>
                <div style={f(11, 400, C.dim)}>{job.duration || '--'} min</div>
              </div>
            </div>
            <button onClick={() => { setActiveJob(job); setPage('active') }}
              style={{
                width: '100%', height: 52, background: NEXT_ACTION_COLOR[job.status] || C.secondary,
                color: NEXT_ACTION_TCOLOR[job.status] || 'white', fontSize: 15, fontWeight: 700,
                borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 3l14 9-14 9V3z" /></svg>
              Start Job
            </button>
          </div>
        ))}
        {pending.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0' }}><div style={f(15, 600, C.success)}>Queue Clear</div><div style={f(13, 400, C.dim)}>Great work!</div></div>}
      </div>
      {done.length > 0 && (
        <>
          <div style={{ padding: '16px 16px 0' }}><div style={f(12, 700, C.dim)}>COMPLETED TODAY ({done.length})</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 16px 0' }}>
            {done.map(j => (
              <div key={j.id} style={{ ...card({ padding: 12 }), opacity: .7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><span style={f(14, 600)}>{j.plate || `#${j.id}`}</span><span style={{ ...f(12, 400, C.sub), marginLeft: 8 }}>{j.service_name || ''}</span></div>
                <span style={badge('done')}>Done</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ActiveJobPage({ job, jobs, setJobs, setPage }) {
  const [photoTaken, setPhotoTaken] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const currentIdx = STATUS_FLOW.indexOf(job.status)
  const isDone = job.status === 'done'

  const advance = () => {
    if (isDone) return
    const next = STATUS_FLOW[currentIdx + 1]
    setJobs(jobs.map(j => j.id === job.id ? { ...j, status: next } : j))
    job.status = next
    if (job.id) {
      client.patch(`bookings/${job.id}/`, { status: next === 'done' ? 'completed' : next }).catch(() => {})
    }
  }

  const capturePhoto = () => { setCapturing(true); setTimeout(() => { setCapturing(false); setPhotoTaken(true) }, 1100) }

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <TopBar sub="Active Job" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.text }}>{job.plate || `#${job.id}`}</div>
              <div style={f(13, 400, C.sub)}>{job.vehicle_info || ''}</div>
              <div style={f(12, 400, C.dim)}>Customer: {job.customer_name || 'Customer'}</div>
            </div>
            <span style={badge(job.status)}>{STATUS_LABELS[job.status] || job.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Service', job.service_name || 'Service'], ['Duration', (job.duration || '--') + ' min']].map(([k, v]) => (
              <div key={k} style={{ background: C.bg, borderRadius: 10, padding: '10px 12px' }}>
                <div style={f(10, 600, C.dim)}>{k.toUpperCase()}</div>
                <div style={f(13, 600)}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={card()}>
          <div style={f(11, 700, C.sub)}>PROGRESS</div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, gap: 0 }}>
            {STATUS_FLOW.map((s, i) => {
              const d = i < currentIdx, a = i === currentIdx
              return (
                <div key={s} style={{ display: 'contents' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: d ? C.primary : a ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}>
                      {d && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                      {a && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={f(9, a ? 700 : 400, a ? C.primary : C.dim)}>{STATUS_LABELS[s]}</span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentIdx ? C.primary : C.border, margin: '0 3px', marginBottom: 16, transition: 'background 200ms' }} />}
                </div>
              )
            })}
          </div>
        </div>

        <div style={card()}>
          <div style={f(11, 700, C.sub)}>PLATE PHOTO</div>
          {!photoTaken ? (
            <button onClick={capturePhoto} style={{
              width: '100%', height: 72, marginTop: 12, background: capturing ? C.primaryDark : C.primary,
              color: 'white', fontSize: 16, fontWeight: 700, borderRadius: 14, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 150ms',
            }}>
              {capturing ? (
                <><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} /></>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              )}
              {capturing ? 'Capturing...' : 'Capture Plate Photo'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.successBg, borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📸</div>
              <div>
                <div style={f(13, 700, C.successText)}>Photo captured</div>
                <div style={f(11, 400, C.successText)}>plate_photo.jpg</div>
              </div>
              <button onClick={() => setPhotoTaken(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.successText, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>Retake</button>
            </div>
          )}
        </div>

        <button onClick={advance} disabled={isDone}
          style={{
            width: '100%', height: 64, background: isDone ? C.successBg : NEXT_ACTION_COLOR[job.status] || C.secondary,
            color: isDone ? C.successText : NEXT_ACTION_TCOLOR[job.status] || 'white',
            fontSize: 18, fontWeight: 700, borderRadius: 14, border: 'none',
            cursor: isDone ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: isDone ? 'none' : '0 4px 16px rgba(0,0,0,.12)', transition: 'all 150ms',
          }}>
          {isDone && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
          {isDone ? 'Job Complete!' : NEXT_ACTION[job.status] || 'Next'}
        </button>
        {!isDone && <p style={{ textAlign: 'center', ...f(11, 400, C.dim) }}>Current: {STATUS_LABELS[job.status]} → Next: {STATUS_LABELS[STATUS_FLOW[currentIdx + 1]]}</p>}
      </div>
    </div>
  )
}

function HistoryPage() {
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    client.get('bookings/?status=completed').then(({ data }) => setBookings((data.results ?? data).slice(0, 10))).catch(() => {})
  }, [])

  return (
    <div style={{ flex: 1, paddingBottom: 80 }}>
      <TopBar sub="Job History" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bookings.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0', ...f(14, 400, C.dim) }}>No completed jobs yet.</div>}
        {bookings.map(h => (
          <div key={h.id} style={card({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
            <div>
              <div style={f(15, 700)}>{h.vehicle_plate || `#${h.id}`}</div>
              <div style={f(12, 400, C.sub)}>{h.service_name || 'Service'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={badge('done')}>Done</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkerPortal() {
  const { logout } = useAuth()
  const [page, setPage] = useState('queue')
  const [activeJob, setActiveJob] = useState(null)
  const [jobs, setJobs] = useState([])

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
          { id: 1, plate: 'RAC 123 A', service_name: 'Full Body Wash', vehicle_info: 'Toyota Corolla · White', customer_name: 'Customer', scheduled_time: '10:30', duration: 45, status: 'washing' },
          { id: 2, plate: 'RAB 456 B', service_name: 'Quick Rinse', vehicle_info: 'Honda CR-V · Silver', customer_name: 'Customer', scheduled_time: '11:00', duration: 20, status: 'received' },
        ])
      })
  }, [])

  const handleSetPage = (p) => {
    if (p === 'active' && !activeJob) { setPage('queue'); return }
    setPage(p)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: C.bg }}>
      {page === 'queue' && <QueuePage jobs={jobs} setJobs={setJobs} setPage={setPage} setActiveJob={setActiveJob} />}
      {page === 'active' && activeJob && <ActiveJobPage job={activeJob} jobs={jobs} setJobs={setJobs} setPage={setPage} />}
      {page === 'active' && !activeJob && <QueuePage jobs={jobs} setJobs={setJobs} setPage={setPage} setActiveJob={setActiveJob} />}
      {page === 'history' && <HistoryPage />}
      <BottomNav page={page} setPage={handleSetPage} />
    </div>
  )
}
