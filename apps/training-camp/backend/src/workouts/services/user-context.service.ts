import { Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'

export interface RecentAnalysis {
  date: string
  workout_name: string
  performance_level: 'pr' | 'above_average' | 'average' | 'below_average' | 'first_time'
  strengths: string[]
  improvements: string[]
  next_steps: string
}

export interface ActiveSkillContext {
  program_id: string
  skill_name: string
  skill_category: string
  step_id: string
  step_title: string
  step_description?: string
  recommended_exercises: Array<{ name: string; sets?: number; reps?: string | number; rest?: string; intensity?: string; notes?: string }>
  coaching_tips?: string
  last_trained: string | null // ISO date ou null si jamais travaillé
}

export interface UserAIContext {
  sport_level: string
  height?: number
  weight?: number
  oneRepMaxes: { lift: string; value: number }[]
  benchmarkResults: Record<string, { result: Record<string, number | string>; date: string }>
  global_goals: Record<string, boolean>
  injuries: Record<string, unknown>
  physical_limitations: Record<string, unknown>
  equipment_available: string[]
  training_preferences: { preferred_duration?: number; sessions_per_week?: number }
  recentSessions: {
    date: string
    workout_type?: string
    duration_minutes: number
    perceived_effort?: number
  }[]
  recentAnalyses: RecentAnalysis[]
  activeSkills: ActiveSkillContext[]
}

@Injectable()
export class UserContextService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  async getUserAIContext(userId: string): Promise<UserAIContext> {
    const [profile, oneRepMaxes, recentSessions, recentAnalysesRaw, activeSkillsRaw] = await Promise.all([
      this.knex('users')
        .select(
          'sport_level',
          'height',
          'weight',
          'body_fat_percentage',
          'benchmark_results',
          'injuries',
          'physical_limitations',
          'global_goals',
          'equipment_available',
          'training_preferences',
        )
        .where('id', userId)
        .first(),

      this.knex('one_rep_maxes').select('lift', 'value').where('user_id', userId).orderBy('lift'),

      this.knex('workout_sessions as ws')
        .leftJoin('workouts as w', 'ws.workout_id', 'w.id')
        .leftJoin('personalized_workouts as pw', 'ws.personalized_workout_id', 'pw.id')
        .select(
          'ws.started_at',
          'ws.completed_at',
          this.knex.raw("ws.results->>'perceived_effort' as perceived_effort"),
          this.knex.raw("COALESCE(w.workout_type, pw.plan_json->>'workout_type') as workout_type"),
        )
        .where('ws.user_id', userId)
        .whereNotNull('ws.completed_at')
        .whereRaw("ws.started_at >= NOW() - INTERVAL '7 days'")
        .orderBy('ws.started_at', 'desc')
        .limit(10),

      this.knex('workout_sessions as ws')
        .leftJoin('workouts as w', 'ws.workout_id', 'w.id')
        .select('ws.started_at', 'ws.ai_analysis', 'w.name as workout_name')
        .where('ws.user_id', userId)
        .whereNotNull('ws.ai_analysis')
        .orderBy('ws.started_at', 'desc')
        .limit(5),

      this.knex('skill_programs as sp')
        .join('skill_program_steps as sps', function () {
          this.on('sps.program_id', '=', 'sp.id').andOnVal('sps.status', 'in_progress')
        })
        .leftJoin('skill_progress_logs as spl', 'spl.step_id', 'sps.id')
        .where('sp.user_id', userId)
        .where('sp.status', 'active')
        .select(
          'sp.id as program_id',
          'sp.skill_name',
          'sp.skill_category',
          'sps.id as step_id',
          'sps.title as step_title',
          'sps.description as step_description',
          'sps.recommended_exercises',
          'sps.coaching_tips',
          this.knex.raw('MAX(spl.session_date) as last_trained'),
        )
        .groupBy('sp.id', 'sp.skill_name', 'sp.skill_category', 'sps.id', 'sps.title', 'sps.description', 'sps.recommended_exercises', 'sps.coaching_tips'),
    ])

    const recentSessionsMapped = recentSessions.map(
      (s: {
        started_at: string
        completed_at: string
        workout_type?: string
        perceived_effort?: string
      }) => {
        const start = new Date(s.started_at)
        const end = new Date(s.completed_at)
        const duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000)
        return {
          date: start.toISOString().split('T')[0],
          workout_type: s.workout_type ?? undefined,
          duration_minutes,
          perceived_effort: s.perceived_effort ? Number(s.perceived_effort) : undefined,
        }
      },
    )

    const recentAnalyses: RecentAnalysis[] = (recentAnalysesRaw ?? [])
      .map((row: { started_at: string; ai_analysis: unknown; workout_name?: string }) => {
        const a = typeof row.ai_analysis === 'string' ? JSON.parse(row.ai_analysis) : row.ai_analysis
        if (!a) return null
        return {
          date: new Date(row.started_at).toISOString().split('T')[0],
          workout_name: row.workout_name ?? 'Workout inconnu',
          performance_level: a.performance_level,
          strengths: a.strengths ?? [],
          improvements: a.improvements ?? [],
          next_steps: a.next_steps ?? '',
        }
      })
      .filter(Boolean) as RecentAnalysis[]

    const activeSkills: ActiveSkillContext[] = (activeSkillsRaw ?? []).map(
      (row: {
        program_id: string
        skill_name: string
        skill_category: string
        step_id: string
        step_title: string
        step_description?: string
        recommended_exercises: unknown
        coaching_tips?: string
        last_trained: string | null
      }) => ({
        program_id: row.program_id,
        skill_name: row.skill_name,
        skill_category: row.skill_category,
        step_id: row.step_id,
        step_title: row.step_title,
        step_description: row.step_description ?? undefined,
        recommended_exercises: Array.isArray(row.recommended_exercises)
          ? row.recommended_exercises
          : typeof row.recommended_exercises === 'string'
            ? JSON.parse(row.recommended_exercises)
            : [],
        coaching_tips: row.coaching_tips ?? undefined,
        last_trained: row.last_trained ?? null,
      }),
    )

    return {
      sport_level: profile?.sport_level ?? 'intermediate',
      height: profile?.height ?? undefined,
      weight: profile?.weight ?? undefined,
      oneRepMaxes: oneRepMaxes ?? [],
      benchmarkResults: profile?.benchmark_results ?? {},
      global_goals: profile?.global_goals ?? {},
      injuries: profile?.injuries ?? {},
      physical_limitations: profile?.physical_limitations ?? {},
      equipment_available: profile?.equipment_available ?? [],
      training_preferences: profile?.training_preferences ?? {},
      recentSessions: recentSessionsMapped,
      recentAnalyses,
      activeSkills,
    }
  }
}
