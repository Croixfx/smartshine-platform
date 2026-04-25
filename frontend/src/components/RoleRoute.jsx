import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RoleRoute({ roles }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-6xl font-extrabold text-gray-200">403</p>
          <p className="text-gray-600 font-semibold">Access Denied</p>
          <p className="text-sm text-gray-400">Your role ({user.role}) cannot access this page.</p>
          <a href="/" className="inline-block mt-2 text-blue-600 hover:underline text-sm">
            Go home
          </a>
        </div>
      </div>
    )
  }

  return <Outlet />
}
