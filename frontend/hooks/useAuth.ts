import { createContext, useContext } from 'react'
import type { LoginDto, SignupDto, User } from '@/domain/entities/auth'

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (data: LoginDto) => Promise<void>
  signup: (data: SignupDto) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Récupère le context d'authentification.
 * @returns {AuthContextType} - Le context d'authentification.
 * @throws {Error} - Si le context n'est pas défini.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
