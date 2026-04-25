'use client'

import { Exercise } from '@/domain/entities/workout-structure'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DetailedExerciseDisplay } from './DetailedExerciseDisplay'

interface ExerciseSliderProps {
  exercises: Exercise[]
  rounds?: number
  onExerciseClick?: (exerciseId: string) => void
  onAllExercisesCompleted?: () => void
}

/**
 * Composant qui affiche les exercices un par un avec navigation slider
 */
export function ExerciseSlider({ exercises, rounds, onAllExercisesCompleted }: ExerciseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({})
  const [direction, setDirection] = useState(0) // 1 pour suivant, -1 pour précédent
  const [currentRound, setCurrentRound] = useState(1) // Round actuel
  const [showRoundTransition, setShowRoundTransition] = useState(false) // Afficher la transition entre rounds
  const [isTransitioning, setIsTransitioning] = useState(false) // Flag pour éviter les transitions multiples
  const totalRounds = rounds || 1

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const completeCurrentExercise = () => {
    const isAlreadyCompleted = completedExercises[currentIndex]

    // Si déjà complété, on décoche pour permettre de refaire
    if (isAlreadyCompleted) {
      setCompletedExercises(prev => ({
        ...prev,
        [currentIndex]: false
      }))
      return
    }

    // Marquer l'exercice actuel comme complété
    setCompletedExercises(prev => ({
      ...prev,
      [currentIndex]: true
    }))

    // Attendre un peu pour l'animation, puis passer au suivant
    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setDirection(1)
        setCurrentIndex(prev => prev + 1)
      }
    }, 300)
  }

  const toggleExercise = () => {
    setCompletedExercises(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }))
  }

  // Vérifier si tous les exercices du round sont complétés
  useEffect(() => {
    const allCompleted = exercises.every((_, idx) => completedExercises[idx])
    if (allCompleted && exercises.length > 0 && !isTransitioning) {
      // Si c'est le dernier round, terminer la section
      if (currentRound >= totalRounds) {
        setIsTransitioning(true)
        setTimeout(() => {
          onAllExercisesCompleted?.()
        }, 500)
      } else {
        // Sinon, afficher la transition puis passer au round suivant
        setIsTransitioning(true)
        setShowRoundTransition(true)
        setTimeout(() => {
          setCurrentRound(prev => prev + 1)
          setCurrentIndex(0)
          setCompletedExercises({})
          setDirection(1)
          setShowRoundTransition(false)
          setIsTransitioning(false)
        }, 2000)
      }
    }
  }, [completedExercises, exercises, onAllExercisesCompleted, currentRound, totalRounds, isTransitioning])

  const currentExercise = exercises[currentIndex]

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  return (
    <div className="space-y-4">
      {/* Indicateur de progression */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-3">
          {totalRounds > 1 && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              Round {currentRound}/{totalRounds}
            </span>
          )}
          <span>Exercice {currentIndex + 1} / {exercises.length}</span>
        </div>
        <div className="flex gap-1">
          {exercises.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex
                ? 'w-6 bg-primary'
                : completedExercises[idx]
                  ? 'w-1.5 bg-primary/50'
                  : 'w-1.5 bg-muted'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Container du slider */}
      <div className="relative overflow-hidden">
        {showRoundTransition ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="text-6xl font-bold text-primary">
              Round {currentRound} Terminé!
            </div>
            <div className="text-2xl text-muted-foreground">
              Préparation du Round {currentRound + 1}...
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <DetailedExerciseDisplay
                exercise={currentExercise}
                isCompleted={completedExercises[currentIndex] || false}
                onToggle={toggleExercise}
                rounds={rounds}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Boutons de navigation - Centrés et compacts */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium hidden sm:inline">Précédent</span>
        </button>

        <button
          onClick={completeCurrentExercise}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg transition-all font-medium text-sm ${completedExercises[currentIndex]
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
        >
          <Check className="w-6 h-4" />
          <span>{completedExercises[currentIndex] ? 'Terminé ✓' : 'Terminer'}</span>
        </button>
      </div>

      {/* Stats des exercices complétés */}
      <div className="text-center text-sm text-muted-foreground">
        {Object.values(completedExercises).filter(Boolean).length} / {exercises.length} exercices complétés
      </div>
    </div>
  )
}
