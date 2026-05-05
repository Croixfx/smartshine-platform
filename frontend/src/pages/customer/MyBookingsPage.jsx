import { useState, useEffect } from 'react'
import client from '../../api/client'

const STATUS_STEPS = {
  pending: { steps: ['Pending', 'Confirmed', 'In Progress', 'Completed'], current: 0 },
  confirmed: { steps: ['Pending', 'Confirmed', 'In Progress', 'Completed'], current: 1 },
  in_progress: { steps: ['Pending', 'Confirmed', 'In Progress', 'Completed'], current: 2 },
  completed: { steps: ['Pending', 'Confirmed', 'In Progress', 'Completed'], current: 3 },
  cancelled: { steps: ['Pending', 'Cancelled'], current: 1 },
}

const STATUS_STYLE = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1D4ED8' },
  in_progress: { bg: '#EDE9FE', text: '#6D28D9' },
  completed: { bg: '#DCFCE7', text: '#15803D' },
  cancelled: { bg: '#FEE2E2', text: '#B91C1C' },
}

function BookingProgressBar({ status }) {
  const cfg = STATUS_STEPS[status] || STATUS_STEPS.pending
  const col = status === 'cancelled' ? '#DC2626' : '#1A5276'
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {cfg.steps.map((s, i) => (
          <div key={s} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= cfg.current ? col : '#E9ECEF', transition: 'background 200ms',
              }}>
                {i < cfg.current
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === cfg.current ? 'white' : '#ccc' }} />}
              </div>
              <span style={{ fontSize: 9, color: i <= cfg.current ? col : '#ccc', fontWeight: i === cfg.current ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < cfg.steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < cfg.current ? col : '#E9ECEF', margin: '0 4px', marginBottom: 14, transition: 'background 200ms' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    client.get('bookings/')
      .then(({ data }) => setBookings(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
  const history = bookings.filter(b => ['completed', 'cancelled', 'done'].includes(b.status))
  const list = tab === 'active' ? active : history

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>My Bookings</h2>

        <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 12, padding: 4, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)', width: 'fit-content' }}>
          {[['active', `Active (${active.length})`], ['history', `History (${history.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms',
              background: tab === id ? '#1A5276' : 'transparent',
              color: tab === id ? 'white' : '#888',
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                <div style={{ height: 16, background: '#E9ECEF', borderRadius: 8, width: '40%', marginBottom: 10 }} />
                <div style={{ height: 12, background: '#E9ECEF', borderRadius: 6, width: '70%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(b => {
              const sc = STATUS_STYLE[b.status] || { bg: '#F3F4F6', text: '#6B7280' }
              return (
                <div key={b.id} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
                        Booking #{b.id} - {b.branch_name || 'Branch'}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {b.service_name || 'Service'} - {new Date(b.scheduled_at).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <span style={{
                      ...sc, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999,
                      textTransform: 'capitalize', flexShrink: 0,
                    }}>
                      {(b.status || '').replace('_', ' ')}
                    </span>
                  </div>
                  {tab === 'active' && <BookingProgressBar status={b.status} />}
                </div>
              )
            })}
            {list.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No {tab} bookings.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
