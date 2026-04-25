/**
 * Schémas de validation Zod pour les workouts générés par l'IA
 */

import { z } from 'zod'
import { EQUIPMENT } from '../constants/equipment.constants'

/**
 * Normalise le nom d'un équipement pour correspondre à la nomenclature standard
 * Exemple: "jump rope" -> "jump-rope", "dumbbells" -> "dumbbell"
 */
const EQUIPMENT_ALIASES: Record<string, string> = {
  'pullup-bar': 'pull-up-bar',
  'pullups-bar': 'pull-up-bar',
  'pull-ups-bar': 'pull-up-bar',
  'pull-up': 'pull-up-bar',
  'jumprope': 'jump-rope',
  'skierg': 'ski-erg',
  'assault': 'assault-bike',
  'wallball': 'wall-ball',
  'medicine': 'medicine-ball',
  'medicineball': 'medicine-ball',
  'slam': 'slam-ball',
  'slamball': 'slam-ball',
  'battleropes': 'battle-ropes',
  'battle-rope': 'battle-ropes',
  'farmer-walk': 'farmer-walk-handles',
  'farmers-walk': 'farmer-walk-handles',
  'atlas': 'atlas-stone',
  'ab-mat': 'abmat',
  'yoga': 'yoga-block',
  'suspension': 'suspension-trainer',
  'trx': 'suspension-trainer',
}

function normalizeEquipmentName(name: string): string {
  let normalized = name.toLowerCase().trim().replace(/[\s_]+/g, '-')

  // Gérer les pluriels courants
  if (normalized.endsWith('s') && EQUIPMENT.includes(normalized.slice(0, -1) as any)) {
    normalized = normalized.slice(0, -1)
  }

  // Vérifier les alias
  if (EQUIPMENT_ALIASES[normalized]) {
    normalized = EQUIPMENT_ALIASES[normalized]
  }

  return normalized
}

/**
 * Schéma de validation pour l'équipement avec normalisation automatique.
 * Les équipements inconnus sont ignorés silencieusement (null filtré en aval).
 */
export const EquipmentSchema = z.string().transform((val) => {
  const normalized = normalizeEquipmentName(val)
  if (!EQUIPMENT.includes(normalized as any)) {
    return null
  }
  return normalized
}).nullable()

/**
 * Schéma de validation pour un exercice
 */
export const ExerciseSchema = z.object({
  name: z.string().min(1),
  reps: z.union([z.number().int().nonnegative(), z.string()]).nullable().optional(),
  sets: z.number().int().positive().nullable().optional(),
  duration: z.string().nullable().optional(),
  work_duration: z.string().nullable().optional(),
  rest_duration: z.string().nullable().optional(),
  distance: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  intensity: z.string().nullable().optional(),
  pace: z.string().nullable().optional(),
  effort: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  tempo: z.string().nullable().optional(),
  per_side: z.boolean().nullable().optional(),
  cadence: z.string().nullable().optional(),
  power: z.string().nullable().optional(),
  heart_rate: z.string().nullable().optional(),
  equipment: z.array(EquipmentSchema).transform(arr => arr.filter((e): e is string => e !== null)).nullable().optional(),
  easier_option: z.string().nullable().optional(),
  harder_option: z.string().nullable().optional(),
  target_rpe: z.string().nullable().optional(),
})

/**
 * Schéma de validation pour une section de workout
 */
export const WorkoutSectionSchema = z.object({
  type: z.string(),
  title: z.string().min(1),
  duration_min: z.number().positive().nullable().optional(),
  format: z.string().nullable().optional(),
  rounds: z.number().int().positive().nullable().optional(),
  rest_between_rounds: z.number().nonnegative().nullable().optional(),
  exercises: z.array(ExerciseSchema).nullable().optional(),
})

/**
 * Schéma de validation pour les blocs d'un workout
 */
export const WorkoutBlocksSchema = z.object({
  sections: z.array(WorkoutSectionSchema).min(1),
  stimulus: z.string(),
  duration_min: z.number().positive().max(180, 'La durée doit être <= 180 minutes'),
  estimated_calories: z.string().nullable().optional(),
})

/**
 * Schéma de validation complet pour un workout généré
 */
export const GeneratedWorkoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  workout_type: z.string().min(1),
  estimated_duration: z.number().positive().max(180), // Max 3 heures
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  intensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  blocks: WorkoutBlocksSchema,
  equipment_required: z.array(EquipmentSchema).transform(arr => arr.filter((e): e is string => e !== null)).nullable().optional(),
  focus_areas: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  coach_notes: z.string().nullable().optional(),
}).refine(
  (workout) => {
    // Vérifier que estimated_duration correspond à blocks.duration_min
    const diff = Math.abs(workout.estimated_duration - workout.blocks.duration_min)
    return diff <= 15 // Tolérance de 15 minutes (les WODs courts type "For Time" ont souvent un écart entre le time cap et le temps réel estimé)
  },
  {
    message: 'La durée estimée doit correspondre à la durée totale des blocs (± 15 minutes)',
    path: ['estimated_duration'],
  }
)

export type GeneratedWorkoutValidated = z.infer<typeof GeneratedWorkoutSchema>
