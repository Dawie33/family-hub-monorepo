'use client'

import { ExerciseDifficulty } from '@/domain/entities/exercise'
import { CreateWorkoutDTO } from '@/domain/entities/workout'
import { WORKOUT_TYPES } from '@/domain/entities/workout-structure'
import { GeneratedWorkout, generatePersonalizedWorkoutWithAI, generateWorkoutWithAI, workoutsService } from '@/services'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function useGenerateWorkout() {
  const router = useRouter()

  // Form state
  const [workoutType, setWorkoutType] = useState<string>(WORKOUT_TYPES.crossfit[0].value)
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('intermediate')
  const [duration, setDuration] = useState(45)
  const [equipment, setEquipment] = useState<string[]>([])
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [personalized, setPersonalized] = useState(true)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Edit state (populated after generation)
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedDifficulty, setEditedDifficulty] = useState<ExerciseDifficulty>('intermediate')
  const [editedDuration, setEditedDuration] = useState(0)
  const [editedIntensity, setEditedIntensity] = useState<'low' | 'moderate' | 'high' | 'very_high'>('moderate')
  const [editedBlocks, setEditedBlocks] = useState('')

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setError(null)

      const workout = personalized
        ? await generatePersonalizedWorkoutWithAI({
            workoutType,
            duration,
            equipment: equipment.length > 0 ? equipment : undefined,
            additionalInstructions: additionalInstructions || undefined,
          })
        : await generateWorkoutWithAI({
            workoutType,
            difficulty,
            duration,
            equipment: equipment.length > 0 ? equipment : undefined,
            additionalInstructions: additionalInstructions || undefined,
          })

      setGeneratedWorkout(workout)
      setEditedName(workout.name)
      setEditedDescription(workout.description)
      setEditedDifficulty(workout.difficulty)
      setEditedDuration(workout.estimated_duration)
      setEditedIntensity(workout.intensity)
      setEditedBlocks(JSON.stringify(workout.blocks, null, 2))
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedWorkout) return

    try {
      setLoading(true)
      setError(null)

      let parsedBlocks
      try {
        parsedBlocks = JSON.parse(editedBlocks)
      } catch {
        setError('Erreur dans le format des blocks')
        return
      }

      const workoutData: CreateWorkoutDTO = {
        name: editedName,
        description: editedDescription,
        workout_type: generatedWorkout.workout_type,
        blocks: parsedBlocks,
        estimated_duration: editedDuration,
        intensity: editedIntensity,
        difficulty: editedDifficulty,
        tags: generatedWorkout.tags,
        status: 'published',
        isActive: true,
        isFeatured: false,
        isPublic: false,
      }

      await workoutsService.create(workoutData)
      toast.success('Workout généré et sauvegardé avec succès !')
      router.push('/workouts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item])
  }

  return {
    // Form
    workoutType, setWorkoutType,
    difficulty, setDifficulty,
    duration, setDuration,
    equipment, setEquipment, toggleEquipment,
    additionalInstructions, setAdditionalInstructions,
    personalized, setPersonalized,
    // UI
    loading, error,
    generatedWorkout,
    isEditing, setIsEditing,
    // Edit fields
    editedName, setEditedName,
    editedDescription, setEditedDescription,
    editedDifficulty, setEditedDifficulty,
    editedDuration, setEditedDuration,
    editedIntensity, setEditedIntensity,
    editedBlocks, setEditedBlocks,
    // Handlers
    handleGenerate,
    handleSave,
  }
}
