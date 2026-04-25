import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import VehiclesPage from './pages/VehiclesPage'
import BranchesPage from './pages/BranchesPage'
import PaymentsPage from './pages/PaymentsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
