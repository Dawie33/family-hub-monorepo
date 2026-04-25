import { Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import { AthxSessionQueryDto, CreateAthxSessionDto, GenerateAthxSessionDto, UpdateAthxSessionDto } from '../dto/athx.dto'
import { AIAthxGeneratorService } from './ai-athx-generator.service'

@Injectable()
export class AthxService {
  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly aiGenerator: AIAthxGeneratorService,
  ) {}

  async findAll(userId: string, query: AthxSessionQueryDto) {
    const { limit = '20', offset = '0', start_date, end_date, session_type } = query
    let q = this.knex('athx_sessions').where('user_id', userId)
    if (start_date) q = q.where('session_date', '>=', start_date)
    if (end_date) q = q.where('session_date', '<=', end_date)
    if (session_type) q = q.where('session_type', session_type)
    const [rows, countResult] = await Promise.all([
      q.clone().orderBy('session_date', 'desc').limit(Number(limit)).offset(Number(offset)),
      q.clone().count('* as count').first(),
    ])
    return { rows, count: Number(countResult?.count ?? 0) }
  }

  async findOne(id: string, userId: string) {
    const session = await this.knex('athx_sessions').where({ id, user_id: userId }).first()
    if (!session) throw new NotFoundException('Séance ATHX non trouvée')
    return session
  }

  async getStats(userId: string) {
    const [agg, breakdown] = await Promise.all([
      this.knex('athx_sessions')
        .where('user_id', userId)
        .select(
          this.knex.raw('COUNT(*) as total_sessions'),
          this.knex.raw('COALESCE(SUM(duration_minutes), 0) as total_minutes'),
          this.knex.raw('AVG(perceived_effort) as avg_effort'),
        )
        .first(),
      this.knex('athx_sessions')
        .select('session_type')
        .count('* as count')
        .where('user_id', userId)
        .groupBy('session_type'),
    ])

    const typeBreakdown = breakdown.reduce<Record<string, number>>((acc, row) => {
      acc[row.session_type] = Number(row.count)
      return acc
    }, {})

    return {
      total_sessions: Number(agg.total_sessions),
      total_hours: Math.round((Number(agg.total_minutes) / 60) * 10) / 10,
      type_breakdown: typeBreakdown,
      avg_effort: agg.avg_effort ? Math.round(Number(agg.avg_effort) * 10) / 10 : null,
    }
  }

  async create(userId: string, data: CreateAthxSessionDto) {
    const [session] = await this.knex('athx_sessions')
      .insert({ user_id: userId, source: 'manual', ...data, zone_results: data.zone_results ? JSON.stringify(data.zone_results) : null })
      .returning('*')
    return session
  }

  async generatePreview(userId: string, params: GenerateAthxSessionDto) {
    return this.aiGenerator.generateAthxSession(userId, params)
  }

  async generateAndSave(userId: string, params: GenerateAthxSessionDto) {
    const plan = await this.aiGenerator.generateAthxSession(userId, params)
    const scheduledDate = params.scheduled_date ?? new Date().toISOString().slice(0, 10)

    const [session] = await this.knex('athx_sessions')
      .insert({
        user_id: userId,
        session_date: scheduledDate,
        session_type: plan.session_type,
        source: 'ai_generated',
        duration_minutes: plan.duration_minutes,
        ai_plan: JSON.stringify(plan),
      })
      .returning('*')

    // Planifier dans le calendrier
    await this.knex('scheduled_activities').insert({
      user_id: userId,
      scheduled_date: scheduledDate,
      activity_type: 'athx',
      activity_id: session.id,
      status: 'scheduled',
    })

    return session
  }

  async update(id: string, userId: string, data: UpdateAthxSessionDto) {
    await this.findOne(id, userId)
    const [updated] = await this.knex('athx_sessions')
      .where({ id, user_id: userId })
      .update({ ...data, zone_results: data.zone_results ? JSON.stringify(data.zone_results) : undefined, updated_at: new Date() })
      .returning('*')
    return updated
  }

  async delete(id: string, userId: string) {
    const deleted = await this.knex('athx_sessions').where({ id, user_id: userId }).delete()
    if (deleted === 0) throw new NotFoundException('Séance ATHX non trouvée')
    return { success: true }
  }
}
