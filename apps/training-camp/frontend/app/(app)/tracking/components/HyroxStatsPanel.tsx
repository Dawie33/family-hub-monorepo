'use client'

import { formatTime, HYROX_STATION_LABELS, HyroxStats } from '@/services/hyrox'
import Link from 'next/link'

interface HyroxStatsPanelProps {
  stats: HyroxStats | null
  loading: boolean
}

export function HyroxStatsPanel({ stats, loading }: HyroxStatsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    )
  }

  if (!stats || stats.total_sessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🏟️</span>
        <p className="text-slate-400 mb-4">Aucune séance HYROX enregistrée</p>
        <Link
          href="/hyrox"
          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
        >
          Créer une séance HYROX
        </Link>
      </div>
    )
  }

  const stationsWithPr = Object.entries(stats.station_prs).filter(([, t]) => t !== null)

  return (
    <div className="space-y-6">
      {/* Chiffres clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Séances</p>
          <p className="text-2xl font-bold text-white">{stats.total_sessions}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Simulations</p>
          <p className="text-2xl font-bold text-white">{stats.total_simulations}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Meilleur temps</p>
          <p className="text-2xl font-bold text-yellow-400">{formatTime(stats.best_time_seconds)}</p>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Temps moyen</p>
          <p className="text-2xl font-bold text-white">{formatTime(stats.avg_time_seconds)}</p>
          <p className="text-xs text-slate-500 mt-0.5">sur simulations</p>
        </div>
      </div>

      {/* PRs par station */}
      {stationsWithPr.length > 0 && (
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏅</span>
            <h3 className="font-semibold text-white">Records par station</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stationsWithPr.map(([station, time]) => (
              <div key={station} className="p-3 bg-white/5 border border-yellow-500/10 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  {HYROX_STATION_LABELS[station as keyof typeof HYROX_STATION_LABELS] ?? station}
                </p>
                <p className="text-lg font-bold text-yellow-400">{formatTime(time)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/hyrox"
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          Voir toutes les séances →
        </Link>
      </div>
    </div>
  )
}
