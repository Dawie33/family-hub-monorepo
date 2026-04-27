import { IsArray, IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin' | 'coach'
  sport_level: string
  height: number | null
  weight: number | null
  body_fat_percentage: number | null
  equipment_available: string[]
  benchmark_results: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
  stats?: {
    workouts: number
    sessions: number
    total_time_minutes?: number
  }
}

export class CreateUserDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsOptional()
  @IsString()
  dateOfBirth?: string

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other'

  @IsOptional()
  @IsIn(['user', 'admin', 'coach'])
  role?: 'user' | 'admin' | 'coach'
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsIn(['user', 'admin', 'coach'])
  role?: 'user' | 'admin' | 'coach'

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'elite'])
  sport_level?: string

  @IsOptional()
  @IsNumber()
  height?: number

  @IsOptional()
  @IsNumber()
  weight?: number

  @IsOptional()
  @IsNumber()
  body_fat_percentage?: number

  @IsOptional()
  @IsArray()
  equipment_available?: string[]
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  limit?: string

  @IsOptional()
  @IsString()
  offset?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsIn(['user', 'admin', 'coach'])
  role?: 'user' | 'admin' | 'coach'

  @IsOptional()
  @IsString()
  orderBy?: string

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDir?: 'asc' | 'desc'
}
