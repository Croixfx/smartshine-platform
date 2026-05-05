import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif",
      gap: 20,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 28 }}>💧</span>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: '#1A5276' }}>
          Smart<span style={{ color: '#F39C12' }}>Shine</span>
        </span>
      </div>
      <div style={{
        width: 36, height: 36, border: '3px solid #e2e8f0',
        borderTopColor: '#1A5276', borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
    </div>
  )
}

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
