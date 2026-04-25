export type SkillCategory = 'gymnastics' | 'olympic_lifting' | 'strength' | 'mobility'
export type SkillProgramStatus = 'active' | 'completed' | 'paused' | 'abandoned'
export type SkillStepStatus = 'locked' | 'in_progress' | 'completed' | 'skipped'

export interface ValidationCriteria {
  type: 'reps' | 'time' | 'weight' | 'quality'
  target: number
  metric: string
  unit: string
  description: string
}

export interface RecommendedExercise {
  name: string
  sets?: number
  reps?: string | number
  rest?: string
  intensity?: string
  notes?: string
}

export interface SkillStep {
  id: string
  program_id: string
  step_number: number
  title: string
  description: string
  validation_criteria: ValidationCriteria
  recommended_exercises: RecommendedExercise[]
  coaching_tips?: string
  estimated_duration_weeks?: number
  frequency?: string
  when_to_train?: string
  warmup?: string
  status: SkillStepStatus
  manually_overridden: boolean
  unlocked_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface SkillProgram {
  id: string
  user_id: string
  skill_name: string
  skill_category: SkillCategory
  description: string
  estimated_weeks: number
  status: SkillProgramStatus
  ai_parameters?: Record<string, unknown>
  progression_notes: string
  safety_notes: string
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
  steps?: SkillStep[]
  total_steps?: number
  completed_steps?: number
}

export interface SkillProgressLog {
  id: string
  step_id: string
  user_id: string
  session_date: string
  performance_data: Record<string, unknown>
  session_notes?: string
  created_at: string
  updated_at: string
}

export interface GeneratedSkillProgram {
  skill_name: string
  skill_category: SkillCategory
  description: string
  estimated_weeks: number
  progression_notes: string
  safety_notes: string
  steps: {
    step_number: number
    title: string
    description: string
    validation_criteria: ValidationCriteria
    recommended_exercises: RecommendedExercise[]
    coaching_tips?: string
    estimated_duration_weeks?: number
    frequency?: string
    when_to_train?: string
    warmup?: string
  }[]
}
