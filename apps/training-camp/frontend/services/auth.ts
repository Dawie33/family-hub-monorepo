import type { AuthResponse, LoginDto, SignupDto, User } from '@/domain/entities/auth'
import apiClient from './apiClient'

export class AuthService {
  private endpoint = '/auth'

  async signup(data: SignupDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.endpoint}/signup`, data)
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.endpoint}/login`, data)
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  }

  async getMe(): Promise<User> {
    return apiClient.get<User>(`${this.endpoint}/me`)
  }

  async getFullProfile(): Promise<User> {
    return apiClient.get<User>(`${this.endpoint}/profile`)
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/logout`)
    } finally {
      localStorage.removeItem('user')
    }
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!this.getUser()
  }
}

export const authService = new AuthService()
