'use client'

import dynamic from 'next/dynamic'
import { RichSectionDisplay } from '@/components/workout/display/RichSectionDisplay'
import { WorkoutPrintView, printWorkout } from '@/components/workout/WorkoutPrintView'

const AMRAPTimer = dynamic(() => import('@/app/(app)/timer/timers/AMRAPTimer').then(m => ({ default: m.AMRAPTimer })), { ssr: false })
const EMOMTimer = dynamic(() => import('@/app/(app)/timer/timers/EMOMTimer').then(m => ({ default: m.EMOMTimer })), { ssr: false })
const ForTimeTimer = dynamic(() => import('@/app/(app)/timer/timers/ForTimeTimer').then(m => ({ default: m.ForTimeTimer })), { ssr: false })
const TabataTimer = dynamic(() => import('@/app/(app)/timer/timers/TabataTimer').then(m => ({ default: m.TabataTimer })), { ssr: false })
const WorkoutEditModal = dynamic(() => import('@/components/workout/WorkoutEditModal'), { ssr: false })
import { Workouts } from '@/domain/entities/workout'
import { WorkoutBlocks } from '@/domain/entities/workout-structure'
import { useTimerVibration } from '@/hooks/useTimerVibration'
import { workoutsService } from '@/services'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

    // AMRAP
    if (sectionType === 'amrap' || formatLower.includes('amrap')) {
      if (section.duration_min) {
        configs.push({
          type: 'amrap',
          duration: section.duration_min,
          label: section.title || `AMRAP ${section.duration_min}'`,
        })
      }
      continue
    }

    // EMOM — handles EMOM, E2MOM, E3MOM, etc.
    if (sectionType === 'emom' || formatLower.includes('emom') || /e\d+mom/.test(formatLower)) {
      const match = formatLower.match(/e(\d+)mom/)
      const intervalMin = match ? parseInt(match[1]) : 1
      // rounds is authoritative when set (e.g. E2MOM × 6 rounds = 12 min, not duration_min which may be wrong)
      const durationMin = section.rounds ? section.rounds * intervalMin : section.duration_min
      if (durationMin) {
        configs.push({
          type: 'emom',
          durationMin,
          intervalMin,
          label: section.title || `EMOM ${durationMin}'`,
        })
      }
      continue
    }

    // Tabata
    if (sectionType === 'tabata' || formatLower.includes('tabata')) {
      configs.push({
        type: 'tabata',
        rounds: section.rounds,
        workSeconds: 20,
        restSeconds: 10,
        label: section.title || 'Tabata',
      })
      continue
    }

    // For Time
    if (sectionType === 'for_time' || formatLower.includes('for time')) {
      configs.push({
        type: 'for_time',
        capMin: section.duration_min,
        label: section.title || 'For Time',
      })
      continue
    }

    // Check format on non-timer section types (e.g. skill_work with format EMOM)
    if (formatLower.includes('amrap') && section.duration_min) {
      configs.push({ type: 'amrap', duration: section.duration_min, label: section.title || `AMRAP ${section.duration_min}'` })
    } else if (formatLower.includes('emom') || /e\d+mom/.test(formatLower)) {
      const match2 = formatLower.match(/e(\d+)mom/)
      const interval = match2 ? parseInt(match2[1]) : 1
      const dur = section.rounds ? section.rounds * interval : section.duration_min
      if (dur) {
        configs.push({ type: 'emom', durationMin: dur, intervalMin: interval, label: section.title || `EMOM ${dur}'` })
      }
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

function WorkoutDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workouts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false)
  const [workoutVersion, setWorkoutVersion] = useState<'RX' | 'SCALED'>('RX')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timerElapsed, setTimerElapsed] = useState('0:00')
  const [amrapRounds, setAmrapRounds] = useState(0)
  const [activeTimerIndex, setActiveTimerIndex] = useState(0)
  const vibration = useTimerVibration()

  const isTimerStarted = timerElapsed !== '0:00'

  const handleFinishWorkout = () => {
    vibration.vibrateFinish()
    router.push(`/log-workout?workoutId=${workout?.id}&time=${timerElapsed}&version=${workoutVersion}`)
  }

  const renderTimer = (config: TimerConfig) => {
    switch (config.type) {
      case 'amrap':
        return (
          <AMRAPTimer
            duration={config.duration}
            onTimeUpdate={setTimerElapsed}
            onRoundsUpdate={setAmrapRounds}
            soundEnabled={soundEnabled}
          />
        )
      case 'for_time':
        return <ForTimeTimer capMin={config.capMin} onTimeUpdate={setTimerElapsed} />
      case 'emom':
        return <EMOMTimer durationMin={config.durationMin} intervalMin={config.intervalMin} onTimeUpdate={setTimerElapsed} />
      case 'tabata':
        return <TabataTimer rounds={config.rounds} workSeconds={config.workSeconds} restSeconds={config.restSeconds} onTimeUpdate={setTimerElapsed} />
    }
  }

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!params.id) return
      try {
        setLoading(true)
        const data = await workoutsService.getById(params.id as string)
        setWorkout(data)
      } catch (err) {
        console.error('Error fetching workout:', err)
        setError('Impossible de charger le workout')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkout()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 animate-pulse">
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-medium">{error || 'Workout non trouve'}</p>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const timerConfigs = detectTimerConfigs(workout.blocks)
  const activeConfig = timerConfigs[activeTimerIndex] || null
  const diff = workout.difficulty ? difficultyConfig[workout.difficulty] : null

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL - Workout Details */}
      <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden order-2 lg:order-1 min-h-0">
        {/* HEADER avec barre verticale orange */}
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
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight truncate">{workout.name || 'Workout'}</h1>
                <div className="flex items-center gap-2 lg:gap-3 mt-1 lg:mt-2 flex-wrap">
                  {workout.workout_type && (
                    <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs lg:text-sm font-semibold">
                      {workout.workout_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {diff && (
                    <span className={`${diff.color} text-xs lg:text-sm`}>
                      {diff.label}
                    </span>
                  )}
                  {workout.estimated_duration && (
                    <span className="text-slate-400 text-xs lg:text-sm">
                      Cap: {workout.estimated_duration} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 lg:gap-2">
              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 lg:p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'
                  }`}
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

              {!workout.is_benchmark && (
                <button
                  onClick={() => setShowEditWorkoutModal(true)}
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs lg:text-sm font-medium text-slate-300"
                >
                  <span>Éditer</span>
                </button>
              )}
            </div>
          </div>

          {/* Stimulus sous le titre */}
          {workout.blocks.stimulus && (
            <p className="text-slate-300 text-sm lg:text-lg mt-3 lg:mt-4 italic">{workout.blocks.stimulus}</p>
          )}

          {/* RX/Scaled tabs */}
          {workout.scaling_options && workout.scaling_options.length > 0 && (
            <div className="flex gap-2 mt-4 lg:mt-6">
              <button
                onClick={() => setWorkoutVersion('RX')}
                className={`flex-1 py-2.5 lg:py-3 px-4 lg:px-6 rounded-xl text-sm lg:text-base font-semibold transition-all ${workoutVersion === 'RX'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
              >
                RX
              </button>
              <button
                onClick={() => setWorkoutVersion('SCALED')}
                className={`flex-1 py-2.5 lg:py-3 px-4 lg:px-6 rounded-xl text-sm lg:text-base font-semibold transition-all ${workoutVersion === 'SCALED'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
              >
                SCALED
              </button>
            </div>
          )}
        </div>

        {/* MAIN CONTENT - Scrollable workout details */}
        <div className="flex-1 lg:overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Scaling Options (when SCALED is selected) */}
            {workoutVersion === 'SCALED' && workout.scaling_options && workout.scaling_options.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <h3 className="font-semibold text-amber-400 mb-2">
                  Options Scaled
                </h3>
                <ul className="space-y-1 text-amber-300">
                  {workout.scaling_options.map((option, idx) => (
                    <li key={idx}>• {option}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* All sections */}
            {workout.blocks.sections.map((section, idx) => (
              <div key={idx}>
                <RichSectionDisplay section={section} />
              </div>
            ))}

            {/* Equipment */}
            {workout.equipment_required && workout.equipment_required.length > 0 && (
              <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                <strong className="text-white">Équipement : </strong>
                {workout.equipment_required.join(', ')}
              </div>
            )}

            {/* Save WOD button */}
            <div className="pt-4 border-t border-slate-700/50">
              <button
                onClick={() => router.push(`/log-workout?workoutId=${workout?.id}&time=${timerElapsed}&version=${workoutVersion}`)}
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
      {timerConfigs.length > 0 && (
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
                      className={`flex-1 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${isActive ? tabColors.active : tabColors.inactive
                        }`}
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
      )}

      {/* Modals */}
      {showEditWorkoutModal && (
        <WorkoutEditModal
          workout={workout}
          isOpen={showEditWorkoutModal}
          onClose={() => setShowEditWorkoutModal(false)}
        />
      )}

      <WorkoutPrintView workout={workout} />
    </div>
  )
}

export default function WorkoutDetailPage() {
  return     <WorkoutDetailContent />
}
