import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await client.get('accounts/profile/')
      setUser(data)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('smartshine_access')
      localStorage.removeItem('smartshine_refresh')
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('smartshine_access')
    if (token) {
      fetchProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  // login: receives tokens from OTP verify response, stores them, fetches profile
  const login = useCallback(async (accessToken, refreshToken) => {
    localStorage.setItem('smartshine_access', accessToken)
    localStorage.setItem('smartshine_refresh', refreshToken)
    try {
      const { data } = await client.get('accounts/profile/')
      setUser(data)
      setIsAuthenticated(true)
      return data
    } catch {
      localStorage.removeItem('smartshine_access')
      localStorage.removeItem('smartshine_refresh')
      throw new Error('Failed to load profile after login')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('smartshine_access')
    localStorage.removeItem('smartshine_refresh')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate])

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
