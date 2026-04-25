'use client'

import { authService } from '@/services'
import type { LoginDto, SignupDto, User } from '@/domain/entities/auth'
import { AuthContext } from '@/hooks/useAuth'
import { ReactNode, useCallback, useEffect, useState } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Le cookie httpOnly est envoyé automatiquement — pas besoin de lire localStorage
        const currentUser = await authService.getMe()
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      } catch {
        // 401 = pas connecté, on nettoie juste le localStorage
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (data: LoginDto) => {
    const response = await authService.login(data)
    setUser(response.user)
  }

  const signup = async (data: SignupDto) => {
    const response = await authService.signup(data)
    setUser(response.user)
  }

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
