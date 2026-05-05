import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RoleRoute({ roles }) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.role)) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 96, fontWeight: 900, color: '#e2e8f0',
            fontFamily: "'Playfair Display', serif", lineHeight: 1,
          }}>403</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '16px 0 8px' }}>
            Access Denied
          </h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 28 }}>
            You don't have permission to view this page.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#1A5276', color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px 28px', fontSize: 15,
              fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
