import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = {
  customer: [{ to: '/', label: 'Home' }, { to: '/bookings', label: 'My Bookings' }, { to: '/vehicles', label: 'My Vehicles' }],
  worker:   [{ to: '/worker', label: 'Dashboard' }],
  driver:   [{ to: '/driver', label: 'Dashboard' }],
  admin:    [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/branches', label: 'Branches' }, { to: '/admin/bookings', label: 'Bookings' }],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = NAV_LINKS[user?.role] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-blue-200 hover:text-white'}`

  return (
    <nav className="bg-blue-700 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-white font-extrabold text-xl tracking-tight">
          SmartShine
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-blue-200 text-sm">{user?.full_name || user?.phone}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-blue-800 px-4 pb-4 space-y-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium ${isActive ? 'text-white' : 'text-blue-200 hover:text-white'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-blue-600">
            <p className="text-blue-300 text-xs mb-2">{user?.full_name || user?.phone}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
