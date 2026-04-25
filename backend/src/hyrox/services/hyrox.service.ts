import { Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import { CreateHyroxSessionDto, GenerateHyroxSessionDto, HyroxSessionQueryDto, HYROX_STATIONS, UpdateHyroxSessionDto } from '../dto/hyrox.dto'
import { AIHyroxGeneratorService } from './ai-hyrox-generator.service'

@Injectable()
export class HyroxService {
  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly aiGenerator: AIHyroxGeneratorService,
  ) {}

  async findAll(userId: string, query: HyroxSessionQueryDto) {
    const { limit = '20', offset = '0', start_date, end_date, session_type } = query
    let q = this.knex('hyrox_sessions').where('user_id', userId)
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
    const session = await this.knex('hyrox_sessions').where({ id, user_id: userId }).first()
    if (!session) throw new NotFoundException('Séance HYROX non trouvée')
    return session
  }

  async getStats(userId: string) {
    const [agg, stationRows] = await Promise.all([
      this.knex('hyrox_sessions')
        .where('user_id', userId)
        .select(
          this.knex.raw('COUNT(*) as total_sessions'),
          this.knex.raw(`COUNT(*) FILTER (WHERE session_type = 'full_simulation' AND total_time_seconds IS NOT NULL) as total_simulations`),
          this.knex.raw(`MIN(total_time_seconds) FILTER (WHERE session_type = 'full_simulation' AND total_time_seconds IS NOT NULL) as best_time`),
          this.knex.raw(`ROUND(AVG(total_time_seconds) FILTER (WHERE session_type = 'full_simulation' AND total_time_seconds IS NOT NULL)) as avg_time`),
        )
        .first(),
      // Seulement la colonne station_times pour calculer les PRs
      this.knex('hyrox_sessions')
        .select('station_times')
        .where('user_id', userId)
        .whereNotNull('station_times'),
    ])

    // PRs par station — JSONB oblige un calcul JS, mais on ne charge qu'une seule colonne
    const stationPrs: Record<string, number | null> = {}
    for (const station of HYROX_STATIONS) {
      const times: number[] = []
      for (const row of stationRows) {
        const stationTimes = row.station_times as { station: string; time_seconds: number }[] | null
        const found = stationTimes?.find((s) => s.station === station)
        if (found?.time_seconds) times.push(found.time_seconds)
      }
      stationPrs[station] = times.length ? Math.min(...times) : null
    }

    return {
      total_sessions: Number(agg.total_sessions),
      total_simulations: Number(agg.total_simulations),
      best_time_seconds: agg.best_time ? Number(agg.best_time) : null,
      avg_time_seconds: agg.avg_time ? Number(agg.avg_time) : null,
      station_prs: stationPrs,
    }
  }

  async create(userId: string, data: CreateHyroxSessionDto) {
    const [session] = await this.knex('hyrox_sessions')
      .insert({
        user_id: userId,
        source: 'manual',
        ...data,
        run_times: data.run_times ? JSON.stringify(data.run_times) : null,
        station_times: data.station_times ? JSON.stringify(data.station_times) : null,
        equipment_available: data.equipment_available ? JSON.stringify(data.equipment_available) : null,
      })
      .returning('*')
    return session
  }

  async generatePreview(userId: string, params: GenerateHyroxSessionDto) {
    return this.aiGenerator.generateHyroxSession(userId, params)
  }

  async generateAndSave(userId: string, params: GenerateHyroxSessionDto) {
    const plan = await this.aiGenerator.generateHyroxSession(userId, params)
    const [session] = await this.knex('hyrox_sessions')
      .insert({
        user_id: userId,
        session_date: new Date().toISOString().slice(0, 10),
        session_type: plan.session_type,
        source: 'ai_generated',
        duration_minutes: plan.duration_minutes,
        equipment_available: params.equipment_available ? JSON.stringify(params.equipment_available) : null,
        ai_plan: JSON.stringify(plan),
      })
      .returning('*')
    return session
  }

  async update(id: string, userId: string, data: UpdateHyroxSessionDto) {
    await this.findOne(id, userId)
    const [updated] = await this.knex('hyrox_sessions')
      .where({ id, user_id: userId })
      .update({
        ...data,
        run_times: data.run_times ? JSON.stringify(data.run_times) : undefined,
        station_times: data.station_times ? JSON.stringify(data.station_times) : undefined,
        updated_at: new Date(),
      })
      .returning('*')
    return updated
  }

  async delete(id: string, userId: string) {
    const deleted = await this.knex('hyrox_sessions').where({ id, user_id: userId }).delete()
    if (deleted === 0) throw new NotFoundException('Séance HYROX non trouvée')
    return { success: true }
  }
}
