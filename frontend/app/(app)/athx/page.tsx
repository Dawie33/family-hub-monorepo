'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { Clock, Dumbbell, Plus, Target, Zap } from 'lucide-react'
import Link from 'next/link'
import { AthxSessionCard } from './_components/AthxSessionCard'
import { useAthxDashboard } from './_hooks/useAthxDashboard'

export default function AthxPage() {
  const { sessions, stats, loading, handleDelete } = useAthxDashboard()


  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ATHX</span>
            </h1>
            <p className="text-sm text-slate-400">Athletic Fitness — Préparation compétition hybride 2h30</p>
          </div>
          <Link
            href="/athx/generate"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-sm font-medium self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Générer une séance
          </Link>
        </motion.div>

        {/* Stats */}
        {!loading && stats && (
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Séances', value: stats.total_sessions, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { label: 'Heures', value: `${stats.total_hours}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'RPE moyen', value: stats.avg_effort ?? '--', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
              { label: 'Types', value: Object.keys(stats.type_breakdown).length, icon: Dumbbell, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Sessions */}
        <motion.div variants={fadeInUp} className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Séances récentes
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Aucune séance ATHX pour l'instant</p>
              <Link href="/athx/generate" className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">
                Générer avec l'IA
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <AthxSessionCard key={session.id} session={session} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
