import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Layout from './components/Layout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/customer/HomePage'
import BranchDetailPage from './pages/customer/BranchDetailPage'
import WorkerPortal from './pages/worker/WorkerPortal'
import DriverPortal from './pages/driver/DriverPortal'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — all authenticated users get Navbar + Footer via Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Customer */}
            <Route element={<RoleRoute roles={['customer', 'admin']} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/branches/:id" element={<BranchDetailPage />} />
            </Route>

            {/* Worker */}
            <Route element={<RoleRoute roles={['worker', 'admin']} />}>
              <Route path="/worker/*" element={<WorkerPortal />} />
            </Route>

            {/* Driver */}
            <Route element={<RoleRoute roles={['driver', 'admin']} />}>
              <Route path="/driver/*" element={<DriverPortal />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
