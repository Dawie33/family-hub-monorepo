import { api } from './api'

export interface PersonalizedWorkout {
  id: string
  name: string
  workout_type?: string
  description?: string
  intensity?: string
  estimated_duration?: number
  difficulty?: string
  blocks?: any
  created_at: string
}

export async function getPersonalizedWorkouts(limit = 20): Promise<PersonalizedWorkout[]> {
  const res = await api.get<{ rows: PersonalizedWorkout[]; count: number } | PersonalizedWorkout[]>(
    `/workouts/personalized?limit=${limit}`
  )
  if (Array.isArray(res)) return res
  return (res as any).rows ?? []
}

export async function getPersonalizedWorkout(id: string): Promise<PersonalizedWorkout> {
  return api.get<PersonalizedWorkout>(`/workouts/personalized/${id}`)
}

export async function deletePersonalizedWorkout(id: string): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(`/workouts/personalized/${id}`)
}
