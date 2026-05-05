import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = {
  customer: [
    { to: '/dashboard', label: 'Home' },
    { to: '/bookings', label: 'My Bookings' },
    { to: '/vehicles', label: 'My Vehicles' },
  ],
  worker: [{ to: '/worker', label: 'Dashboard' }],
  driver: [{ to: '/driver', label: 'Dashboard' }],
  admin: [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/branches', label: 'Branches' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/users', label: 'Users' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const links = NAV_LINKS[user?.role] ?? NAV_LINKS.customer
  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (to) => {
    if (to === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(to)
  }

  return (
    <div>
      <nav style={{
        background: '#1A5276', height: 64, display: 'flex', alignItems: 'center',
        padding: '0 24px', justifyContent: 'space-between', position: 'sticky',
        top: 0, zIndex: 50, boxShadow: '0 1px 0 rgba(0,0,0,0.1)',
      }}>
        <span
          onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
          style={{
            fontFamily: "'Playfair Display',serif", fontWeight: 700,
            fontSize: 20, color: 'white', letterSpacing: '-0.02em',
            cursor: 'pointer',
          }}
        >
          Smart<span style={{ color: '#F39C12' }}>Shine</span>
        </span>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {links.map(l => (
              <button
                key={l.to}
                onClick={() => navigate(l.to)}
                style={{
                  fontSize: 13, fontWeight: isActive(l.to) ? 600 : 500, cursor: 'pointer',
                  color: isActive(l.to) ? 'white' : 'rgba(255,255,255,0.65)',
                  transition: 'color 150ms', background: 'none',
                  border: 'none', fontFamily: "'DM Sans',sans-serif",
                  borderBottom: isActive(l.to) ? '2px solid #F39C12' : '2px solid transparent',
                  paddingBottom: 2,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {user?.full_name || user?.phone}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'white', color: '#1A5276', fontSize: 13, fontWeight: 600,
              padding: '6px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Logout
          </button>
          {isMobile && (
            <button
              onClick={() => setOpen(o => !o)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          )}
        </div>
      </nav>

      {open && isMobile && (
        <div style={{
          background: '#154360', padding: '12px 24px 16px', display: 'flex',
          flexDirection: 'column', gap: 8,
        }}>
          {links.map(l => (
            <button
              key={l.to}
              onClick={() => { navigate(l.to); setOpen(false) }}
              style={{
                fontSize: 14, fontWeight: 500, padding: '8px 0',
                color: isActive(l.to) ? 'white' : 'rgba(255,255,255,0.65)',
                cursor: 'pointer', background: 'none', border: 'none',
                fontFamily: "'DM Sans',sans-serif", textAlign: 'left',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
