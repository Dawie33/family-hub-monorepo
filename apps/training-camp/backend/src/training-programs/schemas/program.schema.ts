import { z } from 'zod'

export const StrengthMovementSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.string().min(1)]),
  intensity: z.string().optional().nullable(),
  rest: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const ConditioningMovementSchema = z.object({
  name: z.string().min(1),
  reps: z.union([z.number().int().positive(), z.string()]).optional().nullable(),
  distance: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  calories: z.number().int().positive().optional().nullable(),
  time: z.string().optional().nullable(),
})

export const ConditioningSchema = z.object({
  type: z.enum(['amrap', 'for_time', 'emom', 'tabata', 'rounds_for_time', 'death_by', 'chipper']),
  duration_minutes: z.number().positive().optional().nullable(),
  rounds: z.number().int().positive().optional().nullable(),
  movements: z.array(ConditioningMovementSchema).min(1),
  score_type: z.enum(['rounds_and_reps', 'time', 'weight', 'calories', 'reps']).optional().nullable(),
  scaling_notes: z.string().optional().nullable(),
})

export const SkillWorkSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sets: z.number().int().positive().optional().nullable(),
  duration: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const ProgramSessionSchema = z.object({
  session_in_week: z.number().int().min(1),
  title: z.string().min(1),
  focus: z.enum(['strength', 'conditioning', 'skill', 'mixed', 'recovery']),
  estimated_duration: z.number().positive(),
  strength_work: z
    .object({
      movements: z.array(StrengthMovementSchema).min(1),
    })
    .optional()
    .nullable(),
  conditioning: ConditioningSchema.optional().nullable(),
  skill_work: SkillWorkSchema.optional().nullable(),
  coach_notes: z.string().optional().nullable(),
})

export const ProgramPhaseSchema = z.object({
  phase_number: z.number().int().positive(),
  name: z.string().min(1),
  weeks: z.array(z.number().int().positive()).min(1),
  description: z.string(),
  sessions: z.array(ProgramSessionSchema).min(1),
})

export const GeneratedProgramSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  objectives: z.string(),
  phases: z.array(ProgramPhaseSchema).min(1),
  progression_notes: z.string(),
  coach_notes: z.string().optional().nullable(),
})

export type StrengthMovement = z.infer<typeof StrengthMovementSchema>
export type ConditioningMovement = z.infer<typeof ConditioningMovementSchema>
export type Conditioning = z.infer<typeof ConditioningSchema>
export type ProgramSession = z.infer<typeof ProgramSessionSchema>
export type ProgramPhase = z.infer<typeof ProgramPhaseSchema>
export type GeneratedProgramValidated = z.infer<typeof GeneratedProgramSchema>
