import { Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import {
  CreateStrengthSessionDto,
  GenerateStrengthSessionDto,
  StrengthSessionQueryDto,
  UpdateStrengthSessionDto,
} from '../dto/strength.dto'
import { GeneratedStrengthSession } from '../schemas/strength-session.schema'
import { AIStrengthGeneratorService } from './ai-strength-generator.service'

@Injectable()
export class StrengthService {
  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly aiGenerator: AIStrengthGeneratorService,
  ) {}

  async findAll(userId: string, query: StrengthSessionQueryDto) {
    const { limit = '20', offset = '0', start_date, end_date, session_goal, target_muscle } = query

    let q = this.knex('strength_sessions').where('user_id', userId)

    if (start_date) q = q.where('session_date', '>=', start_date)
    if (end_date) q = q.where('session_date', '<=', end_date)
    if (session_goal) q = q.where('session_goal', session_goal)
    if (target_muscle) q = q.whereRaw('? = ANY(target_muscles)', [target_muscle])

    const [rows, countResult] = await Promise.all([
      q.clone().orderBy('session_date', 'desc').limit(Number(limit)).offset(Number(offset)),
      q.clone().count('* as count').first(),
    ])

    return { rows, count: Number(countResult?.count ?? 0) }
  }

  async findOne(id: string, userId: string) {
    const session = await this.knex('strength_sessions').where({ id, user_id: userId }).first()
    if (!session) throw new NotFoundException('Séance de force non trouvée')
    return session
  }

  async generateAndCreate(userId: string, dto: GenerateStrengthSessionDto, existingPlan?: GeneratedStrengthSession) {
    const aiPlan = existingPlan ?? await this.aiGenerator.generateSession(userId, dto)

    const profile = await this.knex('users').select('equipment_available').where('id', userId).first()
    const equipmentUsed = dto.availableEquipment ?? profile?.equipment_available ?? []

    const [session] = await this.knex('strength_sessions')
      .insert({
        user_id: userId,
        session_date: new Date().toISOString().split('T')[0],
        target_muscles: dto.targetMuscles,
        session_goal: dto.sessionGoal,
        equipment_used: JSON.stringify(equipmentUsed),
        source: 'ai_generated',
        ai_plan: JSON.stringify(aiPlan),
      })
      .returning('*')

    return session
  }

  async create(userId: string, dto: CreateStrengthSessionDto) {
    const [session] = await this.knex('strength_sessions')
      .insert({
        user_id: userId,
        session_date: dto.session_date,
        target_muscles: dto.target_muscles,
        session_goal: dto.session_goal,
        equipment_used: dto.equipment_used ? JSON.stringify(dto.equipment_used) : null,
        source: 'manual',
        ai_plan: dto.ai_plan ? JSON.stringify(dto.ai_plan) : null,
        sets_logged: dto.sets_logged ? JSON.stringify(dto.sets_logged) : null,
        perceived_effort: dto.perceived_effort ?? null,
        duration_minutes: dto.duration_minutes ?? null,
        notes: dto.notes ?? null,
      })
      .returning('*')

    return session
  }

  async update(id: string, userId: string, dto: UpdateStrengthSessionDto) {
    await this.findOne(id, userId)

    const [updated] = await this.knex('strength_sessions')
      .where({ id, user_id: userId })
      .update({
        ...(dto.sets_logged !== undefined && { sets_logged: JSON.stringify(dto.sets_logged) }),
        ...(dto.perceived_effort !== undefined && { perceived_effort: dto.perceived_effort }),
        ...(dto.duration_minutes !== undefined && { duration_minutes: dto.duration_minutes }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updated_at: new Date(),
      })
      .returning('*')

    return updated
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId)
    await this.knex('strength_sessions').where({ id, user_id: userId }).delete()
    return { deleted: true }
  }

  async getStats(userId: string) {
    const [agg, muscleRows] = await Promise.all([
      this.knex('strength_sessions')
        .where('user_id', userId)
        .select(
          this.knex.raw('COUNT(*) as total_sessions'),
          this.knex.raw(`COUNT(*) FILTER (WHERE session_goal = 'strength') as strength_sessions`),
          this.knex.raw(`COUNT(*) FILTER (WHERE session_goal = 'hypertrophy') as hypertrophy_sessions`),
          this.knex.raw(`ROUND(AVG(perceived_effort)) as avg_rpe`),
          this.knex.raw(`ROUND(AVG(duration_minutes)) as avg_duration`),
        )
        .first(),

      // Fréquence par groupe musculaire
      this.knex('strength_sessions')
        .select('target_muscles')
        .where('user_id', userId),
    ])

    const muscleFrequency: Record<string, number> = {}
    for (const row of muscleRows) {
      const muscles = Array.isArray(row.target_muscles) ? row.target_muscles : []
      for (const m of muscles) {
        muscleFrequency[m] = (muscleFrequency[m] ?? 0) + 1
      }
    }

    return { ...agg, muscle_frequency: muscleFrequency }
  }
}
