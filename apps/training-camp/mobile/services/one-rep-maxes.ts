import { api } from './api'

export interface OneRepMax {
  lift: string
  value: number
  source: 'real' | 'estimated'
  measured_at: string
}

export const CROSSFIT_LIFTS = [
  { value: 'back_squat', label: 'Back Squat' },
  { value: 'front_squat', label: 'Front Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'clean', label: 'Clean' },
  { value: 'clean_and_jerk', label: 'Clean & Jerk' },
  { value: 'snatch', label: 'Snatch' },
  { value: 'overhead_squat', label: 'Overhead Squat' },
  { value: 'strict_press', label: 'Strict Press' },
  { value: 'push_press', label: 'Push Press' },
  { value: 'thruster', label: 'Thruster' },
]

export async function getMyOneRepMaxes(): Promise<OneRepMax[]> {
  return api.get<OneRepMax[]>('/one-rep-maxes')
}

export async function upsertOneRepMax(lift: string, dto: { value: number; source: 'real' | 'estimated' }): Promise<OneRepMax> {
  return api.put<OneRepMax>(`/one-rep-maxes/${lift}`, dto)
}
