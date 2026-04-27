import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateScheduleDto {
  @IsOptional()
  @IsUUID()
  workout_id?: string

  @IsOptional()
  @IsUUID()
  personalized_workout_id?: string

  @IsNotEmpty()
  @IsDateString()
  scheduled_date!: string // Format YYYY-MM-DD

  @IsOptional()
  @IsEnum(['workout', 'box_session'])
  session_type?: 'workout' | 'box_session'

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  scheduled_date?: string

  @IsOptional()
  @IsEnum(['scheduled', 'completed', 'skipped', 'rescheduled'])
  status?: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'

  @IsOptional()
  @IsUUID()
  completed_session_id?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class ScheduleQueryDto {
  @IsOptional()
  @Type(() => String)
  @IsString()
  limit?: string

  @IsOptional()
  @Type(() => String)
  @IsString()
  offset?: string

  @IsOptional()
  @IsDateString()
  start_date?: string

  @IsOptional()
  @IsDateString()
  end_date?: string

  @IsOptional()
  @IsIn(['scheduled', 'completed', 'skipped', 'rescheduled'])
  status?: string

  @IsOptional()
  @IsUUID()
  workout_id?: string

  @IsOptional()
  @IsEnum(['workout', 'box_session'])
  session_type?: 'workout' | 'box_session'
}
