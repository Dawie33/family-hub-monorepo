import { api, saveToken, removeToken } from './api'

interface LoginResponse {
  access_token: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

export async function login(email: string, password: string): Promise<User> {
  const { access_token } = await api.post<LoginResponse>('/auth/login', { email, password })
  await saveToken(access_token)
  const user = await api.get<User>('/auth/me')
  return user
}

export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me')
}

export async function logout(): Promise<void> {
  await removeToken()
}
