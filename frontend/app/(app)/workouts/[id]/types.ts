/**
 * Types pour les composants de la page workout [id]
 */

import type { Exercise } from '@/domain/entities/exercise'

// ============================================================================
// WORKOUT FORM
// ============================================================================

export interface WorkoutFormFields {
  name: string
  description: string
  workout_type: string
  difficulty: string
  intensity: string
  estimated_duration: number
  status: string
  isActive: boolean
  isFeatured: boolean
  isPublic: boolean
  is_benchmark: boolean
  ai_generated: boolean
  blocks: string
  tags: string
  scheduled_date: string
  scaling_options: string
  equipment_required: string
  focus_areas: string
  metrics_tracked: string
  coach_notes: string
  target_metrics: string
  ai_parameters: string
  image_url: string
  // New fields for simplified create form
  wod_format: string
  rm_type: string
  rm_exercise: string
  rm_weight: string
  personal_notes: string
}

export interface WorkoutFormProps {
  formData: WorkoutFormFields
  setFormData: (data: WorkoutFormFields) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  saving: boolean
  isNewMode: boolean
}

// ============================================================================
// EDITORS
// ============================================================================

export interface TagInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export interface BlocksEditorProps {
  label?: string
  value: string
  onChange: (value: string) => void
}

export interface JsonEditorProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export interface ExercisesSidebarProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Exercise) => void
}
