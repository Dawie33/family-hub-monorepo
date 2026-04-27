import { apiClient } from './index'

export type HyroxSessionType = 'full_simulation' | 'station_prep' | 'run_prep' | 'mixed'

export const HYROX_STATIONS = [
  'ski_erg', 'sled_push', 'sled_pull', 'burpee_broad_jumps',
  'rowing', 'farmers_carry', 'sandbag_lunges', 'wall_balls',
] as const

export type HyroxStation = typeof HYROX_STATIONS[number]

export const HYROX_STATION_LABELS: Record<HyroxStation, string> = {
  ski_erg: 'SkiErg',
  sled_push: 'Sled Push',
  sled_pull: 'Sled Pull',
  burpee_broad_jumps: 'Burpee Broad Jumps',
  rowing: 'Rowing',
  farmers_carry: 'Farmers Carry',
  sandbag_lunges: 'Sandbag Lunges',
  wall_balls: 'Wall Balls',
}

export const HYROX_STATION_DISTANCES: Record<HyroxStation, string> = {
  ski_erg: '1000m',
  sled_push: '50m',
  sled_pull: '50m',
  burpee_broad_jumps: '80m',
  rowing: '1000m',
  farmers_carry: '200m',
  sandbag_lunges: '100m',
  wall_balls: '100 reps',
}

export const HYROX_SESSION_TYPE_LABELS: Record<HyroxSessionType, string> = {
  full_simulation: 'Simulation complète',
  station_prep: 'Travail stations',
  run_prep: 'Travail course',
  mixed: 'Mixte',
}

export const HYROX_SESSION_TYPE_COLORS: Record<HyroxSessionType, string> = {
  full_simulation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  station_prep: 'bg-red-500/20 text-red-400 border-red-500/30',
  run_prep: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  mixed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export interface StationTime {
  station: HyroxStation
  time_seconds: number
  alternative_used?: string
}

export interface RunTime {
  run: number
  time_seconds: number
}

export interface HyroxExercise {
  name: string
  sets?: number
  reps?: number | string
  distance?: string
  duration?: string
  rest?: string
  intensity?: string
  alternative?: string
  estimated_minutes: number
  notes?: string
}

export interface HyroxBlock {
  type: 'warmup' | 'run_work' | 'station_work' | 'mixed' | 'cooldown'
  label: string
  duration_minutes: number
  target_stations?: string[]
  exercises: HyroxExercise[]
  notes?: string
}

export interface GeneratedHyroxPlan {
  name: string
  session_type: HyroxSessionType
  duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  description: string
  blocks: HyroxBlock[]
  equipment_notes: string
  coaching_tips: string
  race_strategy: string
}

export interface HyroxSession {
  id: string
  user_id: string
  session_date: string
  session_type: HyroxSessionType
  source: 'manual' | 'ai_generated'
  scheduled_activity_id?: string
  total_time_seconds?: number
  run_times?: RunTime[]
  station_times?: StationTime[]
  equipment_available?: string[]
  perceived_effort?: number
  ai_plan?: GeneratedHyroxPlan
  notes?: string
  created_at: string
  updated_at: string
}

export interface HyroxStats {
  total_sessions: number
  total_simulations: number
  best_time_seconds: number | null
  avg_time_seconds: number | null
  station_prs: Record<string, number | null>
}

export interface GenerateHyroxDto {
  session_type: HyroxSessionType
  duration_minutes: number
  equipment_mode?: 'saved' | 'official'
  equipment_available?: string[]
  stations_to_work?: HyroxStation[]
  level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  additional_instructions?: string
}

/** Formate un temps en secondes → mm:ss ou h:mm:ss */
export function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const hyroxService = {
  async getSessions(params?: Record<string, string | number | undefined>) {
    return apiClient.get<{ rows: HyroxSession[]; count: number }>('/hyrox/sessions', { params })
  },

  async getStats() {
    return apiClient.get<HyroxStats>('/hyrox/sessions/stats')
  },

  async getById(id: string) {
    return apiClient.get<HyroxSession>(`/hyrox/sessions/${id}`)
  },

  async create(data: Partial<HyroxSession>) {
    return apiClient.post<HyroxSession>('/hyrox/sessions', data)
  },

  async update(id: string, data: Partial<HyroxSession>) {
    return apiClient.patch<HyroxSession>(`/hyrox/sessions/${id}`, data)
  },

  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(`/hyrox/sessions/${id}`)
  },

  async generatePreview(data: GenerateHyroxDto) {
    return apiClient.post<GeneratedHyroxPlan>('/hyrox/generate/preview', data)
  },

  async generateAndSave(data: GenerateHyroxDto) {
    return apiClient.post<HyroxSession>('/hyrox/generate/save', data)
  },
}
