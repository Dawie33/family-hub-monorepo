import { WorkoutStats } from '@/domain/entities/workout-history'
import { workoutsService } from '@/services'
import { useEffect, useState } from 'react'
import { useWorkoutSession } from './useWorkoutSession'

/**
 * Hook personnalisé pour récupérer et calculer les statistiques des workouts
 * Utilisable dans le dashboard et la page tracking
 */
export function useWorkoutStats() {
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null)
  const { workoutSessions, loading } = useWorkoutSession()

  // Calculer les stats à partir des sessions
  useEffect(() => {
    if (!workoutSessions || workoutSessions.length === 0) {
      setWorkoutStats(null)
      return
    }

    const completedSessions = workoutSessions.filter(s => s.completed_at)

    // Total workouts
    const totalWorkouts = completedSessions.length

    // Durée totale (en secondes)
    const totalDuration = completedSessions.reduce((acc, session) => {
      const duration = (new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000
      return acc + duration
    }, 0)

    // Durée cette semaine
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const totalDurationThisWeek = completedSessions
      .filter(s => new Date(s.started_at) >= oneWeekAgo)
      .reduce((acc, session) => {
        const duration = (new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000
        return acc + duration
      }, 0)

    // Calculer les workouts par jour (30 derniers jours)
    const workoutsByDay: { date: string; count: number; duration: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayWorkouts = completedSessions.filter(s => {
        const sessionDate = new Date(s.started_at)
        return sessionDate >= date && sessionDate < nextDay
      })

      const count = dayWorkouts.length
      const duration = dayWorkouts.reduce((acc, session) => {
        return acc + Math.floor((new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000)
      }, 0)

      workoutsByDay.push({
        date: date.toISOString().split('T')[0],
        count,
        duration
      })
    }

    // Calculer le streak (série de jours consécutifs)
    const sortedDates = [...new Set(completedSessions.map(s => new Date(s.started_at).toISOString().split('T')[0]))].sort().reverse()

    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (sortedDates.includes(dateStr)) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    const longestStreak = currentStreak

    // Durée ce mois
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const totalDurationThisMonth = completedSessions
      .filter(s => new Date(s.started_at) >= oneMonthAgo)
      .reduce((acc, session) => {
        const duration = (new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000
        return acc + duration
      }, 0)

    const workoutsThisMonth = completedSessions.filter(s => {
      const sessionDate = new Date(s.started_at)
      return sessionDate >= oneMonthAgo
    }).length

    // Calculer la note moyenne
    const ratings = completedSessions
      .map(s => s.results?.rating)
      .filter((r): r is number => r !== undefined && r !== null && r > 0)
    const averageDifficulty = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0

    // Commencer avec les stats de base
    setWorkoutStats({
      totalWorkouts,
      totalDuration,
      totalDurationThisWeek,
      totalDurationThisMonth,
      currentStreak,
      longestStreak,
      workoutsByDay,
      workoutsByType: { FOR_TIME: 0, AMRAP: 0, EMOM: 0, TABATA: 0 },
      personalRecords: [],
      averageDifficulty,
      favoriteTimerType: 'FOR_TIME',
      workoutsThisMonth
    })

    // Enrichir async avec les données par type et records
    const fetchWorkoutTypes = async () => {
      const workoutsByType: Record<string, number> = {}

      const personalRecords: { type: string; value: number; unit: string; date: string }[] = []

      // Regrouper sessions par workout_id
      const grouped: Record<string, typeof completedSessions> = {}
      for (const session of completedSessions) {
        if (!session.workout_id) continue
        if (!grouped[session.workout_id]) {
          grouped[session.workout_id] = []
        }
        grouped[session.workout_id].push(session)
      }

      const workoutCache: Record<string, { name: string; type: string }> = {}
      for (const workoutId of Object.keys(grouped)) {
        try {
          const workout = await workoutsService.getById(workoutId)
          const type = workout.workout_type || 'autre'
          workoutCache[workoutId] = { name: workout.name, type }
          workoutsByType[type] = (workoutsByType[type] || 0) + grouped[workoutId].length
        } catch {
          // Workout supprimé
        }
      }

      // Personal records par workout
      for (const [workoutId, sessions] of Object.entries(grouped)) {
        const info = workoutCache[workoutId]
        if (!info) continue

        const isAmrap = info.type === 'amrap'

        if (isAmrap) {
          const rounds = sessions
            .map(s => (s.results?.rounds as number) || 0)
            .filter(r => r > 0)
          if (rounds.length > 0) {
            const bestRounds = Math.max(...rounds)
            const bestSession = sessions.find(s => (s.results?.rounds as number) === bestRounds)
            personalRecords.push({
              type: info.name,
              value: bestRounds,
              unit: 'rounds',
              date: bestSession?.started_at || sessions[0].started_at,
            })
          }
        } else {
          const times = sessions
            .map(s => s.results?.elapsed_time_seconds || 0)
            .filter(t => t > 0)
          if (times.length > 0) {
            const bestTime = Math.min(...times)
            const bestSession = sessions.find(s => s.results?.elapsed_time_seconds === bestTime)
            const mins = Math.floor(bestTime / 60)
            const secs = bestTime % 60
            personalRecords.push({
              type: info.name,
              value: bestTime,
              unit: `${mins}:${secs.toString().padStart(2, '0')}`,
              date: bestSession?.started_at || sessions[0].started_at,
            })
          }
        }
      }

      const sortedTypes = Object.entries(workoutsByType).sort((a, b) => b[1] - a[1])
      const favoriteTimerType = sortedTypes[0]?.[0] as 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' ?? 'FOR_TIME'

      setWorkoutStats({
        totalWorkouts,
        totalDuration,
        totalDurationThisWeek,
        totalDurationThisMonth,
        currentStreak,
        longestStreak,
        workoutsByDay,
        workoutsByType: workoutsByType as Record<'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA', number>,
        personalRecords,
        averageDifficulty,
        favoriteTimerType,
        workoutsThisMonth
      })
    }

    fetchWorkoutTypes()
  }, [workoutSessions])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return {
    workoutStats,
    loading,
    formatDuration,
    workoutSessions,
  }
}
