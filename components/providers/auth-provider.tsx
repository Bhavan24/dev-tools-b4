'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getToken, setToken, clearToken, fetchWithAuth } from '@/lib/auth-client'

export interface AuthUser {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate user from token on mount
    const token = getToken()
    if (token) {
      fetchWithAuth('/api/auth/me')
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('Auth failed')
        })
        .then((data) => {
          setUser(data.user)
        })
        .catch(() => {
          clearToken()
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token: string, authUser: AuthUser) => {
    setToken(token)
    setUser(authUser)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
