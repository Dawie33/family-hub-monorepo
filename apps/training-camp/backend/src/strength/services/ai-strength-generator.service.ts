import { BadRequestException, Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { UserContextService } from '../../workouts/services/user-context.service'
import { GenerateStrengthSessionDto } from '../dto/strength.dto'
import { buildStrengthSystemPrompt, buildStrengthUserPrompt } from '../prompts/strength-generator.prompt'
import {
  GeneratedStrengthSession,
  GeneratedStrengthSessionSchema,
} from '../schemas/strength-session.schema'

@Injectable()
export class AIStrengthGeneratorService {
  private openai: OpenAI

  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly userContextService: UserContextService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async generateSession(userId: string, dto: GenerateStrengthSessionDto): Promise<GeneratedStrengthSession> {
    const [ctx, recentStrengthSessions] = await Promise.all([
      this.userContextService.getUserAIContext(userId),
      this.knex('strength_sessions')
        .select('target_muscles', 'session_date', 'session_goal', 'perceived_effort', 'duration_minutes')
        .where('user_id', userId)
        .orderBy('session_date', 'desc')
        .limit(5),
    ])

    const userLevel = dto.userLevel ?? ctx.sport_level ?? 'intermediate'

    // Équipements : ceux du DTO en priorité, sinon profil utilisateur
    const availableEquipment =
      dto.availableEquipment && dto.availableEquipment.length > 0
        ? dto.availableEquipment
        : ctx.equipment_available

    // Muscles récemment travaillés pour éviter la surcharge
    const recentMusclesWorked: string[] = []
    for (const s of recentStrengthSessions) {
      const muscles = Array.isArray(s.target_muscles) ? s.target_muscles : []
      recentMusclesWorked.push(...muscles)
    }

    try {
      const systemPrompt = buildStrengthSystemPrompt()
      const userPrompt = buildStrengthUserPrompt({
        targetMuscles: dto.targetMuscles,
        sessionGoal: dto.sessionGoal,
        userLevel,
        availableEquipment,
        recentMusclesWorked: [...new Set(recentMusclesWorked)],
        recentStrengthSessions: recentStrengthSessions.map(s => ({
          session_date: s.session_date,
          session_goal: s.session_goal,
          target_muscles: Array.isArray(s.target_muscles) ? s.target_muscles : [],
          perceived_effort: s.perceived_effort ?? undefined,
          duration_minutes: s.duration_minutes ?? undefined,
        })),
        oneRepMaxes: ctx.oneRepMaxes,
        injuries: ctx.injuries,
        physicalLimitations: ctx.physical_limitations,
        additionalContext: dto.additionalContext,
        targetDurationMinutes: dto.targetDurationMinutes,
      })

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new BadRequestException('Pas de réponse de l\'IA')

      const sessionData = JSON.parse(content)
      return GeneratedStrengthSessionSchema.parse(sessionData)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('L\'IA a généré un JSON invalide')
      }
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`Validation de la séance échouée : ${messages}`)
      }
      throw new BadRequestException(`Impossible de générer la séance : ${(error as Error).message}`)
    }
  }
}
