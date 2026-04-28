import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

// Create the context object — this is what components will import
const AuthContext = createContext(null)

// Provider component — wraps your entire app and makes auth state available
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // loading prevents the app from flashing the login page
  // before we've checked if a token exists in localStorage
  const [loading, setLoading] = useState(true)

  // On mount — check if tokens exist in localStorage
  // If they do, fetch the current user to restore the session
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Verify the token is still valid by fetching the current user
      client.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token invalid or expired — clear everything
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (tokens, userData) => {
    // Store tokens in localStorage — persists across page refreshes
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — components call useAuth() instead of useContext(AuthContext)
// This is cleaner and gives a better error if used outside the provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}