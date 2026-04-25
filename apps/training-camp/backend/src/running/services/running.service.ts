import { Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import {
  CreateRunningSessionDto,
  GenerateRunningSessionDto,
  RunningSessionQueryDto,
  UpdateRunningSessionDto,
} from '../dto/running.dto'
import { GeneratedRunningPlanValidated } from '../schemas/running.schema'
import { AIRunningGeneratorService } from './ai-running-generator.service'

@Injectable()
export class RunningService {
  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly aiGenerator: AIRunningGeneratorService,
  ) {}

  async findAll(userId: string, query: RunningSessionQueryDto) {
    const { limit = '20', offset = '0', start_date, end_date, run_type, source } = query

    let q = this.knex('running_sessions').where('user_id', userId)

    if (start_date) q = q.where('session_date', '>=', start_date)
    if (end_date) q = q.where('session_date', '<=', end_date)
    if (run_type) q = q.where('run_type', run_type)
    if (source) q = q.where('source', source)

    const [rows, countResult] = await Promise.all([
      q.clone().orderBy('session_date', 'desc').limit(Number(limit)).offset(Number(offset)),
      q.clone().count('* as count').first(),
    ])

    return { rows, count: Number(countResult?.count ?? 0) }
  }

  async findOne(id: string, userId: string) {
    const session = await this.knex('running_sessions').where({ id, user_id: userId }).first()
    if (!session) throw new NotFoundException('Séance running non trouvée')
    return session
  }

  async getStats(userId: string) {
    const [agg, breakdown] = await Promise.all([
      this.knex('running_sessions')
        .where('user_id', userId)
        .select(
          this.knex.raw('COUNT(*) as total_sessions'),
          this.knex.raw('COALESCE(SUM(distance_km), 0) as total_km'),
          this.knex.raw('COALESCE(SUM(duration_seconds), 0) as total_seconds'),
          this.knex.raw('AVG(avg_pace_seconds_per_km) as avg_pace'),
          this.knex.raw('COALESCE(MAX(distance_km), 0) as longest_run_km'),
        )
        .first(),
      this.knex('running_sessions')
        .select('run_type')
        .count('* as count')
        .where('user_id', userId)
        .groupBy('run_type'),
    ])

    const typeBreakdown = breakdown.reduce<Record<string, number>>((acc, row) => {
      acc[row.run_type] = Number(row.count)
      return acc
    }, {})

    return {
      total_sessions: Number(agg.total_sessions),
      total_km: Math.round(Number(agg.total_km) * 10) / 10,
      total_hours: Math.round((Number(agg.total_seconds) / 3600) * 10) / 10,
      avg_pace_seconds_per_km: agg.avg_pace ? Math.round(Number(agg.avg_pace)) : null,
      longest_run_km: Math.round(Number(agg.longest_run_km) * 10) / 10,
      type_breakdown: typeBreakdown,
    }
  }

  async create(userId: string, data: CreateRunningSessionDto) {
    const [session] = await this.knex('running_sessions')
      .insert({ user_id: userId, source: 'manual', ...data })
      .returning('*')
    return session
  }

  async createFromAIPlan(userId: string, plan: GeneratedRunningPlanValidated, scheduledActivityId?: string) {
    const [session] = await this.knex('running_sessions')
      .insert({
        user_id: userId,
        session_date: new Date().toISOString().slice(0, 10),
        run_type: plan.run_type,
        source: 'ai_generated',
        distance_km: plan.total_distance_km,
        duration_seconds: plan.estimated_duration_minutes * 60,
        ai_plan: JSON.stringify(plan),
        scheduled_activity_id: scheduledActivityId || null,
      })
      .returning('*')
    return session
  }

  async generateAndSave(userId: string, params: GenerateRunningSessionDto) {
    const plan = await this.aiGenerator.generateRunningSession(userId, params)
    return this.createFromAIPlan(userId, plan)
  }

  async generatePreview(userId: string, params: GenerateRunningSessionDto): Promise<GeneratedRunningPlanValidated> {
    return this.aiGenerator.generateRunningSession(userId, params)
  }

  async update(id: string, userId: string, data: UpdateRunningSessionDto) {
    const existing = await this.findOne(id, userId)

    const [updated] = await this.knex('running_sessions')
      .where({ id, user_id: userId })
      .update({ ...data, updated_at: new Date() })
      .returning('*')

    return updated ?? existing
  }

  async delete(id: string, userId: string) {
    const deleted = await this.knex('running_sessions').where({ id, user_id: userId }).delete()
    if (deleted === 0) throw new NotFoundException('Séance running non trouvée')
    return { success: true }
  }
}
