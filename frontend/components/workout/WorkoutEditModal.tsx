'use client'

import { workoutsService } from '@/services'
import { Exercise as ExerciseType } from '@/domain/entities/exercise'
import { Workouts } from '@/domain/entities/workout'
import { WorkoutSection } from '@/domain/entities/workout-structure'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ExerciseDrawer } from './ExerciseDrawer'
import { SectionEditor } from './SectionEditor'
import { WorkoutInfoForm } from './WorkoutInfoForm'

interface WorkoutEditModalProps {
  isOpen: boolean
  onClose: () => void
  workout: Workouts
}

export default function WorkoutEditModal({ isOpen, onClose, workout }: WorkoutEditModalProps) {
  const [editedWorkout, setEditedWorkout] = useState<Workouts>(workout)
  const [initialWorkout, setInitialWorkout] = useState<Workouts>(workout)
  const [showExerciseDrawer, setShowExerciseDrawer] = useState(false)
  const [currentSectionIdx, setCurrentSectionIdx] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // Créer une copie profonde du workout quand il change ou quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      const deepCopy = JSON.parse(JSON.stringify(workout)) as Workouts
      setEditedWorkout(deepCopy)
      setInitialWorkout(deepCopy)
    }
  }, [workout, isOpen])

  /**
   * Cette fonction est utilisée lorsque l'utilisateur souhaite ajouter un exercice depuis la bibliothèque.
   * @param {number} sectionIdx - L'index de la section à laquelle l'exercice doit être ajouté.
   */
  const handleAddExerciseFromLibrary = (sectionIdx: number) => {
    setCurrentSectionIdx(sectionIdx)
    setShowExerciseDrawer(true)
  }

  /**
   * Cette fonction est utilisée lorsque l'utilisateur souhaite créer un exercice manuellement.
   * @param {number} sectionIdx - L'index de la section à laquelle l'exercice doit être ajouté.
   */
  const handleAddManualExercise = (sectionIdx: number) => {
    const newWorkout = { ...editedWorkout }
    const section = newWorkout.blocks.sections[sectionIdx]

    if (!section.exercises) {
      section.exercises = []
    }

    // Ajouter un exercice vide
    section.exercises.push({
      name: '',
      reps: undefined,
      sets: undefined,
      weight: undefined,
      details: undefined,
    })

    setEditedWorkout(newWorkout)
  }

  /**
   * Cette fonction est appelée lorsque l'utilisateur sélectionne un exercice dans le menu déroulant.
   * Elle ajoute l'exercice sélectionné à la section actuellement éditée.
   * Si la section actuellement éditée n'a pas d'exercices, un tableau d'exercices est créé.
   * L'exercice est converti en format WorkoutExercise.
   * La fonction met à jour l'état de la section actuellement éditée et ferme le menu déroulant.
   */
  const handleSelectExercise = (exercise: ExerciseType) => {
    if (currentSectionIdx === null) return

    const newWorkout = { ...editedWorkout }
    const section = newWorkout.blocks.sections[currentSectionIdx]

    if (!section.exercises) {
      section.exercises = []
    }

    // Convertir l'exercice en format workout exercise
    section.exercises.push({
      name: exercise.name,
      reps: exercise.measurement_type === 'reps' ? '10' : undefined,
      sets: undefined,
      weight: undefined,
      details: exercise.description || undefined,
    })

    setEditedWorkout(newWorkout)
    setCurrentSectionIdx(null)
  }

  /**
   * Supprime une section de l'entraînement.
   * @param {number} sectionIdx - Index de la section à supprimer.
   */
  const handleDeleteSection = (sectionIdx: number) => {
    const newWorkout = { ...editedWorkout }
    newWorkout.blocks.sections.splice(sectionIdx, 1)
    setEditedWorkout(newWorkout)
  }

  /**
   * Supprime un exercice d'une section de l'entraînement.
   * @param {number} sectionIdx - Index de la section contenant l'exercice à supprimer.
   * @param {number} exerciseIdx - Index de l'exercice à supprimer dans la section.
   */
  const handleDeleteExercise = (sectionIdx: number, exerciseIdx: number) => {
    const newWorkout = { ...editedWorkout }
    const section = newWorkout.blocks.sections[sectionIdx]
    section?.exercises?.splice(exerciseIdx, 1)
    setEditedWorkout(newWorkout)
  }

  /**
   * Met à jour un champ d'une section de l'entraînement.
   *
   * @param {number} sectionIdx - Index de la section à mettre à jour.
   * @param {string} field - Nom du champ à mettre à jour.
   * @param {string | number} value - Valeur du champ à mettre à jour.
   */
  const updateSection = (sectionIdx: number, field: string, value: string | number) => {
    const newWorkout = { ...editedWorkout }
    const section = newWorkout.blocks.sections[sectionIdx]
    // @ts-expect-error because field is a string
    section[field] = value
    setEditedWorkout(newWorkout)
  }

  /**
   * Met à jour un champ d'un exercice d'une section de l'entraînement.
   *
   * @param {number} sectionIdx - Index de la section contenant l'exercice à mettre à jour.
   * @param {number} exerciseIdx - Index de l'exercice à mettre à jour dans la section.
   * @param {string} field - Nom du champ à mettre à jour.
   * @param {string | number} value - Valeur du champ à mettre à jour.
   */
  const updateExercise = (sectionIdx: number, exerciseIdx: number, field: string, value: string | number) => {
    const newWorkout = { ...editedWorkout }
    const exercise = newWorkout.blocks.sections[sectionIdx].exercises?.[exerciseIdx]
    if (exercise) {
      // @ts-expect-error because field is a string
      exercise[field] = value
      setEditedWorkout(newWorkout)
    }
  }

  const handleClose = () => {
    // Restaurer l'état initial
    setEditedWorkout(JSON.parse(JSON.stringify(initialWorkout)) as Workouts)
    onClose()
  }

  const handleSave = async () => {
    if (!editedWorkout) return
    try {
      setLoading(true)

      // Créer un nouveau workout personnalisé basé sur le workout de base
      const payload = {
        ...editedWorkout,
        id: workout.id, // ID du workout de base pour référence
      }
      const response = await workoutsService.createPersonalizedWorkout(payload as any)

      if (response && response.id) {
        toast.success('Workout personnalisé créé avec succès ! Redirection...')
        onClose()

        // Redirection vers le workout personnalisé nouvellement créé
        setTimeout(() => {
          router.push(`/personalized-workout/${response.id}`)
        }, 500)
      } else {
        toast.error('Le workout a été sauvegardé mais aucun ID retourné')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(`Erreur lors de la sauvegarde : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Ajoute une nouvelle section vide au workout.
   */
  const handleAddSection = () => {
    const newSection: WorkoutSection = {
      type: 'strength',
      title: '',
      exercises: [],
    }
    setEditedWorkout({
      ...editedWorkout,
      blocks: {
        ...editedWorkout.blocks,
        sections: [...(editedWorkout.blocks.sections || []), newSection],
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-900 dark:bg-background dark:text-foreground border border-gray-200 dark:border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">Personnaliser ce workout</h2>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
              Modifiez les exercices, ajoutez-en ou supprimez-en selon vos besoins
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-900 dark:text-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workout Info */}
          <WorkoutInfoForm workout={editedWorkout} onChange={setEditedWorkout} />

          {/* Sections */}
          {editedWorkout.blocks.sections?.map((section, sectionIdx) => (
            <SectionEditor
              key={sectionIdx}
              section={section}
              sectionIdx={sectionIdx}
              onUpdateSection={updateSection}
              onDeleteSection={handleDeleteSection}
              onAddManualExercise={handleAddManualExercise}
              onAddExerciseFromLibrary={handleAddExerciseFromLibrary}
              onUpdateExercise={updateExercise}
              onDeleteExercise={handleDeleteExercise}
            />
          ))}

          {/* Add Section Button */}
          <button
            onClick={handleAddSection}
            className="w-full py-3 border-2 border-dashed border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-5 h-5" />
            Ajouter une section
          </button>
        </div>

        {/* Footer - Actions */}
        <div className="border-t border-border px-6 py-4 bg-accent/20">
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Drawer */}
      <ExerciseDrawer
        isOpen={showExerciseDrawer}
        onClose={() => setShowExerciseDrawer(false)}
        onSelectExercise={handleSelectExercise}
      />
    </div>
  )
}
