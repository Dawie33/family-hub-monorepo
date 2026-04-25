'use client'

import { formatPace, RunningStats } from '@/services/running'
import { Activity, Clock, Gauge, TrendingUp } from 'lucide-react'

interface Props {
  stats: RunningStats
}

export function RunningStatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total km',
      value: `${stats.total_km} km`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Séances',
      value: stats.total_sessions,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Allure moyenne',
      value: formatPace(stats.avg_pace_seconds_per_km),
      icon: Gauge,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
    },
    {
      label: 'Temps total',
      value: `${stats.total_hours}h`,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`rounded-xl border p-4 ${bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
