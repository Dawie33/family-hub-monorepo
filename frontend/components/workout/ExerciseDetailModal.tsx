'use client'

import { Equipment } from '@/domain/entities/equipment'
import { Exercise } from '@/domain/entities/exercise'
import { getEquipment } from '@/services/equipments'
import { getExercises } from '@/services/exercises'
import { motion } from 'framer-motion'
import { AlertCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ExerciseBadges } from './ExerciseDetailModal/ExerciseBadges'
import { ExerciseImage } from './ExerciseDetailModal/ExerciseImage'
import { ExerciseVideo } from './ExerciseDetailModal/ExerciseVideo'
import { EquipmentList } from './ExerciseDetailModal/EquipmentList'

interface ExerciseDetailModalProps {
  exerciseName: string
  isOpen: boolean
  onClose: () => void
}

export function ExerciseDetailModal({ exerciseName, isOpen, onClose }: ExerciseDetailModalProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !exerciseName) {
      return
    }

    const fetchExerciseDetails = async () => {
      console.log(exerciseName)
      try {
        setLoading(true)

        const { rows: exerciseData } = await getExercises({ search: exerciseName })
        const foundExercise = exerciseData?.[0]
        setExercise(foundExercise)

        if (foundExercise?.equipment_required && Array.isArray(foundExercise.equipment_required)) {
          const equipmentPromises = foundExercise.equipment_required.map(id => getEquipment(id))
          const equipmentData = await Promise.all(equipmentPromises)
          setEquipments(equipmentData)
        }
      } catch (err) {
        toast.error(`Une erreur est survenue lors de la recherche de l'exercice: ${err}')}`)
      } finally {
        setLoading(false)
      }
    }

    fetchExerciseDetails()
  }, [exerciseName, isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full sm:hidden" />

          <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-0">Détails de l'exercice</h2>
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors mt-4 sm:mt-0"
            aria-label="Fermer"
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && exercise && (
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-3">{exercise.name}</h3>
                <ExerciseBadges exercise={exercise} />
              </div>

              <ExerciseImage imageUrl={exercise.image_url} alt={exercise.name} />

              {exercise.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-lg">Description</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>
                </div>
              )}

              {exercise.instructions && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-lg">Instructions</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{exercise.instructions}</p>
                </div>
              )}

              {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Groupes musculaires</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscle_groups.map((muscle, idx) => (
                      <span key={idx} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <EquipmentList equipments={equipments} />

              <ExerciseVideo videoUrl={exercise.video_url} title={exercise.name} />

              {exercise.safety_notes && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-500 mb-1">Notes de sécurité</h4>
                      <p className="text-sm text-muted-foreground">{exercise.safety_notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {!exercise && !loading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Aucun exercice trouvé</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-border bg-background/80 backdrop-blur-sm">
          <motion.button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            Fermer
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
