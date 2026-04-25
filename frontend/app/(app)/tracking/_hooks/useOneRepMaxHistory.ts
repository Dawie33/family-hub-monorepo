'use client'

import { oneRepMaxesService, OneRepMaxHistoryEntry } from '@/services/one-rep-maxes'
import { useEffect, useState } from 'react'

export function useOneRepMaxHistory() {
  const [history, setHistory] = useState<Record<string, OneRepMaxHistoryEntry[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    oneRepMaxesService
      .getHistory()
      .then(setHistory)
      .catch(() => setHistory({}))
      .finally(() => setLoading(false))
  }, [])

  // Ne garder que les lifts avec au moins 2 entrées (pour tracer une courbe)
  const liftsWithHistory = Object.entries(history).filter(([, entries]) => entries.length >= 1)

  return { liftsWithHistory, loading }
}
