import { z } from 'zod'

export const AthxExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive().optional(),
  reps: z.union([z.number(), z.string()]).optional(),
  duration: z.string().optional(),    // ex: "3 min"
  rest: z.string().optional(),
  intensity: z.string().optional(),   // ex: "RPE 8", "80% 1RM"
  notes: z.string().optional(),
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
