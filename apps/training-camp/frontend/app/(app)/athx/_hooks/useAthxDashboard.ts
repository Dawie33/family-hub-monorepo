'use client'

import { athxService, AthxSession, AthxStats } from '@/services/athx'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useAthxDashboard() {
  const [sessions, setSessions] = useState<AthxSession[]>([])
  const [stats, setStats] = useState<AthxStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsData, statsData] = await Promise.all([
        athxService.getSessions({ limit: 20 }),
        athxService.getStats(),
      ])
      setSessions(sessionsData.rows)
      setStats(statsData)
    } catch { /* silencieux */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id: string) => {
    try {
      await athxService.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Séance supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return { sessions, stats, loading, handleDelete, refetch: fetchAll }
}
