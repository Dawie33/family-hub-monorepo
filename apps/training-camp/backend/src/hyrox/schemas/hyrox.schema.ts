import { z } from 'zod'

const nullableString = z.string().nullable().optional().transform((v) => v ?? undefined)
const nullableNumber = z.number().nullable().optional().transform((v) => v ?? undefined)

export const HyroxExerciseSchema = z.object({
  name: z.string().min(1),
  sets: nullableNumber.pipe(z.number().int().positive().optional()),
  reps: z.union([z.number(), z.string()]).nullable().optional().transform((v) => v ?? undefined),
  distance: nullableString,
  duration: nullableString,
  rest: nullableString,
  intensity: nullableString,
  alternative: nullableString,
  estimated_minutes: z.number().positive(),
  notes: nullableString,
})

export const HyroxBlockSchema = z.object({
  type: z.enum(['warmup', 'run_work', 'station_work', 'mixed', 'cooldown']),
  label: z.string(),
  duration_minutes: z.number().int().positive(),
  target_stations: z.array(z.string()).optional(),
  exercises: z.array(HyroxExerciseSchema).min(1),
  notes: z.string().optional(),
})

export const GeneratedHyroxPlanSchema = z.object({
  name: z.string().min(1),
  session_type: z.enum(['full_simulation', 'station_prep', 'run_prep', 'mixed']),
  duration_minutes: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  description: z.string(),
  blocks: z.array(HyroxBlockSchema).min(1),
  equipment_notes: z.string(),   // notes sur les alternatives utilisées
  coaching_tips: z.string(),
  race_strategy: z.string(),     // conseils pour la compétition HYROX
})

export type GeneratedHyroxPlanValidated = z.infer<typeof GeneratedHyroxPlanSchema>
