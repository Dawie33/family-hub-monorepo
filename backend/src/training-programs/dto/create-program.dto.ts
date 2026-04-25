import { IsEnum, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateProgramDto {
  @IsNotEmpty()
  @IsString()
  name!: string

  @IsNotEmpty()
  @IsString()
  description!: string

  @IsOptional()
  @IsString()
  objectives?: string

  @IsEnum(['strength_building', 'endurance_base', 'competition_prep', 'off_season'])
  program_type!: string

  @IsIn([4, 6, 8, 12])
  duration_weeks!: number

  @IsIn([2, 3, 4, 5])
  sessions_per_week!: number

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  target_level!: string

  @IsObject()
  weekly_structure!: Record<string, unknown>

  @IsOptional()
  @IsString()
  progression_notes?: string
}
