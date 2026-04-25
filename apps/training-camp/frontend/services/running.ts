import { apiClient } from './index'

export type RunType = 'easy' | 'tempo' | 'intervals' | 'long_run' | 'fartlek' | 'recovery' | 'race'
export type RunSource = 'manual' | 'ai_generated' | 'strava'

export const RUN_TYPE_LABELS: Record<RunType, string> = {
  easy: 'Sortie facile',
  tempo: 'Tempo',
  intervals: 'Fractionné',
  long_run: 'Sortie longue',
  fartlek: 'Fartlek',
  recovery: 'Récupération',
  race: 'Course',
}

export const RUN_TYPE_COLORS: Record<RunType, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  tempo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  intervals: 'bg-red-500/20 text-red-400 border-red-500/30',
  long_run: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fartlek: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  recovery: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  race: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export interface RunPhase {
  phase: 'warmup' | 'main' | 'cooldown' | 'recovery'
  label: string
  distance_km?: number
  duration_minutes: number
  pace_description: string
  target_zone: string
  intervals?: {
    effort_duration: string
    recovery_duration: string
    pace_description: string
    repetitions: number
  }[]
  notes?: string
}

export interface GeneratedRunningPlan {
  name: string
  run_type: RunType
  total_distance_km: number
  estimated_duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  description: string
  structure: RunPhase[]
  coaching_tips: string
  recovery_notes: string
}

export interface RunningSession {
  id: string
  user_id: string
  session_date: string
  run_type: RunType
  source: RunSource
  scheduled_activity_id?: string
  distance_km?: number
  duration_seconds?: number
  avg_pace_seconds_per_km?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  elevation_gain_m?: number
  calories?: number
  perceived_effort?: number
  ai_plan?: GeneratedRunningPlan
  strava_activity_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface RunningStats {
  total_sessions: number
  total_km: number
  total_hours: number
  avg_pace_seconds_per_km: number | null
  longest_run_km: number
  type_breakdown: Record<string, number>
}

export interface CreateRunningSessionDto {
  session_date: string
  run_type: RunType
  scheduled_activity_id?: string
  distance_km?: number
  duration_seconds?: number
  avg_pace_seconds_per_km?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  elevation_gain_m?: number
  calories?: number
  perceived_effort?: number
  notes?: string
}

export interface GenerateRunningDto {
  run_type: RunType
  duration_minutes: number
  target_distance_km?: number
  level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  goal?: string
  additional_instructions?: string
}

export interface RunningSessionQueryParams extends Record<string, string | number | boolean | undefined> {
  limit?: number
  offset?: number
  start_date?: string
  end_date?: string
  run_type?: RunType
  source?: RunSource
}

/** Formate une allure en mm:ss/km */
export function formatPace(secondsPerKm: number | null | undefined): string {
  if (!secondsPerKm) return '--'
  const min = Math.floor(secondsPerKm / 60)
  const sec = secondsPerKm % 60
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

/** Formate une durée en secondes → h:mm:ss ou mm:ss */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const runningService = {
  async getSessions(params?: RunningSessionQueryParams) {
    return apiClient.get<{ rows: RunningSession[]; count: number }>('/running/sessions', { params })
  },

  async getStats() {
    return apiClient.get<RunningStats>('/running/sessions/stats')
  },

  async getById(id: string) {
    return apiClient.get<RunningSession>(`/running/sessions/${id}`)
  },

  async create(data: CreateRunningSessionDto) {
    return apiClient.post<RunningSession>('/running/sessions', data)
  },

  async update(id: string, data: Partial<CreateRunningSessionDto>) {
    return apiClient.patch<RunningSession>(`/running/sessions/${id}`, data)
  },

  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(`/running/sessions/${id}`)
  },

  async generatePreview(data: GenerateRunningDto) {
    return apiClient.post<GeneratedRunningPlan>('/running/generate/preview', data)
  },

  async generateAndSave(data: GenerateRunningDto) {
    return apiClient.post<RunningSession>('/running/generate/save', data)
  },

  async getStravaStatus() {
    return apiClient.get<{ connected: boolean }>('/running/strava/status')
  },

  async getStravaAuthUrl() {
    return apiClient.get<{ url: string }>('/running/strava/auth-url')
  },

  async syncStrava() {
    return apiClient.post<{ imported: number; skipped: number }>('/running/strava/sync')
  },

  async disconnectStrava() {
    return apiClient.delete<{ success: boolean }>('/running/strava/disconnect')
  },
}
