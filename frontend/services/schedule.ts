import { apiClient } from './index'

export type SessionType = 'workout' | 'box_session' | 'program_session'

export interface WorkoutSchedule {
  id: string
  user_id: string
  workout_id?: string
  personalized_workout_id?: string
  program_enrollment_id?: string
  scheduled_date: string
  session_type?: SessionType
  status: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
  completed_session_id?: string
  notes?: string
  session_data?: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined data
  workout_name?: string
  workout_type?: string
  difficulty?: string
  intensity?: string
  estimated_duration?: number
}

export interface CreateScheduleDto {
  workout_id?: string
  personalized_workout_id?: string
  program_enrollment_id?: string
  scheduled_date: string
  session_type?: SessionType
  notes?: string
}

export interface UpdateScheduleDto {
  scheduled_date?: string
  status?: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
  completed_session_id?: string
  notes?: string
}

export interface ScheduleQueryParams extends Record<string, string | number | boolean | undefined> {
  limit?: number
  offset?: number
  start_date?: string
  end_date?: string
  status?: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
  workout_id?: string
}

export const scheduleApi = {
  /**
   * Récupère toutes les planifications de l'utilisateur
   */
  async getAll(params?: ScheduleQueryParams) {
    const response = await apiClient.get<{ rows: WorkoutSchedule[]; count: number }>('/workout-schedule', {
      params,
    })
    return response
  },

  /**
   * Récupère une planification spécifique
   */
  async getById(id: string) {
    const response = await apiClient.get<WorkoutSchedule>(`/workout-schedule/${id}`)
    return response
  },

  /**
   * Récupère la planification pour une date spécifique
   */
  async getByDate(date: string) {
    const response = await apiClient.get<WorkoutSchedule | null>(`/workout-schedule/by-date/${date}`)
    return response || null
  },

  /**
   * Crée une nouvelle planification
   */
  async create(data: CreateScheduleDto) {
    const response = await apiClient.post<WorkoutSchedule>('/workout-schedule', data)
    return response
  },

  /**
   * Met à jour une planification
   */
  async update(id: string, data: UpdateScheduleDto) {
    const response = await apiClient.patch<WorkoutSchedule>(`/workout-schedule/${id}`, data)
    return response
  },

  /**
   * Supprime une planification
   */
  async delete(id: string) {
    const response = await apiClient.delete<{ success: boolean }>(`/workout-schedule/${id}`)
    return response
  },

  /**
   * Marque une planification comme complétée
   */
  async markAsCompleted(id: string, sessionId?: string) {
    const response = await apiClient.patch<WorkoutSchedule>(`/workout-schedule/${id}/complete`, {
      session_id: sessionId,
    })
    return response
  },

  /**
   * Marque une planification comme sautée
   */
  async markAsSkipped(id: string) {
    const response = await apiClient.patch<WorkoutSchedule>(`/workout-schedule/${id}/skip`)
    return response
  },

  /**
   * Suggère une configuration de semaine basée sur l'historique
   */
  async getWeekSuggestion(weekStart: string): Promise<{ days: { date: string; type: string }[]; weeks_analyzed: number }> {
    return apiClient.get('/workout-schedule/week-suggestion', { params: { weekStart } })
  },

  /**
   * Crée un marqueur "Jour Box CrossFit" pour une date
   */
  async createBoxSession(date: string, notes?: string) {
    const response = await apiClient.post<WorkoutSchedule>('/workout-schedule', {
      scheduled_date: date,
      session_type: 'box_session',
      notes: notes || null,
    })
    return response
  },
}
