import { athxService, AthxStats } from '@/services/athx'
import { hyroxService, HyroxStats } from '@/services/hyrox'
import { runningService, RunningStats } from '@/services/running'
import { useEffect, useState } from 'react'

interface MultiSportStats {
  running: RunningStats | null
  hyrox: HyroxStats | null
  athx: AthxStats | null
}

export function useMultiSportStats() {
  const [stats, setStats] = useState<MultiSportStats>({ running: null, hyrox: null, athx: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      runningService.getStats(),
      hyroxService.getStats(),
      athxService.getStats(),
    ]).then(([runningResult, hyroxResult, athxResult]) => {
      setStats({
        running: runningResult.status === 'fulfilled' ? runningResult.value : null,
        hyrox: hyroxResult.status === 'fulfilled' ? hyroxResult.value : null,
        athx: athxResult.status === 'fulfilled' ? athxResult.value : null,
      })
    }).finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
