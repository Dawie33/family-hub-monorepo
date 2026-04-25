/**
 * Types pour les composants du dashboard
 */

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  color: string
  completed: boolean
}
/**
 * Types pour les conseils
 */
export interface Tip {
  id: string
  type: 'advice' | 'exercise' | 'article'
  title: string
  description: string
  link?: string
  icon: 'lightbulb' | 'sparkles' | 'book'
  color: string
}

export type PeriodType = 'week' | 'month' | 'year'
export type MetricType = 'count' | 'duration'

/**
 * Types pour le calendrier
 */
export interface DayWorkout {
  id: string
  workoutId?: string
  name: string
  type: 'scheduled' | 'completed' | 'rest'
  intensity?: 'low' | 'medium' | 'high'
  duration?: number
}

export interface WeekDay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  workouts: DayWorkout[]
}