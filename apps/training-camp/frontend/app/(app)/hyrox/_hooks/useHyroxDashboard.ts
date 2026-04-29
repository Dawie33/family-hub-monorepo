'use client'

import { hyroxService, HyroxSession, HyroxStats } from '@/services/hyrox'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useHyroxDashboard() {
  const [sessions, setSessions] = useState<HyroxSession[]>([])
  const [stats, setStats] = useState<HyroxStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsData, statsData] = await Promise.all([
        hyroxService.getSessions({ limit: 20 }),
        hyroxService.getStats(),
      ])
      setSessions(sessionsData.rows)
      setStats(statsData)
    } catch (err) {
      console.error('[useHyroxDashboard] fetchAll failed:', err)
      toast.error('Impossible de charger les données Hyrox')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id: string) => {
    try {
      await hyroxService.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Séance supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return { sessions, stats, loading, handleDelete, refetch: fetchAll }
}
