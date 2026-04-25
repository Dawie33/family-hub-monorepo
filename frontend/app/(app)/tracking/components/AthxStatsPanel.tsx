'use client'

import { ATHX_SESSION_TYPE_LABELS, AthxStats } from '@/services/athx'
import Link from 'next/link'

interface AthxStatsPanelProps {
  stats: AthxStats | null
  loading: boolean
}

export function AthxStatsPanel({ stats, loading }: AthxStatsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
      </div>
    )
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">⚡</span>
        <p className="text-slate-400 mb-4">Aucune séance ATHX enregistrée</p>
        <Link
          href="/athx"
          className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
        >
          Créer une séance ATHX
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Séances</p>
          <p className="text-2xl font-bold text-white">{stats.total_sessions}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Temps total</p>
          <p className="text-2xl font-bold text-white">{totalHoursFormatted}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Effort moyen</p>
          <p className="text-2xl font-bold text-purple-400">
            {stats.avg_effort !== null ? `${stats.avg_effort}/10` : '--'}
          </p>
        </div>
      </div>

      {/* Breakdown par type */}
      {Object.keys(stats.type_breakdown).length > 0 && (
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h3 className="font-semibold text-white">Séances par type</h3>
          </div>
          <div className="space-y-2.5">
            {Object.entries(stats.type_breakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const pct = Math.round((count / stats.total_sessions) * 100)
                const label = ATHX_SESSION_TYPE_LABELS[type as keyof typeof ATHX_SESSION_TYPE_LABELS] ?? type
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-36 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
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

      <div className="flex justify-end">
        <Link
          href="/athx"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Voir toutes les séances →
        </Link>
      </div>
    </div>
  )
}
