import { apiClient } from './index'

export type ActivityModule = 'crossfit' | 'hyrox' | 'running' | 'athx' | 'strength'
export type ActivityStatus = 'scheduled' | 'completed' | 'skipped' | 'rescheduled'

/**
 * Vue unifiée d'une activité planifiée, quelle que soit sa source
 * (CrossFit depuis user_workout_schedule, autres modules depuis scheduled_activities)
 */
export interface UnifiedActivity {
  id: string
  user_id: string
  scheduled_date: string
  module: ActivityModule
  status: ActivityStatus
  title: string
  notes?: string
  created_at: string
  updated_at: string

  // Champs CrossFit
  workout_id?: string
  personalized_workout_id?: string
  program_enrollment_id?: string
  session_type?: 'workout' | 'box_session' | 'program_session'
  session_data?: Record<string, unknown>
  workout_name?: string  // alias de title pour compatibilité avec les composants existants
  workout_type?: string
  difficulty?: string
  intensity?: string
  estimated_duration?: number
  completed_session_id?: string

  // Champs nouveaux modules
  activity_type?: 'hyrox' | 'running' | 'athx'
  activity_id?: string

  // Champs Force
  target_muscles?: string[]
  session_goal?: string
  duration_minutes?: number
  perceived_effort?: number

  // Identifie la table source pour les actions CRUD
  _source: 'workout_schedule' | 'scheduled_activities' | 'strength_sessions'
}

export interface CreateActivityDto {
  activity_type: 'hyrox' | 'running' | 'athx' | 'strength'
  scheduled_date: string
  activity_id?: string
  notes?: string
}

export interface UpdateActivityDto {
  scheduled_date?: string
  status?: ActivityStatus
  activity_id?: string
  notes?: string
}

export interface UnifiedActivityQueryParams extends Record<string, string | number | boolean | undefined> {
  start_date?: string
  end_date?: string
  status?: ActivityStatus
  module?: ActivityModule
}

export const activitiesApi = {
  /**
   * Récupère la vue unifiée de toutes les activités planifiées (CrossFit + HYROX + Running + ATHX)
   */
  async getUnified(params?: UnifiedActivityQueryParams): Promise<UnifiedActivity[]> {
    return apiClient.get<UnifiedActivity[]>('/scheduled-activities/unified', { params })
  },

  /**
   * Crée une nouvelle activité planifiée (HYROX / Running / ATHX)
   */
  async create(data: CreateActivityDto): Promise<UnifiedActivity> {
    return apiClient.post<UnifiedActivity>('/scheduled-activities', data)
  },

  /**
   * Met à jour une activité planifiée (HYROX / Running / ATHX)
   */
  async update(id: string, data: UpdateActivityDto): Promise<UnifiedActivity> {
    return apiClient.patch<UnifiedActivity>(`/scheduled-activities/${id}`, data)
  },

  /**
   * Supprime une activité planifiée (HYROX / Running / ATHX)
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/scheduled-activities/${id}`)
  },

  /**
   * Marque une activité comme complétée
   */
  async markAsCompleted(id: string): Promise<UnifiedActivity> {
    return apiClient.patch<UnifiedActivity>(`/scheduled-activities/${id}/complete`)
  },

  /**
   * Marque une activité comme sautée
   */
  async markAsSkipped(id: string): Promise<UnifiedActivity> {
    return apiClient.patch<UnifiedActivity>(`/scheduled-activities/${id}/skip`)
  },
}
