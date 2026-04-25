import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'

export type RunType = 'easy' | 'tempo' | 'intervals' | 'long_run' | 'fartlek' | 'recovery' | 'race'
export type RunSource = 'manual' | 'ai_generated' | 'strava'

export class CreateRunningSessionDto {
  @IsDateString()
  session_date!: string

  @IsEnum(['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race'])
  run_type!: RunType

  @IsOptional()
  @IsUUID()
  scheduled_activity_id?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_km?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_seconds?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  avg_pace_seconds_per_km?: number

  @IsOptional()
  @IsInt()
  avg_heart_rate?: number

  @IsOptional()
  @IsInt()
  max_heart_rate?: number

  @IsOptional()
  @IsInt()
  elevation_gain_m?: number

  @IsOptional()
  @IsInt()
  calories?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateRunningSessionDto {
  @IsOptional()
  @IsDateString()
  session_date?: string

  @IsOptional()
  @IsEnum(['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race'])
  run_type?: RunType

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_km?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_seconds?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  avg_pace_seconds_per_km?: number

  @IsOptional()
  @IsInt()
  avg_heart_rate?: number

  @IsOptional()
  @IsInt()
  max_heart_rate?: number

  @IsOptional()
  @IsInt()
  elevation_gain_m?: number

  @IsOptional()
  @IsInt()
  calories?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class RunningSessionQueryDto {
  @IsOptional()
  @Type(() => String)
  limit?: string

  @IsOptional()
  @Type(() => String)
  offset?: string

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsOptional()
  @IsIn(['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race'])
  run_type?: RunType

  @IsOptional()
  @IsIn(['manual', 'ai_generated', 'strava'])
  source?: RunSource
}

export class GenerateRunningSessionDto {
  @IsEnum(['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race'])
  run_type!: RunType

  @IsInt()
  @Min(10)
  @Max(240)
  duration_minutes!: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  target_distance_km?: number

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'elite'])
  level?: string

  @IsOptional()
  @IsString()
  goal?: string // ex: "préparer un 10K", "améliorer endurance"

  @IsOptional()
  @IsString()
  additional_instructions?: string
}
