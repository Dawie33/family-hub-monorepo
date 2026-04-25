'use client'

import { sessionService } from '@/services'
import { WorkoutSession } from '@/domain/entities/workout'
import { useEffect, useState } from 'react'

export function formatResult(results: WorkoutSession['results']): string {
  if (!results) return '—'
  if (results.elapsed_time_seconds) {
    const s = results.elapsed_time_seconds
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }
  if (results['cap_reached']) {
    return results['reps_at_cap'] ? `Cap — ${results['reps_at_cap']} reps` : 'Cap atteint'
  }
  if (results['rounds'] !== undefined) {
    return results['reps'] ? `${results['rounds']} rds + ${results['reps']} reps` : `${results['rounds']} rounds`
  }
  return '—'
}

export function useCrossfitDashboard() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sessionService.getAll({ limit: 5, orderBy: 'completed_at', orderDir: 'desc' })
      .then((res) => setSessions(res.rows ?? res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sessions, loading }
}
