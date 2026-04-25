import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export type AthxSessionType = 'full_competition' | 'strength_prep' | 'endurance_prep' | 'metcon_prep' | 'mixed'

export class CreateAthxSessionDto {
  @IsDateString()
  session_date!: string

  @IsEnum(['full_competition', 'strength_prep', 'endurance_prep', 'metcon_prep', 'mixed'])
  session_type!: AthxSessionType

  @IsOptional()
  @IsUUID()
  scheduled_activity_id?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  zone_results?: Record<string, unknown>

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateAthxSessionDto {
  @IsOptional()
  @IsDateString()
  session_date?: string

  @IsOptional()
  @IsInt()
  duration_minutes?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  zone_results?: Record<string, unknown>

  @IsOptional()
  @IsString()
  notes?: string
}

export class AthxSessionQueryDto {
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
  @IsIn(['full_competition', 'strength_prep', 'endurance_prep', 'metcon_prep', 'mixed'])
  session_type?: AthxSessionType
}

export class GenerateAthxSessionDto {
  @IsEnum(['full_competition', 'strength_prep', 'endurance_prep', 'metcon_prep', 'mixed'])
  session_type!: AthxSessionType

  @IsInt()
  @Min(20)
  @Max(180)
  duration_minutes!: number

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'elite'])
  level?: string

  @IsOptional()
  @IsString()
  target_zones?: string   // ex: "force et endurance"

  @IsOptional()
  @IsString()
  competition_date?: string  // ex: "dans 6 semaines"

  @IsOptional()
  @IsString()
  additional_instructions?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment_available?: string[]

  @IsOptional()
  @IsDateString()
  scheduled_date?: string  // Date de planification dans le calendrier (défaut : aujourd'hui)
}
