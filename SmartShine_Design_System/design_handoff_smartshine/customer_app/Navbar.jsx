// SmartShine — Navbar Component
// Exports: Navbar
const { useState } = React;

function Navbar({ currentPage, setPage, user = { name: 'Sandrine U.' } }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'bookings', label: 'My Bookings' },
    { id: 'vehicles', label: 'My Vehicles' },
  ];

  const navbarStyles = {
    nav: {
      background: '#1A5276', height: '64px', display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between', position: 'sticky',
      top: 0, zIndex: 50, boxShadow: '0 1px 0 rgba(0,0,0,0.1)',
    },
    logo: {
      fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700,
      fontSize: '20px', color: 'white', letterSpacing: '-0.02em',
      cursor: 'pointer', textDecoration: 'none',
    },
    logoAccent: { color: '#F39C12' },
    links: { display: 'flex', alignItems: 'center', gap: '24px' },
    link: (active) => ({
      fontSize: '13px', fontWeight: 500, cursor: 'pointer',
      color: active ? 'white' : 'rgba(255,255,255,0.65)',
      transition: 'color 150ms', textDecoration: 'none', background: 'none',
      border: 'none', fontFamily: "'DM Sans', sans-serif",
    }),
    right: { display: 'flex', alignItems: 'center', gap: '12px' },
    userName: { fontSize: '13px', color: 'rgba(255,255,255,0.65)' },
    logoutBtn: {
      background: 'white', color: '#1A5276', fontSize: '13px', fontWeight: 600,
      padding: '6px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    hamburger: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' },
    mobileMenu: {
      background: '#154360', padding: '12px 24px 16px', display: 'flex',
      flexDirection: 'column', gap: '8px',
    },
    mobileLink: (active) => ({
      fontSize: '14px', fontWeight: 500, padding: '8px 0',
      color: active ? 'white' : 'rgba(255,255,255,0.65)',
      cursor: 'pointer', background: 'none', border: 'none',
      fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
    }),
  };

  return React.createElement('div', null,
    React.createElement('nav', { style: navbarStyles.nav },
      React.createElement('span', {
        style: navbarStyles.logo,
        onClick: () => setPage('home'),
      }, 'Smart', React.createElement('span', { style: navbarStyles.logoAccent }, 'Shine')),

      React.createElement('div', { style: { ...navbarStyles.links, display: window.innerWidth < 640 ? 'none' : 'flex' } },
        links.map(l =>
          React.createElement('button', {
            key: l.id, style: navbarStyles.link(currentPage === l.id),
            onClick: () => setPage(l.id),
          }, l.label)
        )
      ),

      React.createElement('div', { style: navbarStyles.right },
        React.createElement('span', { style: { ...navbarStyles.userName, display: window.innerWidth < 640 ? 'none' : 'block' } }, user.name),
        React.createElement('button', { style: navbarStyles.logoutBtn, onClick: () => setPage('login') }, 'Logout'),
        React.createElement('button', {
          style: { ...navbarStyles.hamburger, display: window.innerWidth < 640 ? 'block' : 'none' },
          onClick: () => setOpen(o => !o),
        },
          React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            open
              ? React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' })
              : React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M4 6h16M4 12h16M4 18h16' })
          )
        )
      )
    ),
    open && React.createElement('div', { style: navbarStyles.mobileMenu },
      links.map(l =>
        React.createElement('button', {
          key: l.id, style: navbarStyles.mobileLink(currentPage === l.id),
          onClick: () => { setPage(l.id); setOpen(false); },
        }, l.label)
      )
    )
  );
}

Object.assign(window, { Navbar });
