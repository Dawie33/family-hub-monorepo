import apiClient from './apiClient'

// --- Types ---

export interface ActiveEnrollment {
  id: string
  status: 'enrolled' | 'active' | 'paused' | 'completed' | 'abandoned'
  current_week: number
  completed_sessions: number
  total_sessions: number
  completion_percentage: number
  enrolled_at: string
  started_at: string | null
  program_name: string
  program_description: string
  program_objectives: string
  duration_weeks: number
  sessions_per_week: number
  program_type: string
  target_level: string
  weekly_structure: { phases: ProgramPhase[] }
}

export interface ProgramPhase {
  phase_number: number
  name: string
  weeks: number[]
  description: string
  sessions: ProgramSession[]
}

export interface ProgramSession {
  session_in_week: number
  title: string
  focus: 'strength' | 'conditioning' | 'skill' | 'mixed' | 'recovery'
  estimated_duration: number
  strength_work?: {
    movements: { name: string; sets: number; reps: string | number; intensity?: string; rest?: string; notes?: string }[]
  } | null
  conditioning?: {
    type: string
    duration_minutes?: number | null
    rounds?: number | null
    movements: { name: string; reps?: string | number | null; distance?: string | null; weight?: string | null }[]
    scaling_notes?: string | null
  } | null
  skill_work?: { name: string; description: string; sets?: number | null; duration?: string | null } | null
  coach_notes?: string | null
  _swapped?: boolean
}

export interface WeekSessions {
  phase: Omit<ProgramPhase, 'sessions'>
  sessions: ProgramSession[]
  weekNum: number
}

export interface GenerateProgramDto {
  program_type: 'strength_building' | 'endurance_base' | 'competition_prep' | 'off_season'
  duration_weeks: 4 | 6 | 8 | 12
  sessions_per_week: 2 | 3 | 4 | 5
  target_level: 'beginner' | 'intermediate' | 'advanced'
  focus?: string
  box_days_per_week?: number
}

export interface GeneratedProgram {
  name: string
  description: string
  objectives: string
  phases: ProgramPhase[]
  progression_notes: string
  coach_notes?: string | null
}

// --- Service ---

export const trainingProgramsApi = {
  generatePreview: (dto: GenerateProgramDto): Promise<GeneratedProgram> =>
    apiClient.post('/training-programs/generate-ai', dto),

  createAndEnroll: (program: GeneratedProgram & { program_type: string; duration_weeks: number; sessions_per_week: number; target_level: string }) =>
    apiClient.post('/training-programs', {
      name: program.name,
      description: program.description,
      objectives: program.objectives,
      program_type: program.program_type,
      duration_weeks: program.duration_weeks,
      sessions_per_week: program.sessions_per_week,
      target_level: program.target_level,
      weekly_structure: { phases: program.phases },
      progression_notes: program.progression_notes,
    }),

  getActive: (): Promise<ActiveEnrollment | null> =>
    apiClient.get('/training-programs/active'),

  getWeekSessions: (enrollmentId: string, weekNum: number): Promise<WeekSessions> =>
    apiClient.get(`/training-programs/enrollments/${enrollmentId}/week/${weekNum}`),

  start: (enrollmentId: string) =>
    apiClient.patch(`/training-programs/enrollments/${enrollmentId}/start`, {}),

  pause: (enrollmentId: string) =>
    apiClient.patch(`/training-programs/enrollments/${enrollmentId}/pause`, {}),

  abandon: (enrollmentId: string) =>
    apiClient.patch(`/training-programs/enrollments/${enrollmentId}/abandon`, {}),

  scheduleWeek: (enrollmentId: string, dto: { week_num: number; start_date: string; box_dates: string[] }) =>
    apiClient.post(`/training-programs/enrollments/${enrollmentId}/schedule-week`, dto),
}
