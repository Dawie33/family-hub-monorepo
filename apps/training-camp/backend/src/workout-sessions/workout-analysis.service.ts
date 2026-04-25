import { Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectConnection } from 'nest-knexjs'
import OpenAI from 'openai'

export interface WodAnalysis {
  summary: string
  performance_level: 'pr' | 'above_average' | 'average' | 'below_average' | 'first_time'
  comparison: string | null
  strengths: string[]
  improvements: string[]
  next_steps: string
}

@Injectable()
export class WorkoutAnalysisService {
  private openai: OpenAI

  constructor(@InjectConnection() private readonly knex: Knex) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
    this.openai = new OpenAI({ apiKey })
  }

  async analyzeSession(sessionId: string, userId: string, force = false): Promise<WodAnalysis> {
    // 1. Récupérer la session
    const session = await this.knex('workout_sessions')
      .where({ id: sessionId, user_id: userId })
      .first()

    if (!session) throw new Error('Session not found')

    // Retourner l'analyse déjà stockée en DB si elle existe et qu'on ne force pas la régénération
    if (!force && session.ai_analysis) {
      const stored = typeof session.ai_analysis === 'string'
        ? JSON.parse(session.ai_analysis)
        : session.ai_analysis
      return stored as WodAnalysis
    }

    // 2. Récupérer le workout associé
    let workout: Record<string, unknown> | null = null
    if (session.workout_id) {
      workout = await this.knex('workouts').where({ id: session.workout_id }).first() ?? null
    } else if (session.personalized_workout_id) {
      workout = await this.knex('personalized_workouts').where({ id: session.personalized_workout_id }).first() ?? null
    }

    // 3. Récupérer les sessions passées pour le même workout (pour comparaison)
    const pastSessions: Record<string, unknown>[] = []
    if (session.workout_id) {
      const rows = await this.knex('workout_sessions')
        .where({ workout_id: session.workout_id, user_id: userId })
        .whereNot({ id: sessionId })
        .whereNotNull('completed_at')
        .orderBy('started_at', 'desc')
        .limit(5)
      pastSessions.push(...rows)
    }

    // 4. Construire le prompt
    const results = session.results as Record<string, unknown> ?? {}
    const workoutName = (workout?.name as string) ?? 'Workout inconnu'
    const workoutType = (workout?.workout_type as string) ?? 'mixed'

    const scoreDescription = this.buildScoreDescription(results, workoutType)
    const pastPerfsDescription = this.buildPastPerfsDescription(pastSessions, workoutType)
    const workoutDescription = this.buildWorkoutDescription(workout)

    const prompt = `Tu es un coach CrossFit expert. Analyse la performance suivante et donne un retour constructif et motivant.

**Workout : ${workoutName}** (${workoutType})
${workoutDescription}

**Performance actuelle :**
${scoreDescription}
- RX : ${results.rx ? 'Oui' : 'Non (Scaled)'}
${session.notes ? `- Notes de l'athlète : "${session.notes}"` : ''}

**Historique des performances sur ce workout :**
${pastPerfsDescription}

Réponds en JSON avec exactement cette structure :
{
  "summary": "Résumé concis de la performance en 1-2 phrases",
  "performance_level": "pr | above_average | average | below_average | first_time",
  "comparison": "Comparaison avec les perfs passées (null si première fois)",
  "strengths": ["Point fort 1", "Point fort 2"],
  "improvements": ["Axe d'amélioration 1", "Axe d'amélioration 2"],
  "next_steps": "Conseil concret pour progresser sur ce workout"
}`

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const analysis = JSON.parse(content) as WodAnalysis

    await this.knex('workout_sessions')
      .where({ id: sessionId })
      .update({ ai_analysis: JSON.stringify(analysis) })

    return analysis
  }

  private buildScoreDescription(results: Record<string, unknown>, workoutType: string): string {
    if (results.cap_reached) {
      const parts = [`- Cap atteint (DNF)`]
      if (results.reps_at_cap) parts.push(`- Score : ${results.reps_at_cap} reps au cap`)
      if (results.cap_description) parts.push(`- Où : ${results.cap_description}`)
      return parts.join('\n')
    }
    if (results.elapsed_time_seconds) {
      const secs = results.elapsed_time_seconds as number
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `- Temps : ${m}m${s > 0 ? `${s}s` : ''}`
    }
    if (workoutType === 'amrap' && (results.rounds || results.reps)) {
      return `- Score AMRAP : ${results.rounds ?? 0} rounds + ${results.reps ?? 0} reps`
    }
    return '- Workout complété (score libre)'
  }

  private buildPastPerfsDescription(sessions: Record<string, unknown>[], workoutType: string): string {
    if (sessions.length === 0) return 'Première fois sur ce workout.'

    const lines = sessions.map((s, i) => {
      const r = (s.results as Record<string, unknown>) ?? {}
      const date = new Date(s.started_at as string).toLocaleDateString('fr-FR')
      const score = this.buildScoreDescription(r, workoutType)
        .replace(/\n/g, ', ')
        .replace(/- /g, '')
      const rx = r.rx ? 'RX' : 'Scaled'
      return `${i + 1}. ${date} — ${score} (${rx})`
    })

    return lines.join('\n')
  }

  private buildWorkoutDescription(workout: Record<string, unknown> | null): string {
    if (!workout) return ''
    const blocks = workout.blocks as Record<string, unknown> | null
    if (!blocks) return ''
    const sections = blocks.sections as Array<Record<string, unknown>> | null
    if (!sections?.length) return ''

    const lines: string[] = []
    for (const section of sections) {
      lines.push(`- ${section.title ?? section.type}`)
      const exercises = section.exercises as Array<Record<string, unknown>> | null
      if (exercises?.length) {
        for (const ex of exercises) {
          const reps = ex.reps ? `${ex.reps} ` : ''
          const weight = ex.weight ? ` @ ${ex.weight}` : ''
          lines.push(`  • ${reps}${ex.name}${weight}`)
        }
      }
    }
    return lines.join('\n')
  }
}
