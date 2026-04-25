'use client'

import { runningService, RunningSession, RunningStats } from '@/services/running'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useRunningDashboard() {
  const [sessions, setSessions] = useState<RunningSession[]>([])
  const [stats, setStats] = useState<RunningStats | null>(null)
  const [stravaConnected, setStravaConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsData, statsData, stravaStatus] = await Promise.all([
        runningService.getSessions({ limit: 20 }),
        runningService.getStats(),
        runningService.getStravaStatus(),
      ])
      setSessions(sessionsData.rows)
      setStats(statsData)
      setStravaConnected(stravaStatus.connected)
    } catch {
      // silencieux au chargement
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    // Callback Strava
    const params = new URLSearchParams(window.location.search)
    if (params.get('strava_connected') === 'true') {
      setStravaConnected(true)
      toast.success('Strava connecté !')
      window.history.replaceState({}, '', '/running')
      // Sync automatique après connexion (inline pour éviter la dépendance circulaire)
      runningService.syncStrava()
        .then((result) => {
          toast.success(`Sync Strava : ${result.imported} activités importées`)
          if (result.imported > 0) fetchAll()
        })
        .catch(() => toast.error('Erreur lors de la synchronisation Strava'))
    }
  }, [fetchAll])

  const handleStravaConnect = async () => {
    try {
      const { url } = await runningService.getStravaAuthUrl()
      window.location.href = url
    } catch {
      toast.error('Erreur lors de la connexion Strava')
    }
  }

  const handleStravaDisconnect = async () => {
    try {
      await runningService.disconnectStrava()
      setStravaConnected(false)
      toast.success('Strava déconnecté')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const result = await runningService.syncStrava()
      toast.success(`Sync Strava : ${result.imported} activités importées`)
      if (result.imported > 0) await fetchAll()
    } catch {
      toast.error('Erreur lors de la synchronisation Strava')
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await runningService.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Séance supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return {
    sessions,
    stats,
    stravaConnected,
    loading,
    syncing,
    handleStravaConnect,
    handleStravaDisconnect,
    handleSync,
    handleDelete,
    refetch: fetchAll,
  }
}
