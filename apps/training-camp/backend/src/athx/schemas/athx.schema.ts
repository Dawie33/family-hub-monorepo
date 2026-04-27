import { z } from 'zod'

const nullableString = z.string().nullable().optional().transform((v) => v ?? undefined)
const nullableNumber = z.number().nullable().optional().transform((v) => v ?? undefined)

export const AthxExerciseSchema = z.object({
  name: z.string().min(1),
  sets: nullableNumber.pipe(z.number().int().positive().optional()),
  reps: z.union([z.number(), z.string()]).nullable().optional().transform((v) => v ?? undefined),
  duration: nullableString,
  rest: nullableString,
  intensity: nullableString,
  notes: nullableString,
})

export const AthxBlockSchema = z.object({
  zone: z.enum(['warmup', 'strength', 'endurance', 'metcon', 'cooldown']),
  label: z.string(),
  duration_minutes: z.number().int().positive(),
  exercises: z.array(AthxExerciseSchema).min(1),
  notes: z.string().optional(),
})

export const GeneratedAthxPlanSchema = z.object({
  name: z.string().min(1),
  session_type: z.enum(['full_competition', 'strength_prep', 'endurance_prep', 'metcon_prep', 'mixed']),
  target_zones: z.array(z.string()),
  duration_minutes: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  description: z.string(),
  blocks: z.array(AthxBlockSchema).min(1),
  coaching_tips: z.string(),
  competition_notes: z.string(),  // lien avec la compétition ATHX réelle
})

export type GeneratedAthxPlanValidated = z.infer<typeof GeneratedAthxPlanSchema>
