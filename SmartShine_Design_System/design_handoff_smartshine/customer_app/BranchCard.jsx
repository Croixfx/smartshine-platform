// SmartShine — BranchCard Component
function BranchCard({ branch, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const s = {
    card: {
      background: 'white', borderRadius: '16px',
      boxShadow: hovered ? '0 4px 20px rgba(0,0,0,.08)' : '0 2px 12px rgba(0,0,0,.04)',
      padding: '20px', cursor: 'pointer', transition: 'box-shadow 200ms ease',
      display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', border: 'none', width: '100%',
    },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' },
    name: { fontSize: '15px', fontWeight: 700, color: hovered ? '#2E86C1' : '#1a1a2e', transition: 'color 150ms', fontFamily: "'DM Sans', sans-serif" },
    badge: (active) => ({
      fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '9999px',
      background: active ? '#DCFCE7' : '#F3F4F6',
      color: active ? '#15803D' : '#6B7280',
      flexShrink: 0, fontFamily: "'DM Sans', sans-serif",
    }),
    address: { fontSize: '13px', color: '#888', lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif" },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', paddingTop: '4px', fontFamily: "'DM Sans', sans-serif" },
    cta: { fontSize: '12px', fontWeight: 600, color: '#2E86C1' },
  };
  return React.createElement('button', {
    style: s.card, onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  },
    React.createElement('div', { style: s.header },
      React.createElement('div', { style: s.name }, branch.name),
      React.createElement('span', { style: s.badge(branch.is_active) }, branch.is_active ? 'Open' : 'Closed')
    ),
    React.createElement('div', { style: s.address }, branch.address),
    React.createElement('div', { style: s.footer },
      React.createElement('span', null, `${branch.opening_time} – ${branch.closing_time}`),
      React.createElement('span', { style: s.cta }, 'View →')
    )
  );
}
Object.assign(window, { BranchCard });
