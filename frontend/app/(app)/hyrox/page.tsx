'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { formatTime } from '@/services/hyrox'
import { motion } from 'framer-motion'
import { Activity, Clock, Plus, Timer, Trophy } from 'lucide-react'
import Link from 'next/link'
import { HyroxSessionCard } from './_components/HyroxSessionCard'
import { StationPRsTable } from './_components/StationPRsTable'
import { useHyroxDashboard } from './_hooks/useHyroxDashboard'

export default function HyroxPage() {
  const { sessions, stats, loading, handleDelete } = useHyroxDashboard()

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">HYROX</span>
            </h1>
            <p className="text-sm text-slate-400">8× (1km run + 1 station) — Préparation et suivi des temps</p>
          </div>
          <Link href="/hyrox/generate"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors text-sm font-medium flex-shrink-0">
            <Plus className="w-4 h-4" />Générer une séance
          </Link>
        </motion.div>

        {/* Stats */}
        {!loading && stats && (
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Séances', value: stats.total_sessions, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Simulations', value: stats.total_simulations, icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
              { label: 'Meilleur temps', value: formatTime(stats.best_time_seconds), icon: Timer, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { label: 'Temps moyen', value: formatTime(stats.avg_time_seconds), icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${color}`} /><span className="text-xs text-slate-400">{label}</span></div>
                <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions */}
          <motion.div variants={fadeInUp} className={`space-y-3 ${sessions.length === 0 && !loading ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />Séances récentes
            </h2>

            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" /></div>
            ) : sessions.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Aucune séance HYROX pour l'instant</p>
                <Link href="/hyrox/generate" className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm">
                  Générer avec l'IA
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <HyroxSessionCard key={session.id} session={session} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </motion.div>

          {/* PRs par station */}
          {!loading && stats && (
            <motion.div variants={fadeInUp}>
              <StationPRsTable stats={stats} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
