import { Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Layout from './components/Layout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOTPPage from './pages/auth/VerifyOTPPage'
import HomePage from './pages/customer/HomePage'
import BranchDetailPage from './pages/customer/BranchDetailPage'
import BookingFlowPage from './pages/customer/BookingFlowPage'
import MyBookingsPage from './pages/customer/MyBookingsPage'
import MyVehiclesPage from './pages/customer/MyVehiclesPage'
import PaymentPage from './pages/customer/PaymentPage'
import WorkerPortal from './pages/worker/WorkerPortal'
import DriverPortal from './pages/driver/DriverPortal'
import AdminDashboard from './pages/admin/AdminDashboard'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 40,
    }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 120, fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>
        Page not found
      </h1>
      <p style={{ color: '#888', fontSize: 15, marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#1A5276', color: '#fff', border: 'none', borderRadius: 12,
          padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif",
        }}
      >Go Home</button>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyOTPPage />} />

        {/* Protected — authenticated users only */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route element={<RoleRoute roles={['customer', 'admin']} />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/branches/:id" element={<BranchDetailPage />} />
              <Route path="/book" element={<BookingFlowPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/vehicles" element={<MyVehiclesPage />} />
              <Route path="/payment" element={<PaymentPage />} />
            </Route>
            <Route element={<RoleRoute roles={['worker', 'admin']} />}>
              <Route path="/worker/*" element={<WorkerPortal />} />
            </Route>
            <Route element={<RoleRoute roles={['driver', 'admin']} />}>
              <Route path="/driver/*" element={<DriverPortal />} />
            </Route>
            <Route element={<RoleRoute roles={['admin', 'worker']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/branches" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
