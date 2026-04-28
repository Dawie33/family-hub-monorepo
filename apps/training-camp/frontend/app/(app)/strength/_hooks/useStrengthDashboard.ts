'use client'

import { strengthService, StrengthSession, StrengthStats } from '@/services/strength'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useStrengthDashboard() {
  const [sessions, setSessions] = useState<StrengthSession[]>([])
  const [stats, setStats] = useState<StrengthStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsData, statsData] = await Promise.all([
        strengthService.getSessions({ limit: 20 }),
        strengthService.getStats(),
      ])
      setSessions(sessionsData.rows)
      setStats(statsData)
    } catch { /* silencieux */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id: string) => {
    try {
      await strengthService.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Séance supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return { sessions, stats, loading, handleDelete, refetch: fetchAll }
}
