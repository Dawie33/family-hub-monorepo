import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator'

export class GenerateSkillProgramDto {
  @IsString()
  skillName!: string

  @IsEnum(['gymnastics', 'olympic_lifting', 'strength', 'mobility'])
  skillCategory!: 'gymnastics' | 'olympic_lifting' | 'strength' | 'mobility'

  @IsOptional()
  @IsString()
  currentCapabilities?: string

  @IsOptional()
  @IsString()
  constraints?: string

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'elite'])
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableEquipment?: string[]
}

export class CreateSkillProgramDto {
  @IsString()
  skill_name!: string

  @IsEnum(['gymnastics', 'olympic_lifting', 'strength', 'mobility'])
  skill_category!: 'gymnastics' | 'olympic_lifting' | 'strength' | 'mobility'

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  estimated_weeks?: number

  @IsOptional()
  ai_parameters?: Record<string, unknown>

  @IsOptional()
  @IsString()
  progression_notes?: string

  @IsOptional()
  @IsString()
  safety_notes?: string

  @IsArray()
  steps!: CreateSkillStepDto[]
}

export class CreateSkillStepDto {
  step_number!: number
  title!: string
  description?: string
  validation_criteria?: Record<string, unknown>
  recommended_exercises?: Record<string, unknown>[]
  coaching_tips?: string
  estimated_duration_weeks?: number
}

export class UpdateSkillProgramDto {
  @IsOptional()
  @IsIn(['active', 'completed', 'paused', 'abandoned'])
  status?: string

  @IsOptional()
  @IsString()
  progression_notes?: string
}

export class UpdateSkillStepDto {
  @IsOptional()
  @IsIn(['locked', 'in_progress', 'completed', 'skipped'])
  status?: string

  @IsOptional()
  manually_overridden?: boolean
}

export class CreateSkillProgressLogDto {
  @IsUUID()
  step_id!: string

  @IsString()
  session_date!: string

  @IsOptional()
  performance_data?: Record<string, unknown>

  @IsOptional()
  @IsString()
  session_notes?: string
}
