export interface WorkoutBlock {
  title?: string
  duration_min?: number
  exercises?: Array<{
    name: string
    description?: string
    category?: string
    measurement_type?: string
    sets?: string
    reps?: string
    weight?: string
    distance?: string
    time?: string
    duration?: string
    equipment?: string | string[]
    muscle_groups?: string[]
    instructions?: string
    notes?: string
  }>
}


export type WithEquipment = { equipment?: string[] }

export type StrengthBlock = {
  name: string
  scheme: string              // ex: "5x5", "4x8@RIR2", "3x10 tempo 31X1"
  percent_1rm?: number
  rest_sec?: number
  notes?: string
} & WithEquipment

export type MetconPart = {
  movement: string
  reps?: number
  calories?: number
  distance_m?: number
  duration_min?: number
  load_pct_1rm_bs?: number
  target_zone?: string        // Running (E|M|T|I|R)
  target_pct_ftp?: number     // Cycling (0.85..1.05)
  r_rest_sec?: number         // rest
} & WithEquipment

export type MetconBlock = {
  format: 'For Time' | 'AMRAP' | 'EMOM' | 'Intervals'
  time_cap_min?: number
  duration_min?: number
  parts: MetconPart[]
  substitutions?: Record<string, string[]>
}

export type AccessoryItem = { movement: string; scheme: string } & WithEquipment
export type WarmupItem = { movement: string; duration_sec?: number; reps?: number } & WithEquipment
export type CooldownItem = { movement: string; duration_sec?: number; reps?: number } & WithEquipment

export type WorkoutBlocks = {
  duration_min: number
  stimulus?: string
  warmup?: WarmupItem[]
  strength?: StrengthBlock
  metcon?: MetconBlock
  accessory?: AccessoryItem[]
  cooldown?: CooldownItem[]
  availableEquipment?: string[] // Liste du matériel dispo (bodyweight si rien)
}

export type DailyPlan = {
  date: string                  // ISO yyyy-mm-dd
  tags: string[]
  blocks: WorkoutBlocks
  description?: string          // Description du workout
  coach_notes?: string          // Notes du coach
  name?: string
  workout_type?: string         // Type: amrap, for_time, intervals, strength, etc.
  difficulty?: string           // Difficulté
  intensity?: string
  estimated_duration?: number           // Intensité
}


export type TargetZone = 'E' | 'M' | 'T' | 'I' | 'R'