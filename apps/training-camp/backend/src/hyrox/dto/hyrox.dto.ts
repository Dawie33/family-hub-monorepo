import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export type HyroxSessionType = 'full_simulation' | 'station_prep' | 'run_prep' | 'mixed'

export const HYROX_STATIONS = [
  'ski_erg',
  'sled_push',
  'sled_pull',
  'burpee_broad_jumps',
  'rowing',
  'farmers_carry',
  'sandbag_lunges',
  'wall_balls',
] as const

export type HyroxStation = typeof HYROX_STATIONS[number]

// Alternatives par station si l'équipement manque
export const HYROX_ALTERNATIVES: Record<HyroxStation, string[]> = {
  ski_erg: ['Burpees', 'Jumping Jacks', 'Mountain Climbers'],
  sled_push: ['Squat Jumps', 'Bear Crawl', 'Fentes sautées'],
  sled_pull: ['Rowing inversé sous table', 'Superman Pulls', 'Tirage élastique'],
  burpee_broad_jumps: ['Burpees + Broad Jump classique'],
  rowing: ['High Knees', 'Course sur place', 'Run 400m'],
  farmers_carry: ['Suitcase Hold statique', 'Marche avec sacs de courses lourds'],
  sandbag_lunges: ['Walking Lunges', 'Fentes avant longues'],
  wall_balls: ['Air Squats tempo (3 sec descent)', 'Thrusters poids du corps'],
}

export class StationTimeDto {
  @IsIn(HYROX_STATIONS)
  station!: HyroxStation

  @IsInt()
  @Min(0)
  time_seconds!: number

  @IsOptional()
  @IsString()
  alternative_used?: string
}

export class RunTimeDto {
  @IsInt()
  @Min(1)
  @Max(8)
  run!: number

  @IsInt()
  @Min(0)
  time_seconds!: number
}

export class CreateHyroxSessionDto {
  @IsDateString()
  session_date!: string

  @IsEnum(['full_simulation', 'station_prep', 'run_prep', 'mixed'])
  session_type!: HyroxSessionType

  @IsOptional()
  @IsUUID()
  scheduled_activity_id?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  total_time_seconds?: number

  @IsOptional()
  @IsArray()
  run_times?: RunTimeDto[]

  @IsOptional()
  @IsArray()
  station_times?: StationTimeDto[]

  @IsOptional()
  @IsArray()
  equipment_available?: string[]

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateHyroxSessionDto {
  @IsOptional()
  @IsDateString()
  session_date?: string

  @IsOptional()
  @IsInt()
  total_time_seconds?: number

  @IsOptional()
  @IsArray()
  run_times?: RunTimeDto[]

  @IsOptional()
  @IsArray()
  station_times?: StationTimeDto[]

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  perceived_effort?: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class HyroxSessionQueryDto {
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
  @IsIn(['full_simulation', 'station_prep', 'run_prep', 'mixed'])
  session_type?: HyroxSessionType
}

export class GenerateHyroxSessionDto {
  @IsEnum(['full_simulation', 'station_prep', 'run_prep', 'mixed'])
  session_type!: HyroxSessionType

  @IsInt()
  @Min(20)
  @Max(180)
  duration_minutes!: number

  @IsOptional()
  @IsEnum(['saved', 'official'])
  equipment_mode?: 'saved' | 'official'  // 'official' = équipement HYROX complet ; 'saved' = équipement du profil utilisateur

  @IsOptional()
  @IsArray()
  equipment_available?: string[]   // équipement dispo → pour suggérer les bonnes alternatives

  @IsOptional()
  @IsArray()
  stations_to_work?: HyroxStation[]  // si station_prep : quelles stations cibler

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'elite'])
  level?: string

  @IsOptional()
  @IsString()
  additional_instructions?: string
}
