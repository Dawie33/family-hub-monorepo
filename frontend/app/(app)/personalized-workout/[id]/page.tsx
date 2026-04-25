'use client'

import dynamic from 'next/dynamic'
import { RichSectionDisplay } from '@/components/workout/display/RichSectionDisplay'
import { WorkoutPrintView, printWorkout } from '@/components/workout/WorkoutPrintView'

const AMRAPTimer = dynamic(() => import('@/app/(app)/timer/timers/AMRAPTimer').then(m => ({ default: m.AMRAPTimer })), { ssr: false })
const EMOMTimer = dynamic(() => import('@/app/(app)/timer/timers/EMOMTimer').then(m => ({ default: m.EMOMTimer })), { ssr: false })
const ForTimeTimer = dynamic(() => import('@/app/(app)/timer/timers/ForTimeTimer').then(m => ({ default: m.ForTimeTimer })), { ssr: false })
const TabataTimer = dynamic(() => import('@/app/(app)/timer/timers/TabataTimer').then(m => ({ default: m.TabataTimer })), { ssr: false })
const ActiveWorkoutSession = dynamic(() => import('@/components/workout/ActiveWorkoutSession').then(m => ({ default: m.ActiveWorkoutSession })), { ssr: false })
import { PersonalizedWorkout } from '@/domain/entities/workout'
import { WorkoutBlocks } from '@/domain/entities/workout-structure'
import { useTimerVibration } from '@/hooks/useTimerVibration'
import { workoutsService, sessionService } from '@/services'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type TimerConfig =
  | { type: 'amrap'; duration: number; label: string }
  | { type: 'for_time'; capMin?: number; label: string }
  | { type: 'emom'; durationMin: number; intervalMin: number; label: string }
  | { type: 'tabata'; rounds?: number; workSeconds: number; restSeconds: number; label: string }

function detectTimerConfigs(blocks: WorkoutBlocks): TimerConfig[] {
  const configs: TimerConfig[] = []

  for (const section of blocks.sections) {
    const formatLower = section.format?.toLowerCase() || ''
    const sectionType = section.type

    if (sectionType === 'amrap' || formatLower.includes('amrap')) {
      if (section.duration_min) {
        configs.push({ type: 'amrap', duration: section.duration_min, label: section.title || `AMRAP ${section.duration_min}'` })
      }
      continue
    }

    if (sectionType === 'emom' || formatLower.includes('emom')) {
      const match = formatLower.match(/e(\d+)mom/)
      const intervalMin = match ? parseInt(match[1]) : 1
      const durationMin = section.duration_min || (section.rounds ? section.rounds * intervalMin : undefined)
      if (durationMin) {
        configs.push({ type: 'emom', durationMin, intervalMin, label: section.title || `EMOM ${durationMin}'` })
      }
      continue
    }

    if (sectionType === 'tabata' || formatLower.includes('tabata')) {
      configs.push({ type: 'tabata', rounds: section.rounds, workSeconds: 20, restSeconds: 10, label: section.title || 'Tabata' })
      continue
    }

    if (sectionType === 'for_time' || formatLower.includes('for time')) {
      configs.push({ type: 'for_time', capMin: section.duration_min, label: section.title || 'For Time' })
      continue
    }

    // Check format on non-timer section types
    if (formatLower.includes('amrap') && section.duration_min) {
      configs.push({ type: 'amrap', duration: section.duration_min, label: section.title || `AMRAP ${section.duration_min}'` })
    } else if (formatLower.includes('emom')) {
      const match2 = formatLower.match(/e(\d+)mom/)
      const interval = match2 ? parseInt(match2[1]) : 1
      const dur = section.duration_min || (section.rounds ? section.rounds * interval : undefined)
      if (dur) configs.push({ type: 'emom', durationMin: dur, intervalMin: interval, label: section.title || `EMOM ${dur}'` })
    } else if (formatLower.includes('tabata')) {
      configs.push({ type: 'tabata', rounds: section.rounds, workSeconds: 20, restSeconds: 10, label: section.title || 'Tabata' })
    } else if (formatLower.includes('for time')) {
      configs.push({ type: 'for_time', capMin: section.duration_min, label: section.title || 'For Time' })
    }
  }

  return configs
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Debutant', color: 'text-emerald-500' },
  intermediate: { label: 'Intermediaire', color: 'text-amber-500' },
  advanced: { label: 'Avance', color: 'text-red-500' },
}

const TIMER_TAB_COLORS: Record<string, { active: string; inactive: string }> = {
  amrap: { active: 'bg-orange-500 text-white', inactive: 'text-orange-400 hover:bg-orange-500/20' },
  for_time: { active: 'bg-blue-500 text-white', inactive: 'text-blue-400 hover:bg-blue-500/20' },
  emom: { active: 'bg-purple-500 text-white', inactive: 'text-purple-400 hover:bg-purple-500/20' },
  tabata: { active: 'bg-green-500 text-white', inactive: 'text-green-400 hover:bg-green-500/20' },
}

function PersonalizedWorkoutDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<PersonalizedWorkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timerElapsed, setTimerElapsed] = useState('0:00')
  const [amrapRounds, setAmrapRounds] = useState(0)
  const [activeTimerIndex, setActiveTimerIndex] = useState(0)
  const vibration = useTimerVibration()

  const isTimerStarted = timerElapsed !== '0:00'

  const handleFinishWorkout = () => {
    vibration.vibrateFinish()
    router.push(`/log-workout?personalizedWorkoutId=${workout?.id}&time=${timerElapsed}`)
  }

  const renderTimer = (config: TimerConfig) => {
    switch (config.type) {
      case 'amrap':
        return <AMRAPTimer duration={config.duration} onTimeUpdate={setTimerElapsed} onRoundsUpdate={setAmrapRounds} soundEnabled={soundEnabled} />
      case 'for_time':
        return <ForTimeTimer capMin={config.capMin} onTimeUpdate={setTimerElapsed} />
      case 'emom':
        return <EMOMTimer durationMin={config.durationMin} intervalMin={config.intervalMin} onTimeUpdate={setTimerElapsed} />
      case 'tabata':
        return <TabataTimer rounds={config.rounds} workSeconds={config.workSeconds} restSeconds={config.restSeconds} onTimeUpdate={setTimerElapsed} />
    }
  }

  useEffect(() => {
    const fetchPersonalizedWorkout = async () => {
      try {
        setLoading(true)
        const response = await workoutsService.getPersonalizedWorkout(params.id as string)
        if (!response) throw new Error('Failed to fetch personalized workout')
        setWorkout(response)
      } catch (error) {
        toast.error(`Failed to fetch personalized workout: ${error}`)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchPersonalizedWorkout()
  }, [params.id])

  const handleStartWorkout = async () => {
    if (!workout) return
    try {
      setIsStarting(true)
      const session = await sessionService.startSession({
        workout_id: workout.id,
        started_at: new Date().toISOString()
      })
      setActiveSession(session.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de démarrer le workout'
      toast.error(errorMessage)
    } finally {
      setIsStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 animate-pulse" />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-medium">Workout personnalisé introuvable</p>
          <Link href="/personalized-workout" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Retour aux workouts personnalisés
          </Link>
        </div>
      </div>
    )
  }

  if (activeSession) {
    return (
      <ActiveWorkoutSession
        workout={workout.plan_json}
        sessionId={activeSession}
        onClose={() => setActiveSession(null)}
      />
    )
  }

  const w = workout.plan_json
  const timerConfigs = w.blocks ? detectTimerConfigs(w.blocks) : []
  const activeConfig = timerConfigs[activeTimerIndex] || null
  const diff = w.difficulty ? difficultyConfig[w.difficulty] : null

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL - Workout Details */}
      <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden order-2 lg:order-1 min-h-0">
        {/* HEADER */}
        <div className="flex-shrink-0 px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 lg:static lg:bg-transparent">
          <div className="flex items-start gap-2 lg:gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white mt-1"
            >
              <span className="text-sm lg:text-base">&larr;</span>
            </button>

            <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
              <div className="w-1.5 lg:w-2 h-8 lg:h-12 bg-orange-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight truncate">{w.name || 'Workout'}</h1>
                <div className="flex items-center gap-2 lg:gap-3 mt-1 lg:mt-2 flex-wrap">
                  <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs lg:text-sm font-semibold">
                    Personnalisé
                  </span>
                  {w.workout_type && (
                    <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs lg:text-sm font-semibold">
                      {w.workout_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {diff && (
                    <span className={`${diff.color} text-xs lg:text-sm`}>
                      {diff.label}
                    </span>
                  )}
                  {w.estimated_duration && (
                    <span className="text-slate-400 text-xs lg:text-sm">
                      Cap: {w.estimated_duration} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 lg:p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'}`}
                title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                <span className="text-xs lg:text-sm font-semibold">{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={printWorkout}
                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs lg:text-sm font-medium text-slate-300"
                title="Exporter en PDF"
              >
                <span>📄</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Stimulus */}
          {w.blocks?.stimulus && (
            <p className="text-slate-300 text-sm lg:text-lg mt-3 lg:mt-4 italic">{w.blocks.stimulus}</p>
          )}

          {/* Description */}
          {w.description && (
            <p className="text-slate-400 text-sm mt-2">{w.description}</p>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 lg:overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* All sections */}
            {w.blocks?.sections.map((section, idx) => (
              <div key={idx}>
                <RichSectionDisplay section={section} />
              </div>
            ))}

            {/* Equipment */}
            {w.equipment_required && w.equipment_required.length > 0 && (
              <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                <strong className="text-white">Équipement : </strong>
                {w.equipment_required.join(', ')}
              </div>
            )}

            {/* Coach notes */}
            {w.coach_notes && (
              <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                <strong className="text-white">Notes du coach : </strong>
                {w.coach_notes}
              </div>
            )}

            {/* Save WOD button */}
            <div className="pt-4 border-t border-slate-700/50">
              <button
                onClick={() => router.push(`/log-workout?personalizedWorkoutId=${workout?.id}&time=${timerElapsed}`)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span>
                Enregistrer le WOD
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - Timer */}
      {timerConfigs.length > 0 ? (
        <div className="w-full lg:w-[450px] bg-slate-950/50 border-t lg:border-t-0 lg:border-l border-slate-700/50 flex flex-col items-center p-4 lg:p-8 backdrop-blur-sm order-1 lg:order-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center space-y-6 w-full flex flex-col flex-1"
          >
            {/* Timer tabs */}
            {timerConfigs.length > 1 && (
              <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
                {timerConfigs.map((config, idx) => {
                  const tabColors = TIMER_TAB_COLORS[config.type] || TIMER_TAB_COLORS.for_time
                  const isActive = idx === activeTimerIndex
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTimerIndex(idx)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${isActive ? tabColors.active : tabColors.inactive}`}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Active timer */}
            <div className="flex-1 flex items-center justify-center">
              {activeConfig && renderTimer(activeConfig)}
            </div>

            {/* Finish Workout Button */}
            {isTimerStarted && (
              <button
                onClick={handleFinishWorkout}
                className="w-full py-3 lg:py-4 bg-green-500 hover:bg-green-600 rounded-xl text-sm lg:text-base font-semibold transition-all shadow-lg shadow-green-500/30 flex items-center justify-center active:scale-95"
              >
                Terminer le WOD
              </button>
            )}

            {!isTimerStarted && (
              <div className="text-slate-500 text-xs lg:text-sm">
                Appuyez sur play pour démarrer
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* No timer - show start button in right panel */
        <div className="w-full lg:w-[450px] bg-slate-950/50 border-t lg:border-t-0 lg:border-l border-slate-700/50 flex flex-col items-center justify-center p-4 lg:p-8 backdrop-blur-sm order-1 lg:order-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center space-y-4 w-full"
          >
            <button
              onClick={handleStartWorkout}
              disabled={isStarting}
              className="w-full py-3 lg:py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-xl text-sm lg:text-base font-semibold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Démarrage...' : 'Commencer le workout'}
            </button>
          </motion.div>
        </div>
      )}

      <WorkoutPrintView workout={workout.plan_json} />
    </div>
  )
}

export default function PersonalizedWorkoutDetailPage() {
  return     <PersonalizedWorkoutDetailContent />
}
