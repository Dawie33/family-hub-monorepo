export interface StrengthMovement {
  name: string
  sets: number
  reps: string | number
  intensity?: string | null
  rest?: string | null
  notes?: string | null
}

export interface ConditioningMovement {
  name: string
  reps?: string | number | null
  distance?: string | null
  weight?: string | null
  calories?: number | null
  time?: string | null
}

export interface Conditioning {
  type: 'amrap' | 'for_time' | 'emom' | 'tabata' | 'rounds_for_time' | 'death_by' | 'chipper'
  duration_minutes?: number | null
  rounds?: number | null
  movements: ConditioningMovement[]
  score_type?: string | null
  scaling_notes?: string | null
}

export interface SkillWork {
  name: string
  description: string
  sets?: number | null
  duration?: string | null
  notes?: string | null
}

export interface ProgramSession {
  session_in_week: number
  title: string
  focus: 'strength' | 'conditioning' | 'skill' | 'mixed' | 'recovery'
  estimated_duration: number
  strength_work?: { movements: StrengthMovement[] } | null
  conditioning?: Conditioning | null
  skill_work?: SkillWork | null
  coach_notes?: string | null
  // Flags de customisation
  _swapped?: boolean
  _swap_workout_id?: string
  _has_exercise_swap?: boolean
}

export interface ProgramPhase {
  phase_number: number
  name: string
  weeks: number[]
  description: string
}

export interface GeneratedProgram {
  name: string
  description: string
  objectives: string
  phases: Array<ProgramPhase & { sessions: ProgramSession[] }>
  progression_notes: string
  coach_notes?: string | null
}

export interface TrainingProgram {
  id: string
  name: string
  slug: string
  description: string
  objectives?: string
  duration_weeks: number
  sessions_per_week: number
  program_type: string
  target_level: string
  weekly_structure: { phases: Array<ProgramPhase & { sessions: ProgramSession[] }> }
  program_status: string
}

export interface ProgramEnrollment {
  id: string
  user_id: string
  program_id: string
  status: 'enrolled' | 'active' | 'paused' | 'completed' | 'abandoned'
  current_week: number
  completed_sessions: number
  total_sessions: number
  completion_percentage: number
  enrolled_at: string
  started_at?: string | null
  customizations_applied: string
  schedule_adjustments: string
  // Champs joints depuis training_programs
  program_name: string
  program_description: string
  program_objectives?: string
  duration_weeks: number
  sessions_per_week: number
  program_type: string
  target_level: string
  weekly_structure: { phases: Array<ProgramPhase & { sessions: ProgramSession[] }> }
  progression_scheme?: { notes?: string } | null
}

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  strength_building: 'Force',
  endurance_base: 'Endurance',
  competition_prep: 'Compétition',
  off_season: 'Intersaison',
}

export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

export const FOCUS_LABELS: Record<string, string> = {
  strength: 'Force',
  conditioning: 'Conditionnement',
  skill: 'Technique',
  mixed: 'Mixte',
  recovery: 'Récupération',
}

export const FOCUS_COLORS: Record<string, string> = {
  strength: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  conditioning: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  skill: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  mixed: 'text-green-400 bg-green-400/10 border-green-400/20',
  recovery: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}
