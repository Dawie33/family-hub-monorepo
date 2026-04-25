'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { trainingProgramsApi, ActiveEnrollment, ProgramSession, WeekSessions } from '@/services/training-programs'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Pause,
  Play,
  Plus,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// --- Helpers ---

const TYPE_LABELS: Record<string, string> = {
  strength_building: 'Force',
  endurance_base: 'Endurance',
  competition_prep: 'Compétition',
  off_season: 'Off-season',
}

const FOCUS_COLOR: Record<string, string> = {
  strength: 'bg-red-500/20 text-red-400 border-red-500/30',
  conditioning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  skill: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mixed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  recovery: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const FOCUS_LABEL: Record<string, string> = {
  strength: 'Force', conditioning: 'Cardio', skill: 'Technique', mixed: 'Mixte', recovery: 'Récup',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  enrolled: { label: 'Inscrit', color: 'text-blue-400' },
  active: { label: 'En cours', color: 'text-green-400' },
  paused: { label: 'En pause', color: 'text-yellow-400' },
}

// --- Composant session de la semaine ---

function WeekSessionCard({ session, num }: { session: ProgramSession; num: number }) {
  const [open, setOpen] = useState(false)
  const movements = [
    ...(session.strength_work?.movements.map(m => m.name) ?? []),
    ...(session.conditioning?.movements.map(m => m.name) ?? []),
    ...(session.skill_work ? [session.skill_work.name] : []),
  ]

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 space-y-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">
              {num}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${FOCUS_COLOR[session.focus] ?? 'bg-slate-500/20 text-slate-400'}`}>
              {FOCUS_LABEL[session.focus] ?? session.focus}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {session.estimated_duration} min
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
          </div>
        </div>
        <p className="font-semibold text-white text-sm">{session.title}</p>
        {!open && movements.length > 0 && (
          <p className="text-xs text-slate-400 truncate">{movements.slice(0, 4).join(' · ')}{movements.length > 4 ? ` +${movements.length - 4}` : ''}</p>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {session.strength_work && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Force</p>
              <div className="space-y-1">
                {session.strength_work.movements.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-white">{m.name}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                      {m.sets}×{m.reps}{m.intensity ? ` — ${m.intensity}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.conditioning && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                Conditioning — {session.conditioning.type.replace('_', ' ').toUpperCase()}
                {session.conditioning.duration_minutes ? ` ${session.conditioning.duration_minutes}min` : ''}
                {session.conditioning.rounds ? ` ${session.conditioning.rounds} rounds` : ''}
              </p>
              <div className="space-y-1">
                {session.conditioning.movements.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-white">{m.name}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                      {m.reps ? `${m.reps} reps` : ''}{m.distance ? m.distance : ''}{m.weight ? ` @ ${m.weight}` : ''}
                    </span>
                  </div>
                ))}
              </div>
              {session.conditioning.scaling_notes && (
                <p className="text-[11px] text-slate-500 mt-1.5 italic">{session.conditioning.scaling_notes}</p>
              )}
            </div>
          )}

          {session.skill_work && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Technique</p>
              <p className="text-xs text-white">{session.skill_work.name}</p>
              <p className="text-xs text-slate-400">{session.skill_work.description}</p>
              {(session.skill_work.sets || session.skill_work.duration) && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {session.skill_work.sets ? `${session.skill_work.sets} séries` : ''}{session.skill_work.duration ? ` · ${session.skill_work.duration}` : ''}
                </p>
              )}
            </div>
          )}

          {session.coach_notes && (
            <p className="text-xs text-slate-500 italic border-t border-white/5 pt-2">{session.coach_notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// --- Page principale ---

export default function TrainingProgramsPage() {
  const [enrollment, setEnrollment] = useState<ActiveEnrollment | null>(null)
  const [weekData, setWeekData] = useState<WeekSessions | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingWeek, setLoadingWeek] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [viewWeek, setViewWeek] = useState<number>(1)

  const fetchEnrollment = useCallback(async () => {
    try {
      const data = await trainingProgramsApi.getActive()
      setEnrollment(data)
      if (data) {
        setViewWeek(data.current_week)
      }
    } catch {
      toast.error('Erreur lors du chargement du programme')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollment()
  }, [fetchEnrollment])

  const fetchWeek = useCallback(async (enrollmentId: string, week: number) => {
    setLoadingWeek(true)
    try {
      const data = await trainingProgramsApi.getWeekSessions(enrollmentId, week)
      setWeekData(data)
    } catch {
      toast.error('Impossible de charger les sessions de cette semaine')
    } finally {
      setLoadingWeek(false)
    }
  }, [])

  useEffect(() => {
    if (enrollment) {
      fetchWeek(enrollment.id, viewWeek)
    }
  }, [enrollment, viewWeek, fetchWeek])

  const handleStart = async () => {
    if (!enrollment) return
    setActionLoading(true)
    try {
      await trainingProgramsApi.start(enrollment.id)
      toast.success('Programme démarré !')
      fetchEnrollment()
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async () => {
    if (!enrollment) return
    setActionLoading(true)
    try {
      await trainingProgramsApi.pause(enrollment.id)
      toast.success('Programme mis en pause')
      fetchEnrollment()
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAbandon = async () => {
    if (!enrollment) return
    if (!confirm('Abandonner ce programme ? Cette action est irréversible.')) return
    setActionLoading(true)
    try {
      await trainingProgramsApi.abandon(enrollment.id)
      toast.success('Programme abandonné')
      setEnrollment(null)
      setWeekData(null)
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  // --- Empty state ---
  if (!loading && !enrollment) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400/20 to-rose-500/20 border border-orange-500/20 flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Aucun programme actif</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Crée un programme structuré adapté à ton objectif — force, endurance, compétition ou objectif libre.
            </p>
          </div>
          <Link
            href="/training-programs/generate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Créer un programme
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    )
  }

  if (!enrollment) return null

  const progressPct = Math.round((enrollment.completed_sessions / enrollment.total_sessions) * 100)

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header programme */}
        <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{enrollment.program_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {TYPE_LABELS[enrollment.program_type] ?? enrollment.program_type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {enrollment.duration_weeks} semaines
                  </span>
                  <span className={`text-xs font-semibold ${STATUS_CONFIG[enrollment.status]?.color ?? 'text-slate-400'}`}>
                    {STATUS_CONFIG[enrollment.status]?.label ?? enrollment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {enrollment.status === 'enrolled' && (
                <button
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5" />Démarrer
                </button>
              )}
              {enrollment.status === 'active' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs font-semibold"
                >
                  <Pause className="w-3.5 h-3.5" />Pause
                </button>
              )}
              {enrollment.status === 'paused' && (
                <button
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5" />Reprendre
                </button>
              )}
              <button
                onClick={handleAbandon}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-semibold"
              >
                <XCircle className="w-3.5 h-3.5" />Abandonner
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progression globale</span>
              <span>{enrollment.completed_sessions} / {enrollment.total_sessions} séances</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Semaine {enrollment.current_week} / {enrollment.duration_weeks}</span>
              <span>{progressPct}%</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation semaine */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Semaine {viewWeek}
                {viewWeek === enrollment.current_week && (
                  <span className="ml-2 text-xs normal-case text-orange-400 font-normal">· semaine en cours</span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewWeek(v => Math.max(1, v - 1))}
                disabled={viewWeek <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 px-2">{viewWeek} / {enrollment.duration_weeks}</span>
              <button
                onClick={() => setViewWeek(v => Math.min(enrollment.duration_weeks, v + 1))}
                disabled={viewWeek >= enrollment.duration_weeks}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingWeek ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            </div>
          ) : weekData ? (
            <div className="space-y-3">
              {weekData.phase && (
                <div className="px-1 mb-2">
                  <p className="text-xs text-slate-500">
                    <span className="text-slate-300 font-medium">Phase {weekData.phase.phase_number} — {weekData.phase.name}</span>
                    {' · '}{weekData.phase.description}
                  </p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {weekData.sessions.map((session, i) => (
                  <WeekSessionCard key={i} session={session} num={i + 1} />
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>

      </div>
    </motion.div>
  )
}
