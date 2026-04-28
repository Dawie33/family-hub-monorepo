export type ActivityModule = 'crossfit' | 'hyrox' | 'running' | 'athx' | 'strength'
export type ActivityStatus = 'scheduled' | 'completed' | 'skipped' | 'rescheduled'

/**
 * Vue unifiée d'une activité planifiée, quelle que soit sa source
 * (user_workout_schedule pour CrossFit, scheduled_activities pour les autres modules,
 * strength_sessions pour le module Force)
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

  // Champs CrossFit (source: user_workout_schedule)
  workout_id?: string
  personalized_workout_id?: string
  session_type?: 'workout' | 'box_session'
  workout_name?: string
  workout_type?: string
  difficulty?: string
  intensity?: string
  estimated_duration?: number
  completed_session_id?: string

  // Champs nouveaux modules (source: scheduled_activities)
  activity_type?: 'hyrox' | 'running' | 'athx'
  activity_id?: string

  // Champs Force (source: strength_sessions)
  target_muscles?: string[]
  session_goal?: string
  duration_minutes?: number
  perceived_effort?: number

  // Identifie la table source pour les actions CRUD
  _source: 'workout_schedule' | 'scheduled_activities' | 'strength_sessions'
}
