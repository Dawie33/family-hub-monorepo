import { api } from './api'

export interface GeneratedSkillProgram {
  skill_name: string
  skill_category: string
  description?: string
  estimated_weeks?: number
  progression_notes?: string
  safety_notes?: string
  steps: {
    step_number: number
    title: string
    description?: string
    coaching_tips?: string
    estimated_duration_weeks?: number
  }[]
}

export async function generateSkillWithAI(data: {
  skillName: string
  skillCategory: string
  currentCapabilities?: string
  constraints?: string
  userLevel?: string
}): Promise<GeneratedSkillProgram> {
  return api.post<GeneratedSkillProgram>('/skills/generate-ai', data)
}

export async function createSkill(data: {
  skill_name: string
  skill_category: string
  description?: string
  estimated_weeks?: number
  progression_notes?: string
  safety_notes?: string
  steps: {
    step_number: number
    title: string
    description?: string
    coaching_tips?: string
    estimated_duration_weeks?: number
  }[]
}): Promise<any> {
  return api.post('/skills', data)
}

export async function updateSkillStep(
  programId: string,
  stepId: string,
  data: { status?: string; manually_overridden?: boolean }
): Promise<void> {
  await api.patch(`/skills/${programId}/steps/${stepId}`, data)
}

export async function getBenchmarkWorkouts(): Promise<{ rows: any[]; count: number }> {
  return api.get<{ rows: any[]; count: number }>('/workouts/benchmark')
}
