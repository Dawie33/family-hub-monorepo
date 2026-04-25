'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { WorkoutProgress } from '../hooks/useWorkoutProgress'

interface WorkoutProgressComparisonProps {
  progressData: WorkoutProgress[]
  loading: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h${remainingMins > 0 ? `${remainingMins}m` : ''}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

function TrendIndicator({ trend, percent }: { trend: 'improving' | 'declining' | 'stable'; percent: number }) {
  if (trend === 'improving') {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
        <span className="text-xs">▲</span> +{Math.abs(percent)}%
      </span>
    )
  }
  if (trend === 'declining') {
    return (
      <span className="flex items-center gap-1 text-red-400 text-sm font-semibold">
        <span className="text-xs">▼</span> -{Math.abs(percent)}%
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-slate-400 text-sm font-semibold">
      = Stable
    </span>
  )
}

function MiniProgressBar({ sessions, isRounds }: { sessions: WorkoutProgress['sessions']; isRounds: boolean }) {
  const values = isRounds
    ? sessions.map(s => s.rounds || 0)
    : sessions.map(s => s.elapsedSeconds)

  const maxVal = Math.max(...values, 1)
  // Pour les temps, on inverse la logique (plus petit = mieux)
  const displayValues = isRounds ? values : values

  return (
    <div className="flex items-end gap-1 h-12">
      {displayValues.map((val, idx) => {
        const heightPercent = (val / maxVal) * 100
        const isLast = idx === displayValues.length - 1
        const isBest = isRounds
          ? val === Math.max(...values)
          : val === Math.min(...values.filter(v => v > 0))

        return (
          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t transition-all ${
                isBest
                  ? 'bg-orange-400'
                  : isLast
                    ? 'bg-orange-400/60'
                    : 'bg-slate-600'
              }`}
              style={{ height: `${Math.max(heightPercent, 8)}%` }}
              title={`${formatDate(sessions[idx].date)}: ${isRounds ? `${val} rounds` : formatTime(val)}`}
            />
            <span className="text-[9px] text-slate-500 truncate w-full text-center">
              {formatDate(sessions[idx].date)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function WorkoutProgressCard({ progress }: { progress: WorkoutProgress }) {
  const hasRounds = progress.bestRounds !== undefined && progress.bestRounds > 0
  const isAmrap = progress.workoutType?.toLowerCase().includes('amrap') || hasRounds

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 bg-orange-500 rounded-full flex-shrink-0" />
            <h3 className="font-bold text-white truncate">{progress.workoutName}</h3>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {progress.workoutType && (
              <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 rounded text-xs font-medium">
                {progress.workoutType.replace(/_/g, ' ')}
              </span>
            )}
            <span className="text-xs text-slate-500">
              {progress.sessionCount} session{progress.sessionCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <TrendIndicator trend={progress.trend} percent={progress.improvementPercent} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Best */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Meilleur</p>
          {isAmrap && progress.bestRounds ? (
            <p className="text-lg font-bold text-orange-400">{progress.bestRounds} <span className="text-xs text-slate-400 font-normal">rounds</span></p>
          ) : (
            <p className="text-lg font-bold text-orange-400 font-mono">{formatTime(progress.bestTime)}</p>
          )}
        </div>
        {/* Last */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Dernier</p>
          {isAmrap && progress.lastRounds ? (
            <p className="text-lg font-bold text-white">{progress.lastRounds} <span className="text-xs text-slate-400 font-normal">rounds</span></p>
          ) : (
            <p className="text-lg font-bold text-white font-mono">{formatTime(progress.lastTime)}</p>
          )}
        </div>
      </div>

      {/* Mini progress chart */}
      {progress.sessions.length > 1 && (
        <MiniProgressBar sessions={progress.sessions} isRounds={isAmrap} />
      )}
    </div>
  )
}

export function WorkoutProgressComparison({ progressData, loading }: WorkoutProgressComparisonProps) {
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Comparaison WOD</h2>
        <div className="flex items-center gap-3 py-3">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-600 animate-pulse shrink-0" />
          <p className="text-slate-400 text-sm">Chargement des progressions...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚡</span>
        <div>
          <h2 className="text-2xl font-bold text-white">Comparaison WOD</h2>
          <p className="text-sm text-slate-400">Compare tes performances sur les mêmes workouts</p>
        </div>
      </div>

      {progressData.length === 0 ? (
        <div className="flex items-center gap-4 py-4 px-5 bg-slate-800/30 border border-slate-700/30 rounded-xl text-left">
          <span className="text-2xl shrink-0">📊</span>
          <div>
            <p className="text-slate-300 font-medium text-sm">Pas encore de comparaison disponible</p>
            <p className="text-xs text-slate-500 mt-0.5">Fais le même WOD au moins 2 fois pour voir ta progression</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressData.map((progress) => (
            <WorkoutProgressCard key={progress.workoutId} progress={progress} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
