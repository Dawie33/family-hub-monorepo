import { workoutsApi, generateWorkoutWithAI } from '@/services/workouts'
import type { CreateWorkoutDTO, Workouts } from '@/domain/entities/workout'
import type { WorkoutFormFields } from '../types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AIParams {
  date: string
  duration_min: number
  intensity: string
  difficulty: string
  workout_type: string
  tags: string
}

const generateAutoName = () => {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  return `Workout ${dd}/${mm}/${yyyy}`
}

/**
* Géneration de l'état et la soumission du formulaire d'entraînement.
*
* @param {string} id - ID de l'entraînement
* @param {boolean} isNewMode - Création ou modification d'un entraînement
* @returns {object} - Objet contenant l'état et les fonctions de gestion du formulaire
 */
export function useWorkoutForm(id: string, isNewMode: boolean) {
  const router = useRouter()
  const [loading, setLoading] = useState(!isNewMode)
  const [saving, setSaving] = useState(false)
  const [workout, setWorkout] = useState<Workouts | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)

  const [formData, setFormData] = useState<WorkoutFormFields>({
    name: isNewMode ? generateAutoName() : '',
    description: '',
    workout_type: '',
    difficulty: 'intermediate',
    intensity: '',
    estimated_duration: 0,
    status: 'published',
    isActive: true,
    isFeatured: false,
    isPublic: true,
    is_benchmark: false,
    ai_generated: false,
    blocks: '',
    tags: '',
    scheduled_date: '',
    scaling_options: '',
    equipment_required: '',
    focus_areas: '',
    metrics_tracked: '',
    coach_notes: '',
    target_metrics: '',
    ai_parameters: '',
    image_url: '',
    wod_format: '',
    rm_type: '',
    rm_exercise: '',
    rm_weight: '',
    personal_notes: '',
  })

  const [aiParams, setAiParams] = useState<AIParams>({
    date: '',
    duration_min: 45,
    intensity: 'moderate',
    difficulty: 'intermediate',
    workout_type: '',
    tags: '',
  })

  // Load workout data
  useEffect(() => {
    const fetchWorkout = async () => {
      if (isNewMode) {
        setLoading(false)
        return
      }

      try {
        const data = await workoutsApi.getOne(id)
        setWorkout(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          workout_type: data.workout_type || '',
          difficulty: data.difficulty || 'intermediate',
          intensity: data.intensity || '',
          estimated_duration: data.estimated_duration || 0,
          status: data.status || 'draft',
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFeatured: data.isFeatured || false,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          is_benchmark: false,
          ai_generated: data.ai_generated || false,
          blocks: data.blocks ? JSON.stringify(data.blocks, null, 2) : '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          scheduled_date: data.scheduled_date || '',
          scaling_options: '',
          equipment_required: '',
          focus_areas: '',
          metrics_tracked: '',
          coach_notes: '',
          target_metrics: '',
          ai_parameters: '',
          image_url: data.image_url || '',
          wod_format: '',
          rm_type: '',
          rm_exercise: '',
          rm_weight: '',
          personal_notes: '',
        })
      } catch {
        toast.error('Erreur lors du chargement du workout')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [id, isNewMode])

  // Helper function to parse JSON or comma-separated values
  const parseJsonOrArray = (value: string) => {
    if (!value.trim()) return undefined
    try {
      return JSON.parse(value)
    } catch {
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }
  }

  // Submit workout form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Build description from format + RM info + personal notes
      const parts: string[] = []
      if (formData.wod_format) {
        const formatLabels: Record<string, string> = {
          for_time: 'For Time', amrap: 'AMRAP', emom: 'EMOM', tabata: 'Tabata',
          circuit: 'Circuit / Rounds', intervals: 'Intervals', strength: 'Strength',
        }
        parts.push(`Format: ${formatLabels[formData.wod_format] || formData.wod_format}`)
      }
      if (formData.rm_type && formData.rm_exercise) {
        parts.push(`Objectif: ${formData.rm_type} ${formData.rm_exercise}${formData.rm_weight ? ` @ ${formData.rm_weight}` : ''}`)
      }
      if (formData.personal_notes) {
        parts.push(formData.personal_notes)
      }
      const description = parts.join('\n')

      const submitData: CreateWorkoutDTO = {
        name: isNewMode ? generateAutoName() : formData.name,
        description: description || undefined,
        workout_type: formData.workout_type || undefined,
        difficulty: formData.difficulty,
        intensity: formData.intensity || undefined,
        estimated_duration: formData.estimated_duration || undefined,
        status: isNewMode ? 'published' : formData.status,
        isActive: true,
        isFeatured: formData.isFeatured,
        isPublic: true,
        scheduled_date: formData.scheduled_date || undefined,
        tags: parseJsonOrArray(formData.tags),
        blocks: (() => {
          if (!formData.blocks) return undefined
          const parsed = JSON.parse(formData.blocks)
          // Inject wod_format into main sections that don't have a format yet
          if (formData.wod_format && parsed.sections) {
            const formatLabels: Record<string, string> = {
              for_time: 'For Time', amrap: 'AMRAP', emom: 'EMOM', tabata: 'Tabata',
              circuit: 'Circuit', intervals: 'Intervals', strength: 'Strength',
            }
            for (const section of parsed.sections) {
              if (!section.format && section.type !== 'warmup' && section.type !== 'cooldown') {
                section.format = formatLabels[formData.wod_format] || formData.wod_format
              }
            }
          }
          return parsed
        })(),
        image_url: formData.image_url || undefined,
      }

      if (isNewMode) {
        await workoutsApi.create(submitData)
        toast.success('Workout créé avec succès')
      } else {
        await workoutsApi.update(id, submitData)
        toast.success('Workout mis à jour')
      }

      router.push('/workouts')
    } catch (error) {
      console.error(error)
      toast.error(isNewMode ? 'Erreur lors de la création du workout' : 'Erreur lors de la mise à jour du workout')
    } finally {
      setSaving(false)
    }
  }

  // Submit AI generation form
  const handleSubmitGenerateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const generationParams = {
        workoutType: aiParams.workout_type || 'mixed',
        difficulty: aiParams.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'elite',
        duration: aiParams.duration_min,
        focus: undefined,
        equipment: undefined,
        constraints: undefined,
        additionalInstructions: aiParams.tags || undefined,
      }

      const generatedWorkout = await generateWorkoutWithAI(generationParams)

      // Pre-fill form with generated data
      setFormData({
        ...formData,
        name: generatedWorkout.name || generateAutoName(),
        description: generatedWorkout.description || '',
        workout_type: generatedWorkout.workout_type || '',
        intensity: generatedWorkout.intensity || '',
        difficulty: generatedWorkout.difficulty || '',
        estimated_duration: generatedWorkout.estimated_duration || 0,
        scheduled_date: aiParams.date,
        blocks: generatedWorkout.blocks ? JSON.stringify(generatedWorkout.blocks, null, 2) : '',
        tags: generatedWorkout.tags?.join(', ') || '',
        ai_generated: true,
      })

      setShowAIModal(false)
      toast.success('Workout généré avec succès!')
    } catch {
      toast.error('Erreur lors de la génération du workout')
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    workout,
    formData,
    setFormData,
    showAIModal,
    setShowAIModal,
    aiParams,
    setAiParams,
    handleSubmit,
    handleSubmitGenerateWorkout,
  }
}
