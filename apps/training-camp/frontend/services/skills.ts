import type { GeneratedSkillProgram, SkillProgram, SkillProgressLog } from '@/domain/entities/skill'
import apiClient from './apiClient'

export class SkillsService {
  async getAll(status?: string): Promise<SkillProgram[]> {
    const params: Record<string, string> = {}
    if (status) params.status = status
    return apiClient.get<SkillProgram[]>('/skills', { params })
  }

  async getOne(id: string): Promise<SkillProgram> {
    return apiClient.get<SkillProgram>(`/skills/${id}`)
  }

  async generateWithAI(data: {
    skillName: string
    skillCategory: string
    currentCapabilities?: string
    constraints?: string
    userLevel?: string
    availableEquipment?: string[]
  }): Promise<GeneratedSkillProgram> {
    return apiClient.post<GeneratedSkillProgram>('/skills/generate-ai', data)
  }

  async create(data: {
    skill_name: string
    skill_category: string
    description?: string
    estimated_weeks?: number
    ai_parameters?: Record<string, unknown>
    progression_notes?: string
    safety_notes?: string
    steps: {
      step_number: number
      title: string
      description?: string
      validation_criteria?: Record<string, unknown>
      recommended_exercises?: Record<string, unknown>[]
      coaching_tips?: string
      estimated_duration_weeks?: number
    }[]
  }): Promise<SkillProgram> {
    return apiClient.post<SkillProgram>('/skills', data)
  }

  async updateProgram(id: string, data: { status?: string; progression_notes?: string }): Promise<SkillProgram> {
    return apiClient.patch<SkillProgram>(`/skills/${id}`, data)
  }

  async updateStep(programId: string, stepId: string, data: { status?: string; manually_overridden?: boolean }): Promise<unknown> {
    return apiClient.patch(`/skills/${programId}/steps/${stepId}`, data)
  }

  async deleteProgram(id: string): Promise<void> {
    return apiClient.delete<void>(`/skills/${id}`)
  }

  async logProgress(data: {
    step_id: string
    session_date: string
    performance_data?: Record<string, unknown>
    session_notes?: string
  }): Promise<SkillProgressLog> {
    return apiClient.post<SkillProgressLog>('/skills/progress', data)
  }

  async getStepLogs(stepId: string): Promise<SkillProgressLog[]> {
    return apiClient.get<SkillProgressLog[]>(`/skills/progress/step/${stepId}`)
  }

  async deleteLog(logId: string): Promise<void> {
    return apiClient.delete<void>(`/skills/progress/${logId}`)
  }
}

export const skillsService = new SkillsService()
