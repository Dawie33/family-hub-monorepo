import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(['enrolled', 'active', 'paused', 'completed', 'abandoned'])
  status?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  current_week?: number
}

export class SwapSessionDto {
  @IsEnum(['workout', 'ai_regenerate', 'exercise'])
  swap_type!: 'workout' | 'ai_regenerate' | 'exercise'

  // Pour swap_type = 'workout'
  @IsOptional()
  @IsUUID()
  workout_id?: string

  // Pour swap_type = 'ai_regenerate'
  @IsOptional()
  @IsString()
  instructions?: string

  // Pour swap_type = 'exercise'
  @IsOptional()
  @IsString()
  movement_name?: string

  @IsOptional()
  replacement_exercise?: {
    name: string
    sets: number
    reps: string | number
    intensity?: string
    rest?: string
    notes?: string
  }
}

export class ScheduleWeekDto {
  @IsInt()
  @Min(1)
  week_num!: number

  @IsString()
  start_date!: string // YYYY-MM-DD

  box_dates!: string[] // YYYY-MM-DD[]
}
