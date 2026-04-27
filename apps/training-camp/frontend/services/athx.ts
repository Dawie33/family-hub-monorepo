import { apiClient } from './index'

export type AthxSessionType = 'full_competition' | 'strength_prep' | 'endurance_prep' | 'metcon_prep' | 'mixed'

export const ATHX_SESSION_TYPE_LABELS: Record<AthxSessionType, string> = {
  full_competition: 'Compétition complète',
  strength_prep: 'Zone Force',
  endurance_prep: 'Zone Endurance',
  metcon_prep: 'MetCon X',
  mixed: 'Multi-zones',
}

export const ATHX_SESSION_TYPE_COLORS: Record<AthxSessionType, string> = {
  full_competition: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  strength_prep: 'bg-red-500/20 text-red-400 border-red-500/30',
  endurance_prep: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  metcon_prep: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  mixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export interface AthxExercise {
  name: string
  sets?: number
  reps?: number | string
  duration?: string
  rest?: string
  intensity?: string
  notes?: string
}

export interface AthxBlock {
  zone: 'warmup' | 'strength' | 'endurance' | 'metcon' | 'cooldown'
  label: string
  duration_minutes: number
  exercises: AthxExercise[]
  notes?: string
}

export interface GeneratedAthxPlan {
  name: string
  session_type: AthxSessionType
  target_zones: string[]
  duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  description: string
  blocks: AthxBlock[]
  coaching_tips: string
  competition_notes: string
}

export interface AthxSession {
  id: string
  user_id: string
  session_date: string
  session_type: AthxSessionType
  source: 'manual' | 'ai_generated'
  scheduled_activity_id?: string
  duration_minutes?: number
  perceived_effort?: number
  zone_results?: Record<string, { score?: string; notes?: string }>
  ai_plan?: GeneratedAthxPlan
  notes?: string
  created_at: string
  updated_at: string
}

export interface AthxStats {
  total_sessions: number
  total_hours: number
  type_breakdown: Record<string, number>
  avg_effort: number | null
}

export interface GenerateAthxDto {
  session_type: AthxSessionType
  duration_minutes: number
  level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  equipment_mode?: 'saved' | 'official'
  target_zones?: string
  competition_date?: string
  additional_instructions?: string
  equipment_available?: string[]
}

export const athxService = {
  async getSessions(params?: Record<string, string | number | undefined>) {
    return apiClient.get<{ rows: AthxSession[]; count: number }>('/athx/sessions', { params })
  },

  async getStats() {
    return apiClient.get<AthxStats>('/athx/sessions/stats')
  },

  async getById(id: string) {
    return apiClient.get<AthxSession>(`/athx/sessions/${id}`)
  },

  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(`/athx/sessions/${id}`)
  },

  async generatePreview(data: GenerateAthxDto) {
    return apiClient.post<GeneratedAthxPlan>('/athx/generate/preview', data)
  },

  async generateAndSave(data: GenerateAthxDto) {
    return apiClient.post<AthxSession>('/athx/generate/save', data)
  },

  async update(id: string, data: Partial<{ duration_minutes: number; perceived_effort: number; notes: string; zone_results: Record<string, unknown> }>) {
    return apiClient.patch<AthxSession>(`/athx/sessions/${id}`, data)
  },
}
