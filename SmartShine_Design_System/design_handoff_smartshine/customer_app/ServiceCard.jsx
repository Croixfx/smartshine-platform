// SmartShine — ServiceCard Component
const CATEGORY_STYLES = {
  automatic:   { background: '#EDE9FE', color: '#6D28D9' },
  traditional: { background: '#FEF3C7', color: '#92400E' },
  mobile:      { background: '#DCFCE7', color: '#15803D' },
};

function ServiceCard({ service, onBook }) {
  const catStyle = CATEGORY_STYLES[service.category] || { background: '#F3F4F6', color: '#6B7280' };
  const s = {
    card: {
      background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.04)',
      padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
    },
    info: { flex: 1, minWidth: 0 },
    nameRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    name: { fontSize: '14px', fontWeight: 700, color: '#1a1a2e', fontFamily: "'DM Sans', sans-serif" },
    badge: { ...catStyle, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', fontFamily: "'DM Sans', sans-serif" },
    desc: { fontSize: '12px', color: '#888', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" },
    dur: { fontSize: '11px', color: '#aaa', marginTop: '3px', fontFamily: "'DM Sans', sans-serif" },
    right: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
    price: { fontSize: '16px', fontWeight: 800, color: '#1A5276', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
    bookBtn: {
      background: service.is_available ? '#2E86C1' : '#e5e7eb',
      color: service.is_available ? 'white' : '#aaa',
      fontSize: '12px', fontWeight: 600, padding: '8px 16px', borderRadius: '10px',
      border: 'none', cursor: service.is_available ? 'pointer' : 'not-allowed',
      fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
      transition: 'background 150ms',
    },
  };
  return React.createElement('div', { style: s.card },
    React.createElement('div', { style: s.info },
      React.createElement('div', { style: s.nameRow },
        React.createElement('span', { style: s.name }, service.name),
        React.createElement('span', { style: s.badge }, service.category_display || service.category),
        !service.is_available && React.createElement('span', { style: { fontSize: '11px', color: '#aaa', fontStyle: 'italic' } }, 'Unavailable')
      ),
      service.description && React.createElement('div', { style: s.desc }, service.description),
      React.createElement('div', { style: s.dur }, `${service.duration_minutes} min`)
    ),
    React.createElement('div', { style: s.right },
      React.createElement('span', { style: s.price }, `RWF ${Number(service.price).toLocaleString()}`),
      React.createElement('button', { style: s.bookBtn, disabled: !service.is_available, onClick: () => service.is_available && onBook(service) }, 'Book Now')
    )
  );
}
Object.assign(window, { ServiceCard });
