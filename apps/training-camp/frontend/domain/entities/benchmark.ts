/**
 * Types pour les benchmarks et leurs résultats
 */

export interface BenchmarkResult {
  // Métriques principales (au moins une requise)
  time_seconds?: number      // Pour workouts "For Time"
  rounds?: number            // Pour workouts AMRAP
  reps?: number              // Reps complémentaires
  weight?: number            // Pour 1RM ou puissance (FTP)
  distance?: number          // Pour Cooper Test

  // Métriques secondaires (optionnelles)
  average_pace?: number      // Pour running (secondes/km)
  heart_rate_avg?: number    // Fréquence cardiaque moyenne
  heart_rate_max?: number    // Fréquence cardiaque max
  notes?: string             // Notes libres
}

export interface SaveBenchmarkResultDto {
  workoutId: string
  workoutName: string
  result: BenchmarkResult

  // Contexte optionnel
  scaling_used?: 'RX' | 'Scaled' | 'Modified'
  felt_difficulty?: number   // 1-10
  energy_level?: number      // 1-10
}

export interface BenchmarkAttempt {
  id: string
  user_id: string
  workout_id: string
  workout_name: string

  result: BenchmarkResult
  level_achieved: 'beginner' | 'intermediate' | 'advanced' | 'elite'

  scaling_used?: string
  notes?: string
  felt_difficulty?: number
  energy_level?: number

  completed_at: string
  created_at: string
}

export interface BenchmarkHistory {
  workout_name: string
  workout_id: string
  attempts: BenchmarkAttempt[]
  best_result: BenchmarkResult
  current_level: string
  progress_percentage?: number
}
