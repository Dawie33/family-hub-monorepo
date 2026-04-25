import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class GenerateProgramDto {
  @IsEnum(['strength_building', 'endurance_base', 'competition_prep', 'off_season'])
  program_type!: string

  @IsIn([4, 6, 8, 12])
  duration_weeks!: number

  @IsIn([2, 3, 4, 5])
  sessions_per_week!: number

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  target_level!: string

  @IsOptional()
  @IsString()
  focus?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  box_days_per_week?: number
}
