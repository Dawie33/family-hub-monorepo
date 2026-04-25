import { api } from './api'

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  sport_level?: string
  height?: number
  weight?: number
  body_fat_percentage?: number
  equipment_available?: string[]
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  sport_level?: string
  height?: number
  weight?: number
  body_fat_percentage?: number
  equipment_available?: string[]
}

export async function getUserProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/users/me')
}

export async function updateMe(data: UpdateUserDto): Promise<UserProfile> {
  return api.patch<UserProfile>('/users/me', data)
}
