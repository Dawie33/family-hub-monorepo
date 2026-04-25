import apiClient from './apiClient'

export interface OneRepMax {
  id: string
  user_id: string
  lift: string
  value: number
  source: 'real' | 'estimated'
  measured_at: string
}

export interface UpsertOneRepMaxDto {
  value: number
  source: 'real' | 'estimated'
}

export const CROSSFIT_LIFTS: { value: string; label: string }[] = [
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

export interface OneRepMaxHistoryEntry {
  value: number
  source: 'real' | 'estimated'
  measured_at: string
}

class OneRepMaxesService {
  async getMyOneRepMaxes(): Promise<OneRepMax[]> {
    return apiClient.get<OneRepMax[]>('/one-rep-maxes')
  }

  async upsertOneRepMax(lift: string, dto: UpsertOneRepMaxDto): Promise<OneRepMax> {
    return apiClient.put<OneRepMax>(`/one-rep-maxes/${lift}`, dto)
  }

  async getHistory(): Promise<Record<string, OneRepMaxHistoryEntry[]>> {
    return apiClient.get<Record<string, OneRepMaxHistoryEntry[]>>('/one-rep-maxes/history')
  }
}

export const oneRepMaxesService = new OneRepMaxesService()
