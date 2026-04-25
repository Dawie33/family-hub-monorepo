export interface SignupDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token?: string  // plus envoyé dans le body, token stocké en cookie httpOnly
  user: User
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
  workouts_count?: number
  sport_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  height?: number
  weight?: number
  body_fat_percentage?: number
  equipment_available?: string[]
  stats?: {
    workouts: number
    sessions: number
    total_time_minutes: number
  }
}

export interface CreateUserDTO {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface UpdateUserDTO {
  email?: string
  username?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: string
  is_active?: boolean
  sport_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  height?: number
  weight?: number
  body_fat_percentage?: number
  equipment_available?: string[]
}

export interface UserQueryParams {
  limit?: number
  offset?: number
  search?: string
  role?: string
  [key: string]: string | number | boolean | undefined
}

// Admin Stats
export interface AdminStats {
  users: number
  workouts: number
  exercises: number
  equipments?: number
  activeUsers?: number
  workoutExercises?: number
  publishedWorkouts?: number
}
