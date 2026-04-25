'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { Activity, Plus, RefreshCw, Unlink } from 'lucide-react'
import Link from 'next/link'
import { RunningSessionCard } from './_components/RunningSessionCard'
import { RunningStatsCards } from './_components/RunningStatsCards'
import { useRunningDashboard } from './_hooks/useRunningDashboard'

// Logo Strava SVG inline
function StravaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.172" />
    </svg>
  )
}

export default function RunningPage() {
  const {
    sessions,
    stats,
    stravaConnected,
    loading,
    syncing,
    handleStravaConnect,
    handleStravaDisconnect,
    handleSync,
    handleDelete,
  } = useRunningDashboard()

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Running</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Suivi de tes sorties et génération de séances IA</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Boutons Strava */}
            {stravaConnected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-colors text-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sync...' : 'Sync Strava'}
                </button>
                <button
                  onClick={handleStravaDisconnect}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm"
                >
                  <Unlink className="w-4 h-4" />
                  Déconnecter
                </button>
              </>
            ) : (
              <button
                onClick={handleStravaConnect}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-sm font-medium"
              >
                <StravaIcon className="w-4 h-4" />
                Connecter Strava
              </button>
            )}

            {/* Générer une séance */}
            <Link
              href="/running/generate"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Générer une séance
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        {!loading && stats && (
          <motion.div variants={fadeInUp}>
            <RunningStatsCards stats={stats} />
          </motion.div>
        )}

        {/* Sessions */}
        <motion.div variants={fadeInUp} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Séances récentes
            </h2>
            {!stravaConnected && (
              <p className="text-xs text-slate-500">
                Connecte Strava pour importer automatiquement tes sorties
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Aucune séance running pour l'instant</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link
                  href="/running/generate"
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  Générer avec l'IA
                </Link>
                {!stravaConnected && (
                  <button
                    onClick={handleStravaConnect}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                  >
                    Importer depuis Strava
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <RunningSessionCard key={session.id} session={session} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
