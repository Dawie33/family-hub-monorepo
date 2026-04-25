import { TimerType } from "@/hooks/useWorkoutTimer"

export interface WorkoutResult {
  id: string
  userId: string
  workoutId?: string
  workoutName?: string
  timerType: TimerType
  date: string
  duration: number // en secondes
  completedRounds?: number
  totalRounds?: number
  notes?: string
  difficulty: 'easy' | 'medium' | 'hard'
  feeling: 'bad' | 'ok' | 'good' | 'great'
  personalRecords?: {
    type: string
    value: number
    unit: string
  }[]
  exercises?: {
    name: string
    reps?: number
    weight?: number
    sets?: number
  }[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutStats {
  totalWorkouts: number
  totalDuration: number // en secondes
  totalDurationThisWeek: number
  totalDurationThisMonth: number
  workoutsThisMonth?: number // Nombre de workouts ce mois
  currentStreak: number
  longestStreak: number
  averageDifficulty: number
  favoriteTimerType: TimerType | null
  workoutsByType: Record<TimerType, number>
  workoutsByDay: ProgressData[]
  personalRecords: PersonalRecord[]
}

export interface ProgressData {
  date: string
  count: number
  duration: number
}

export interface PersonalRecord {
  type: string
  value: number
  unit: string
  date: string
}
