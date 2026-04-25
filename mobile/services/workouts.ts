import { api } from './api'

export interface Workout {
  id: string
  name: string
  workout_type?: string
  description?: string
  intensity?: string
  estimated_duration?: number
  status?: string
  blocks?: any
}

export interface WorkoutSession {
  id: string
  workout_id: string
  started_at: string
  completed_at?: string
  notes?: string
}

export async function getWorkouts(limit = 50): Promise<Workout[]> {
  const result = await api.get<{ rows: Workout[]; count: number }>(`/workouts?limit=${limit}&offset=0`)
  return result.rows ?? []
}

export async function getWorkoutById(id: string): Promise<Workout> {
  return api.get<Workout>(`/workouts/${id}`)
}

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  const result = await api.get<{ rows: WorkoutSession[]; count: number }>('/workout-sessions')
  return result.rows
}

export async function getDailyWorkout(): Promise<Workout | null> {
  try {
    return await api.get<Workout>('/workouts/daily')
  } catch {
    return null
  }
}
