'use client'

import { InteractiveWorkoutDisplay } from '@/components/workout/display/InteractiveWorkoutDisplay'
import { WorkoutSummary } from '@/components/workout/WorkoutSummary'
import { ExerciseDetailModal } from '@/components/workout/ExerciseDetailModal'
import { Workouts } from '@/domain/entities/workout'
import { motion } from 'framer-motion'
import { Pause, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ActiveWorkoutSessionProps {
  workout: Workouts
  sessionId: string
  onClose: () => void
}

interface BlockProgress {
  [key: string]: boolean
}

/**
 * Composant qui affiche un entraînement de manière interactive.
 * Il permet de cocher une section, de la compléter, de la marquer comme complète.
 * Il permet également de passer automatiquement à la section suivante lorsque tous les exercices sont complétés.
 *
 * @param {WorkoutBlocks} blocks - Les blocs de l'entraînement.
 * @param {(sectionIdx: number, exerciseIdx: number, completed: boolean) => void} [onExerciseComplete] - Fonction à appeler lorsque l'utilisateur coche un exercice.
 */
export function ActiveWorkoutSession({ workout, sessionId, onClose }: ActiveWorkoutSessionProps) {
  const [isRunning, setIsRunning] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [blockProgress, setBlockProgress] = useState<BlockProgress>({})
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null)

  // Timer global
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  /**
   * Formate le temps en heures, minutes et secondes.
   * @param {number} seconds - le nombre de secondes
   * @returns {string} - le format du temps
   */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleComplete = () => {
    // Arrêter le timer
    setIsRunning(false)
    // Afficher la page de résumé
    setShowSummary(true)
  }

  // Si on affiche le résumé, montrer le composant WorkoutSummary
  if (showSummary) {
    return (
      <WorkoutSummary
        workout={workout}
        sessionId={sessionId}
        elapsedTime={elapsedTime}
        blockProgress={blockProgress}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900 z-50 overflow-y-auto">
      {/* Header fixe - style Freeletics */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/5 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Bouton close minimaliste */}
            <motion.button
              onClick={() => setShowCloseModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Fermer"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {/* Timer central - design Freeletics avec cercle */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-1">Time</div>
              <div className="relative">
                <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                  {formatTime(elapsedTime)}
                </div>
                {workout.blocks.duration_min != null && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
                    ~{workout.blocks.duration_min}min
                  </div>
                )}
              </div>
            </div>

            {/* Bouton play/pause avec effet */}
            <motion.button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-full transition-all ${
                isRunning
                  ? 'bg-primary/20 text-primary'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
              aria-label={isRunning ? 'Pause' : 'Reprendre'}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contenu avec espacement mobile optimisé */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-56">
        {/* Afficher le workout avec InteractiveWorkoutDisplay */}
        <InteractiveWorkoutDisplay
          blocks={workout.blocks}
          onSectionComplete={(sectionIdx, completed) => {
            const sectionKey = `section-${sectionIdx}`
            setBlockProgress(prev => ({
              ...prev,
              [sectionKey]: completed
            }))
          }}
          onExerciseClick={(exerciseName) => setSelectedExerciseName(exerciseName)}
        />
      </div>

      {/* Bouton de complétion - FAB style Freeletics */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-6 sm:pb-8 px-4 sm:px-6 flex justify-center">
        <motion.button
          onClick={handleComplete}
          className="w-full max-w-5xl bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl shadow-primary/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Terminer le workout
        </motion.button>
      </div>

      {/* Modale de confirmation d'arrêt */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-3 ">Arrêter le workout ?</h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir arrêter le workout ? Votre progression ne sera pas sauvegardée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium cursor-pointer"
              >
                Continuer
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false)
                  onClose()
                }}
                className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium cursor-pointer"
              >
                Arrêter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de détails d'exercice */}
      {selectedExerciseName && (
        <ExerciseDetailModal
          exerciseName={selectedExerciseName}
          isOpen={!!selectedExerciseName}
          onClose={() => setSelectedExerciseName(null)}
        />
      )}
    </div>
  )
}
