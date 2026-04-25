'use client'

import { formatDuration, formatPace, RunningStats, RUN_TYPE_LABELS } from '@/services/running'
import Link from 'next/link'

interface RunningStatsPanelProps {
  stats: RunningStats | null
  loading: boolean
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function RunningStatsPanel({ stats, loading }: RunningStatsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" />
      </div>
    )
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🏃</span>
        <p className="text-slate-400 mb-4">Aucune séance running enregistrée</p>
        <Link
          href="/running"
          className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
        >
          Créer une séance Running
        </Link>
      </div>
    )
  }

  const totalHoursFormatted = stats.total_hours >= 1
    ? `${Math.floor(stats.total_hours)}h${Math.round((stats.total_hours % 1) * 60).toString().padStart(2, '0')}`
    : `${Math.round(stats.total_hours * 60)}min`

  return (
    <div className="space-y-6">
      {/* Chiffres clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Séances" value={String(stats.total_sessions)} />
        <StatCard label="Distance totale" value={`${stats.total_km} km`} />
        <StatCard label="Temps total" value={totalHoursFormatted} />
        <StatCard
          label="Allure moyenne"
          value={formatPace(stats.avg_pace_seconds_per_km)}
          sub="min/km"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plus longue sortie */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏅</span>
            <h3 className="font-semibold text-white">Record de distance</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.longest_run_km} km</p>
          <p className="text-xs text-slate-500 mt-1">Plus longue sortie</p>
        </div>

        {/* Breakdown par type */}
        {Object.keys(stats.type_breakdown).length > 0 && (
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h3 className="font-semibold text-white">Sorties par type</h3>
            </div>
            <div className="space-y-2.5">
              {Object.entries(stats.type_breakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const pct = Math.round((count / stats.total_sessions) * 100)
                  const label = RUN_TYPE_LABELS[type as keyof typeof RUN_TYPE_LABELS] ?? type
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 w-28 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/running"
          className="text-xs text-green-400 hover:text-green-300 transition-colors"
        >
          Voir toutes les séances →
        </Link>
      </div>
    </div>
  )
}
