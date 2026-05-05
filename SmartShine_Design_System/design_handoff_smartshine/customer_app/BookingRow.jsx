// SmartShine — BookingRow Component
const BOOKING_STATUS = {
  pending:     { background: '#FEF3C7', color: '#92400E' },
  confirmed:   { background: '#DBEAFE', color: '#1D4ED8' },
  in_progress: { background: '#EDE9FE', color: '#6D28D9' },
  completed:   { background: '#DCFCE7', color: '#15803D' },
  cancelled:   { background: '#FEE2E2', color: '#B91C1C' },
};

function BookingRow({ booking }) {
  const status = BOOKING_STATUS[booking.status] || { background: '#F3F4F6', color: '#6B7280' };
  const s = {
    card: {
      background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.04)',
      padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    left: {},
    num: { fontSize: '14px', fontWeight: 600, color: '#1a1a2e', fontFamily: "'DM Sans', sans-serif" },
    meta: { fontSize: '12px', color: '#888', marginTop: '3px', fontFamily: "'DM Sans', sans-serif" },
    badge: { ...status, fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', textTransform: 'capitalize', fontFamily: "'DM Sans', sans-serif" },
  };
  const date = new Date(booking.scheduled_at).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' });
  return React.createElement('div', { style: s.card },
    React.createElement('div', { style: s.left },
      React.createElement('div', { style: s.num }, `Booking #${booking.id} · ${booking.branch_name}`),
      React.createElement('div', { style: s.meta }, `${booking.service_name} · ${date}`)
    ),
    React.createElement('span', { style: s.badge }, booking.status.replace('_', ' '))
  );
}
Object.assign(window, { BookingRow });
