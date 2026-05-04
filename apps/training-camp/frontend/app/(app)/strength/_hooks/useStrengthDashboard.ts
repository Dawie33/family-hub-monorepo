'use client'

import { strengthService, StrengthSession, StrengthStats } from '@/services/strength'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Filters {
  goal?: string
  muscle?: string
}

export function useStrengthDashboard() {
  const [sessions, setSessions] = useState<StrengthSession[]>([])
  const [stats, setStats] = useState<StrengthStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({})

  const fetchSessions = useCallback(async (activeFilters: Filters) => {
    try {
      setLoading(true)
      const data = await strengthService.getSessions({
        limit: 50,
        session_goal: activeFilters.goal || undefined,
        target_muscle: activeFilters.muscle || undefined,
      })
      setSessions(data.rows)
    } catch (err) {
      console.error('[useStrengthDashboard] fetchSessions failed:', err)
      toast.error('Impossible de charger les séances')
    } finally { setLoading(false) }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await strengthService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('[useStrengthDashboard] fetchStats failed:', err)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchSessions(filters)
  }, [fetchSessions, filters])

  const handleDelete = async (id: string) => {
    try {
      await strengthService.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Séance supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return { sessions, stats, loading, filters, setFilters, handleDelete }
}
