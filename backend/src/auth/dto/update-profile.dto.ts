import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be in format YYYY-MM-DD' })
  dateOfBirth?: string

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other'

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'elite'])
  sport_level?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  height?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  weight?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  resting_heart_rate?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max_heart_rate?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  body_fat_percentage?: number

  @IsOptional()
  global_goals?: Record<string, boolean>

  @IsOptional()
  @IsArray()
  injuries?: string[]

  @IsOptional()
  @IsArray()
  physical_limitations?: string[]

  @IsOptional()
  @IsArray()
  equipment_available?: string[]

  @IsOptional()
  @IsIn(['home', 'gym', 'outdoor', 'mixed'])
  training_location?: string

  @IsOptional()
  training_preferences?: Record<string, string>

  @IsOptional()
  schedule_preferences?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  has_coach?: boolean

  @IsOptional()
  @IsBoolean()
  premium_member?: boolean
}
