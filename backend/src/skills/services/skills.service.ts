import { Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import {
  CreateSkillProgramDto,
  CreateSkillProgressLogDto,
  UpdateSkillProgramDto,
  UpdateSkillStepDto,
} from '../dto/skill.dto'

@Injectable()
export class SkillsService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  async findAll(userId: string, status?: string) {
    let query = this.knex('skill_programs')
      .select('skill_programs.*')
      .where({ user_id: userId })

    if (status) {
      query = query.where('status', status)
    }

    const programs = await query.orderBy('created_at', 'desc')

    const programIds = programs.map(p => p.id)
    if (programIds.length === 0) return []

    const stepCounts = await this.knex('skill_program_steps')
      .select('program_id')
      .count('* as total_steps')
      .whereIn('program_id', programIds)
      .groupBy('program_id')

    const completedCounts = await this.knex('skill_program_steps')
      .select('program_id')
      .count('* as completed_steps')
      .whereIn('program_id', programIds)
      .whereIn('status', ['completed', 'skipped'])
      .groupBy('program_id')

    const stepCountMap = Object.fromEntries(stepCounts.map(s => [s.program_id, Number(s.total_steps)]))
    const completedMap = Object.fromEntries(completedCounts.map(s => [s.program_id, Number(s.completed_steps)]))

    return programs.map(p => ({
      ...p,
      total_steps: stepCountMap[p.id] || 0,
      completed_steps: completedMap[p.id] || 0,
    }))
  }

  async findOne(id: string, userId: string) {
    const program = await this.knex('skill_programs')
      .where({ id, user_id: userId })
      .first()

    if (!program) {
      throw new NotFoundException('Programme de skill non trouve')
    }

    const steps = await this.knex('skill_program_steps')
      .where({ program_id: id })
      .orderBy('step_number', 'asc')

    return { ...program, steps }
  }

  async create(userId: string, data: CreateSkillProgramDto) {
    return this.knex.transaction(async (trx) => {
      const [program] = await trx('skill_programs')
        .insert({
          user_id: userId,
          skill_name: data.skill_name,
          skill_category: data.skill_category,
          description: data.description || null,
          estimated_weeks: data.estimated_weeks || null,
          ai_parameters: data.ai_parameters ? JSON.stringify(data.ai_parameters) : null,
          progression_notes: data.progression_notes || null,
          safety_notes: data.safety_notes || null,
          status: 'active',
          started_at: new Date(),
        })
        .returning('*')

      const stepsToInsert = data.steps.map((step, index) => ({
        program_id: program.id,
        step_number: step.step_number,
        title: step.title,
        description: step.description || null,
        validation_criteria: step.validation_criteria ? JSON.stringify(step.validation_criteria) : null,
        recommended_exercises: step.recommended_exercises ? JSON.stringify(step.recommended_exercises) : null,
        coaching_tips: step.coaching_tips || null,
        estimated_duration_weeks: step.estimated_duration_weeks || null,
        status: index === 0 ? 'in_progress' : 'locked',
        unlocked_at: index === 0 ? new Date() : null,
      }))

      const steps = await trx('skill_program_steps')
        .insert(stepsToInsert)
        .returning('*')

      return { ...program, steps }
    })
  }

  async updateProgram(id: string, userId: string, data: UpdateSkillProgramDto) {
    const program = await this.knex('skill_programs')
      .where({ id, user_id: userId })
      .first()

    if (!program) {
      throw new NotFoundException('Programme de skill non trouve')
    }

    const updateData: Record<string, unknown> = { updated_at: new Date() }
    if (data.status) {
      updateData.status = data.status
      if (data.status === 'completed') {
        updateData.completed_at = new Date()
      }
    }
    if (data.progression_notes !== undefined) {
      updateData.progression_notes = data.progression_notes
    }

    const [updated] = await this.knex('skill_programs')
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*')

    return updated
  }

  async updateStep(programId: string, stepId: string, userId: string, data: UpdateSkillStepDto) {
    const program = await this.knex('skill_programs')
      .where({ id: programId, user_id: userId })
      .first()

    if (!program) {
      throw new NotFoundException('Programme de skill non trouve')
    }

    const step = await this.knex('skill_program_steps')
      .where({ id: stepId, program_id: programId })
      .first()

    if (!step) {
      throw new NotFoundException('Etape non trouvee')
    }

    const updateData: Record<string, unknown> = { updated_at: new Date() }

    if (data.status) {
      updateData.status = data.status
      if (data.manually_overridden) {
        updateData.manually_overridden = true
      }
      if (data.status === 'completed' || data.status === 'skipped') {
        updateData.completed_at = new Date()
      }
      if (data.status === 'in_progress') {
        updateData.unlocked_at = new Date()
      }
    }

    const [updatedStep] = await this.knex('skill_program_steps')
      .where({ id: stepId })
      .update(updateData)
      .returning('*')

    // If step completed/skipped, unlock next step
    if (data.status === 'completed' || data.status === 'skipped') {
      const nextStep = await this.knex('skill_program_steps')
        .where({ program_id: programId, step_number: step.step_number + 1 })
        .first()

      if (nextStep && nextStep.status === 'locked') {
        await this.knex('skill_program_steps')
          .where({ id: nextStep.id })
          .update({ status: 'in_progress', unlocked_at: new Date(), updated_at: new Date() })
      }

      // Check if all steps are completed/skipped -> complete program
      const remainingSteps = await this.knex('skill_program_steps')
        .where({ program_id: programId })
        .whereNotIn('status', ['completed', 'skipped'])
        .count('* as count')
        .first()

      if (Number(remainingSteps?.count) === 0) {
        await this.knex('skill_programs')
          .where({ id: programId })
          .update({ status: 'completed', completed_at: new Date(), updated_at: new Date() })
      }
    }

    return updatedStep
  }

  async deleteProgram(id: string, userId: string) {
    const program = await this.knex('skill_programs')
      .where({ id, user_id: userId })
      .first()

    if (!program) {
      throw new NotFoundException('Programme de skill non trouve')
    }

    await this.knex('skill_programs').where({ id }).delete()
    return { success: true }
  }

  async logProgress(userId: string, data: CreateSkillProgressLogDto) {
    const step = await this.knex('skill_program_steps')
      .where({ id: data.step_id })
      .first()

    if (!step) {
      throw new NotFoundException('Etape non trouvee')
    }

    const [log] = await this.knex('skill_progress_logs')
      .insert({
        step_id: data.step_id,
        user_id: userId,
        session_date: data.session_date,
        performance_data: data.performance_data ? JSON.stringify(data.performance_data) : null,
        session_notes: data.session_notes || null,
      })
      .returning('*')

    return log
  }

  async getStepLogs(stepId: string) {
    return this.knex('skill_progress_logs')
      .where({ step_id: stepId })
      .orderBy('session_date', 'desc')
  }

  async deleteLog(logId: string, userId: string) {
    const log = await this.knex('skill_progress_logs')
      .where({ id: logId, user_id: userId })
      .first()

    if (!log) {
      throw new NotFoundException('Log non trouve')
    }

    await this.knex('skill_progress_logs').where({ id: logId }).delete()
    return { success: true }
  }
}
