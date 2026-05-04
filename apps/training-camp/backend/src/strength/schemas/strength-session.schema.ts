import { z } from 'zod'

const ExerciseSchema = z.object({
  name: z.string().min(1),
  equipment: z.string().optional(),
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.string()]),
  rest: z.string().optional(),
  intensity: z.string().optional(),
  coaching_notes: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
})

const BlockSchema = z.object({
  block_name: z.string().min(1),
  block_type: z.enum(['push', 'pull', 'hinge', 'squat', 'carry', 'rotation', 'isolation', 'core']),
  exercises: z.array(ExerciseSchema).min(1),
})

const WarmupExerciseSchema = z.object({
  name: z.string(),
  duration_or_reps: z.string(),
  notes: z.string().optional(),
})

export const GeneratedStrengthSessionSchema = z.object({
  session_name: z.string().min(1),
  target_muscles: z.array(z.string()).min(1),
  session_goal: z.enum(['strength', 'hypertrophy', 'endurance', 'power']),
  estimated_duration_minutes: z.number().int().positive(),
  coaching_notes: z.string().optional(),
  warmup: z.object({
    duration: z.string(),
    exercises: z.array(WarmupExerciseSchema).min(1),
  }),
  blocks: z.array(BlockSchema).min(1),
  cooldown: z.string().optional(),
})

export type GeneratedStrengthSession = z.infer<typeof GeneratedStrengthSessionSchema>
