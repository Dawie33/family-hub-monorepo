import { WorkoutSession } from '@/domain/entities/workout'
import { workoutsService } from '@/services'
import { useCallback, useEffect, useState } from 'react'
import { useWorkoutSession } from './useWorkoutSession'

export interface WorkoutProgress {
  workoutId: string
  workoutName: string
  workoutType: string
  sessionCount: number
  sessions: {
    date: string
    elapsedSeconds: number
    rounds?: number
    version?: string
    rating?: number
  }[]
  bestTime: number
  lastTime: number
  bestRounds?: number
  lastRounds?: number
  trend: 'improving' | 'declining' | 'stable'
  improvementPercent: number
}

export function useWorkoutProgress() {
  const { workoutSessions, loading: sessionsLoading } = useWorkoutSession()
  const [progressData, setProgressData] = useState<WorkoutProgress[]>([])
  const [loading, setLoading] = useState(true)

  const computeProgress = useCallback(async () => {
    if (!workoutSessions || workoutSessions.length === 0) {
      setProgressData([])
      setLoading(false)
      return
    }

    const completedSessions = workoutSessions.filter(s => s.completed_at)

    // Regrouper par workout_id
    const grouped: Record<string, WorkoutSession[]> = {}
    for (const session of completedSessions) {
      if (!session.workout_id) continue
      if (!grouped[session.workout_id]) {
        grouped[session.workout_id] = []
      }
      grouped[session.workout_id].push(session)
    }

    // Ne garder que les workouts faits au moins 2 fois
    const multiSessionWorkouts = Object.entries(grouped).filter(
      ([, sessions]) => sessions.length >= 2
    )

    if (multiSessionWorkouts.length === 0) {
      setProgressData([])
      setLoading(false)
      return
    }

    // Fetch workout details pour chaque workout_id
    const progressResults: WorkoutProgress[] = []

    for (const [workoutId, sessions] of multiSessionWorkouts) {
      // Trier par date (plus ancien en premier)
      const sorted = [...sessions].sort(
        (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
      )

      let workoutName = `Workout`
      let workoutType = ''
      try {
        const workout = await workoutsService.getById(workoutId)
        workoutName = workout.name || workoutName
        workoutType = workout.workout_type || ''
      } catch {
        // Workout supprimé, on utilise un nom par défaut
      }

      const sessionData = sorted.map(s => {
        const elapsed = s.results?.elapsed_time_seconds ||
          Math.floor((new Date(s.completed_at!).getTime() - new Date(s.started_at).getTime()) / 1000)
        return {
          date: s.started_at,
          elapsedSeconds: elapsed,
          rounds: s.results?.rounds as number | undefined,
          version: s.results?.version as string | undefined,
          rating: s.results?.rating || undefined,
        }
      })

      const times = sessionData.map(s => s.elapsedSeconds).filter(t => t > 0)
      const rounds = sessionData.map(s => s.rounds).filter((r): r is number => r !== undefined && r > 0)

      const bestTime = times.length > 0 ? Math.min(...times) : 0
      const lastTime = times.length > 0 ? times[times.length - 1] : 0
      const bestRounds = rounds.length > 0 ? Math.max(...rounds) : undefined
      const lastRounds = rounds.length > 0 ? rounds[rounds.length - 1] : undefined

      // Calculer le trend basé sur le type de workout
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      let improvementPercent = 0

      if (rounds.length >= 2) {
        // AMRAP : plus de rounds = mieux
        const firstRounds = rounds[0]
        const latestRounds = rounds[rounds.length - 1]
        improvementPercent = ((latestRounds - firstRounds) / firstRounds) * 100
        trend = improvementPercent > 5 ? 'improving' : improvementPercent < -5 ? 'declining' : 'stable'
      } else if (times.length >= 2) {
        // For Time : moins de temps = mieux
        const firstTime = times[0]
        const latestTime = times[times.length - 1]
        improvementPercent = ((firstTime - latestTime) / firstTime) * 100
        trend = improvementPercent > 5 ? 'improving' : improvementPercent < -5 ? 'declining' : 'stable'
      }

      progressResults.push({
        workoutId,
        workoutName,
        workoutType,
        sessionCount: sessions.length,
        sessions: sessionData,
        bestTime,
        lastTime,
        bestRounds,
        lastRounds,
        trend,
        improvementPercent: Math.round(improvementPercent),
      })
    }

    // Trier par nombre de sessions (le plus fait en premier)
    progressResults.sort((a, b) => b.sessionCount - a.sessionCount)

    setProgressData(progressResults)
    setLoading(false)
  }, [workoutSessions])

  useEffect(() => {
    if (!sessionsLoading) {
      computeProgress()
    }
  }, [sessionsLoading, computeProgress])

  return {
    progressData,
    loading: loading || sessionsLoading,
  }
}
