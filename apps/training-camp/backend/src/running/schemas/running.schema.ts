import { z } from 'zod'

export const RunPhaseSchema = z.object({
  phase: z.enum(['warmup', 'main', 'cooldown', 'recovery']),
  label: z.string(),
  distance_km: z.number().positive().optional(),
  duration_minutes: z.number().positive(),
  pace_description: z.string(),
  target_zone: z.string(), // ex: 'zone_1_2', 'zone_3', 'zone_4', 'zone_5'
  intervals: z
    .array(
      z.object({
        effort_duration: z.string(), // ex: '400m' ou '3min'
        recovery_duration: z.string(), // ex: '200m' ou '90s'
        pace_description: z.string(),
        repetitions: z.number().int().positive(),
      }),
    )
    .optional(),
  notes: z.string().optional(),
})

export const GeneratedRunningPlanSchema = z.object({
  name: z.string().min(1),
  run_type: z.enum(['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race']),
  total_distance_km: z.number().positive(),
  estimated_duration_minutes: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  description: z.string(),
  structure: z.array(RunPhaseSchema).min(1),
  coaching_tips: z.string(),
  recovery_notes: z.string(),
})

export type GeneratedRunningPlanValidated = z.infer<typeof GeneratedRunningPlanSchema>
