import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/dashboard" className="text-xl font-bold tracking-tight">
        SmartShine
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/bookings" className="hover:underline">Bookings</Link>
        <Link to="/vehicles" className="hover:underline">Vehicles</Link>
        <Link to="/branches" className="hover:underline">Branches</Link>
        <Link to="/payments" className="hover:underline">Payments</Link>
        <span className="opacity-70">{user?.phone}</span>
        <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-50">
          Logout
        </button>
      </div>
    </nav>
  )
}
