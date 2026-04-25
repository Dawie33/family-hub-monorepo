'use client'

import { ParseBoxWodModal } from '@/components/calendar/ParseBoxWodModal'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import {
  Activity,
  BookOpen,
  Dumbbell,
  Flame,
  Instagram,
  PenLine,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatResult, useCrossfitDashboard } from './_hooks/useCrossfitDashboard'

type ParseMode = 'instagram' | 'search'

const LINK_ACTIONS: { href: string; label: string; description: string; icon: React.ElementType; color: string; shadow: string }[] = [
  {
    href: '/crossfit/log-workout',
    label: 'Enregistrer un WOD',
    description: 'Loguer une séance réalisée',
    icon: PenLine,
    color: 'from-orange-500 to-rose-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    href: '/workouts/new',
    label: 'Créer un WOD',
    description: 'Nouveau workout manuellement',
    icon: Plus,
    color: 'from-sky-500 to-blue-500',
    shadow: 'shadow-sky-500/20',
  },
  {
    href: '/workouts/generate-ai',
    label: 'Générer avec IA',
    description: 'Créer un WOD personnalisé',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
  },
  {
    href: '/crossfit/workouts',
    label: 'Bibliothèque',
    description: 'Parcourir les workouts',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/20',
  },
  {
    href: '/crossfit/skills',
    label: 'Progressions',
    description: 'Mouvements techniques',
    icon: Flame,
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
  },
]

const IMPORT_ACTIONS: { mode: ParseMode; label: string; description: string; icon: React.ElementType; color: string; shadow: string }[] = [
  {
    mode: 'instagram',
    label: 'Coller depuis Instagram',
    description: 'Importer le WOD de ta box',
    icon: Instagram,
    color: 'from-cyan-500 to-sky-500',
    shadow: 'shadow-cyan-500/20',
  },
  {
    mode: 'search',
    label: 'Rechercher un WOD',
    description: 'Benchmark, Open, Hero WOD...',
    icon: Search,
    color: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/20',
  },
]

export default function CrossFitPage() {
  const { sessions, loading } = useCrossfitDashboard()
  const [parseModalOpen, setParseModalOpen] = useState(false)
  const [parseModalMode, setParseModalMode] = useState<ParseMode>('instagram')

  const openParseModal = (mode: ParseMode) => {
    setParseModalMode(mode)
    setParseModalOpen(true)
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">CrossFit</span>
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">WODs, progressions techniques et suivi</p>
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {LINK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group relative bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:shadow-lg ${action.shadow}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Importer un WOD */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Importer un WOD</h2>
          <div className="grid grid-cols-2 gap-3">
            {IMPORT_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.mode}
                  onClick={() => openParseModal(action.mode)}
                  className={`group relative bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:shadow-lg ${action.shadow} text-left`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Séances récentes */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Séances récentes</h2>
            <Link href="/tracking" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Aucune séance enregistrée</p>
              <Link
                href="/log-workout"
                className="inline-flex px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
              >
                Enregistrer mon premier WOD
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const date = session.completed_at
                  ? new Date(session.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  : '—'
                const name = session.workout_name ?? 'WOD sans nom'
                const score = formatResult(session.results)
                const rating = session.results?.rating

                return (
                  <div key={session.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/8 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{name}</p>
                      <p className="text-xs text-slate-500">{date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono font-bold text-orange-400">{score}</p>
                      {rating && (
                        <p className="text-xs text-slate-500">{'★'.repeat(rating)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>

      <ParseBoxWodModal
        open={parseModalOpen}
        onOpenChange={setParseModalOpen}
        initialMode={parseModalMode}
      />
    </motion.div>
  )
}
