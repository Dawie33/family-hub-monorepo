'use client'

import { formatTime, HYROX_STATION_DISTANCES, HYROX_STATION_LABELS, HYROX_STATIONS, HyroxStats } from '@/services/hyrox'

export function StationPRsTable({ stats }: { stats: HyroxStats }) {
  const hasPRs = HYROX_STATIONS.some((s) => stats.station_prs[s] !== null)
  if (!hasPRs) return null

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-slate-300">PRs par station</h3>
      </div>
      <div className="divide-y divide-white/5">
        {HYROX_STATIONS.map((station) => {
          const pr = stats.station_prs[station]
          return (
            <div key={station} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm text-white">{HYROX_STATION_LABELS[station]}</p>
                <p className="text-[10px] text-slate-500">{HYROX_STATION_DISTANCES[station]}</p>
              </div>
              <span className={`text-sm font-mono font-bold ${pr ? 'text-yellow-400' : 'text-slate-600'}`}>
                {pr ? formatTime(pr) : '--'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
