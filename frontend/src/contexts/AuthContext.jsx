import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ── Fetch profile from API and hydrate state ────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await client.get('accounts/profile/')
      setUser(data)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }, [])

  // ── On mount: restore session if token present ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  // ── login: verify OTP → store tokens → load profile ────────────────────────
  const login = useCallback(async (phone, code) => {
    const { data } = await client.post('accounts/otp/verify/', { phone, code })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    setIsAuthenticated(true)
    return data.user
  }, [])

  // ── logout: wipe state and storage ─────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
