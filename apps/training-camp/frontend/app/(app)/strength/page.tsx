'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { MUSCLE_LABELS, SESSION_GOAL_LABELS } from '@/services/strength'
import { motion } from 'framer-motion'
import { Activity, Clock, Dumbbell, Plus, RotateCcw, Zap } from 'lucide-react'
import Link from 'next/link'
import { StrengthSessionCard } from './_components/StrengthSessionCard'
import { useStrengthDashboard } from './_hooks/useStrengthDashboard'

export default function StrengthPage() {
  const { sessions, stats, loading, handleDelete } = useStrengthDashboard()

  const topMuscle = stats?.muscle_frequency
    ? Object.entries(stats.muscle_frequency).sort(([, a], [, b]) => b - a)[0]
    : null

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Force</span>
            </h1>
            <p className="text-sm text-slate-400">Séances de musculation adaptées à ton matériel</p>
          </div>
          <Link
            href="/strength/generate"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 transition-colors text-sm font-medium flex-shrink-0"
          >
            <Plus className="w-4 h-4" />Générer une séance
          </Link>
        </motion.div>

        {/* Stats */}
        {!loading && stats && (
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Séances totales',
                value: stats.total_sessions,
                icon: Activity,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10 border-violet-500/20',
              },
              {
                label: 'RPE moyen',
                value: stats.avg_rpe ? `${stats.avg_rpe} / 10` : '--',
                icon: Zap,
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10 border-yellow-500/20',
              },
              {
                label: 'Durée moyenne',
                value: stats.avg_duration ? `${stats.avg_duration} min` : '--',
                icon: Clock,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/20',
              },
              {
                label: 'Muscle le + travaillé',
                value: topMuscle ? MUSCLE_LABELS[topMuscle[0] as keyof typeof MUSCLE_LABELS] ?? topMuscle[0] : '--',
                icon: Dumbbell,
                color: 'text-green-400',
                bg: 'bg-green-500/10 border-green-500/20',
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Séances */}
          <motion.div variants={fadeInUp} className={`space-y-3 ${sessions.length === 0 && !loading ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />Séances récentes
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Aucune séance de force pour l'instant</p>
                <Link
                  href="/strength/generate"
                  className="px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors text-sm"
                >
                  Générer avec l'IA
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <StrengthSessionCard key={session.id} session={session} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Fréquence musculaire */}
          {!loading && stats && Object.keys(stats.muscle_frequency).length > 0 && (
            <motion.div variants={fadeInUp} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-cyan-400" />Fréquence par muscle
              </h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                {Object.entries(stats.muscle_frequency)
                  .sort(([, a], [, b]) => b - a)
                  .map(([muscle, count]) => {
                    const max = Math.max(...Object.values(stats.muscle_frequency))
                    const pct = Math.round((count / max) * 100)
                    return (
                      <div key={muscle}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">
                            {MUSCLE_LABELS[muscle as keyof typeof MUSCLE_LABELS] ?? muscle}
                          </span>
                          <span className="text-slate-500">{count}×</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Légende objectifs */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-300 mb-2">Répartition des objectifs</p>
                <div className="space-y-1.5">
                  {(['strength', 'hypertrophy', 'endurance', 'power'] as const).map((goal) => {
                    const count = sessions.filter((s) => s.session_goal === goal).length
                    if (count === 0) return null
                    return (
                      <div key={goal} className="flex justify-between text-xs">
                        <span className="text-slate-400">{SESSION_GOAL_LABELS[goal]}</span>
                        <span className="text-slate-300 font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
