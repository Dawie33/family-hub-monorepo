import { Transform, Type } from "class-transformer"
import { IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from "class-validator"

export class CreateWorkoutDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  workout_type?: string


  @IsOptional()
  blocks?: Record<string, unknown>

  @IsInt()
  @IsOptional()
  estimated_duration?: number

  @IsString()
  @IsOptional()
  intensity?: string

  @IsString()
  @IsOptional()
  difficulty?: string

  @IsOptional()
  scaling_options?: Record<string, unknown>

  @IsArray()
  @IsOptional()
  equipment_required?: string[]

  @IsArray()
  @IsOptional()
  focus_areas?: string[]

  @IsArray()
  @IsOptional()
  metrics_tracked?: string[]

  @IsBoolean()
  @IsOptional()
  ai_generated?: boolean

  @IsOptional()
  ai_parameters?: Record<string, unknown>

  @IsUUID()
  @IsOptional()
  created_by_user_id?: string

  @IsOptional()
  target_metrics?: Record<string, unknown>

  @IsInt()
  @IsOptional()
  usage_count?: number

  @IsNumber()
  @IsOptional()
  average_rating?: number

  @IsInt()
  @IsOptional()
  total_ratings?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string

  @IsString()
  @IsOptional()
  scheduled_date?: string

  @IsBoolean()
  @IsOptional()
  is_benchmark?: boolean

  @IsString()
  @IsOptional()
  coach_notes?: string

  @IsArray()
  @IsOptional()
  tags?: string[]

  @IsString()
  @IsOptional()
  image_url?: string
}

export class UpdateWorkoutDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  workout_type?: string


  @IsInt()
  @IsOptional()
  estimated_duration?: number

  @IsString()
  @IsOptional()
  intensity?: string

  @IsString()
  @IsOptional()
  difficulty?: string

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean

  @IsOptional()
  blocks?: Record<string, unknown>

  @IsArray()
  @IsOptional()
  tags?: string[]

  @IsString()
  @IsOptional()
  scheduled_date?: string

  @IsString()
  @IsOptional()
  image_url?: string
}

export class GenerateWorkoutDto {
  @IsString()
  workoutType!: string

  @IsEnum(['beginner', 'intermediate', 'advanced', 'elite'])
  difficulty!: 'beginner' | 'intermediate' | 'advanced' | 'elite'

  @IsNumber()
  @Type(() => Number)
  duration!: number // en minutes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus?: string[] // Ex: ["upper-body", "cardio"]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[] // Équipement disponible

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[] // Ex: ["no-jump", "low-impact"]

  @IsOptional()
  @IsString()
  additionalInstructions?: string
}

export class GeneratePersonalizedWorkoutDto {
  @IsString()
  workoutType!: string

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'elite'])
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'elite'

  @IsNumber()
  @Type(() => Number)
  duration!: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[]

  @IsOptional()
  @IsString()
  additionalInstructions?: string
}

export class WorkoutQueryDto {
  @IsOptional()
  @Type(() => String)
  @IsString()
  limit?: string

  @IsOptional()
  @Type(() => String)
  @IsString()
  offset?: string

  @IsOptional()
  @IsString()
  orderBy?: string

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDir?: 'asc' | 'desc'

  @IsOptional()
  @Type(() => String)
  search?: string

  @IsOptional()
  @Type(() => String)
  @IsIn(['draft', 'published', 'archived'])
  status?: string

  @IsOptional()
  @Type(() => String)
  scheduled_date?: string

  @IsOptional()
  @Type(() => String)
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty?: string

  @IsOptional()
  @Type(() => String)
  workout_type?: string

  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : undefined)
  @IsBoolean()
  is_benchmark?: boolean
}

export class WorkoutDto {

  @IsUUID()
  @IsOptional()
  id: string

  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  slug: string

  @IsString()
  @IsOptional()
  description: string

  @IsString()
  @IsOptional()
  workout_type: string

  @IsString()
  @IsOptional()
  wod_format: string

  @IsOptional()
  blocks: Record<string, unknown>

  @IsInt()
  @IsOptional()
  estimated_duration: number

  @IsString()
  @IsOptional()
  intensity: string

  @IsString()
  @IsOptional()
  difficulty: string

  @IsOptional()
  scaling_options: Record<string, unknown>

  @IsArray()
  @IsOptional()
  equipment_required: string[]

  @IsArray()
  @IsOptional()
  focus_areas: string[]

  @IsArray()
  @IsOptional()
  metrics_tracked: string[]

  @IsBoolean()
  @IsOptional()
  ai_generated: boolean

  @IsOptional()
  ai_parameters: Record<string, unknown>

  @IsUUID()
  @IsOptional()
  created_by_user_id: string

  @IsOptional()
  target_metrics: Record<string, unknown>

  @IsInt()
  @IsOptional()
  usage_count: number

  @IsNumber()
  @IsOptional()
  average_rating: number

  @IsInt()
  @IsOptional()
  total_ratings: number

  @IsBoolean()
  @IsOptional()
  isActive: boolean

  @IsBoolean()
  @IsOptional()
  isFeatured: boolean

  @IsBoolean()
  @IsOptional()
  isPublic: boolean

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status: string

  @IsString()
  @IsOptional()
  scheduled_date: string

  @IsBoolean()
  @IsOptional()
  is_benchmark: boolean

  @IsString()
  @IsOptional()
  coach_notes: string

  @IsArray()
  @IsOptional()
  tags: string[]

  @IsString()
  @IsOptional()
  image_url?: string
}


export class ParseWorkoutTextDto {
  @IsString()
  @MinLength(10)
  text!: string
}

export class LookupWorkoutDto {
  @IsString()
  @MinLength(2)
  name!: string

  @IsOptional()
  @IsString()
  referenceData?: string
}

export class WeeklyPlanDayDto {
  @IsString()
  date!: string // 'YYYY-MM-DD'

  @IsIn(['perso', 'box', 'rest'])
  type!: string

  @IsOptional()
  @IsString()
  focus?: string
}

export class WeeklyPlanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyPlanDayDto)
  days!: WeeklyPlanDayDto[]
}

/**
 * DTO pour les résultats de benchmark
 * Supporte différents types de métriques selon le type de workout
 */
export class BenchmarkResultDto {
  @IsOptional()
  @IsNumber()
  time_seconds?: number // Pour les workouts "For Time" (ex: Fran, Helen)

  @IsOptional()
  @IsNumber()
  rounds?: number // Pour les workouts AMRAP (ex: Cindy)

  @IsOptional()
  @IsNumber()
  reps?: number // Reps complémentaires pour AMRAP

  @IsOptional()
  @IsNumber()
  weight?: number // Poids utilisé si applicable

  @IsOptional()
  @IsString()
  notes?: string // Notes optionnelles
}

/**
 * DTO pour sauvegarder un résultat de benchmark
 */
export class SaveBenchmarkResultDto {
  @IsNotEmpty()
  @IsUUID()
  workoutId!: string

  @IsNotEmpty()
  @IsString()
  workoutName!: string

  @ValidateNested()
  @Type(() => BenchmarkResultDto)
  result!: BenchmarkResultDto
}
