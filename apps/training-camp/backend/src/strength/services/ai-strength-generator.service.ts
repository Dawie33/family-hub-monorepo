import { BadRequestException, Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { GenerateStrengthSessionDto } from '../dto/strength.dto'
import { buildStrengthSystemPrompt, buildStrengthUserPrompt } from '../prompts/strength-generator.prompt'
import {
  GeneratedStrengthSession,
  GeneratedStrengthSessionSchema,
} from '../schemas/strength-session.schema'

@Injectable()
export class AIStrengthGeneratorService {
  private openai: OpenAI

  constructor(@InjectModel() private readonly knex: Knex) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async generateSession(userId: string, dto: GenerateStrengthSessionDto): Promise<GeneratedStrengthSession> {
    const [profile, recentSessions] = await Promise.all([
      this.knex('users')
        .select('sport_level', 'equipment_available')
        .where('id', userId)
        .first(),
      this.knex('strength_sessions')
        .select('target_muscles', 'session_date')
        .where('user_id', userId)
        .orderBy('session_date', 'desc')
        .limit(3),
    ])

    const userLevel = dto.userLevel ?? profile?.sport_level ?? 'intermediate'

    // Équipements : ceux du DTO en priorité, sinon profil utilisateur
    const availableEquipment =
      dto.availableEquipment && dto.availableEquipment.length > 0
        ? dto.availableEquipment
        : (profile?.equipment_available ?? [])

    // Muscles récemment travaillés pour éviter la surcharge
    const recentMusclesWorked: string[] = []
    for (const s of recentSessions) {
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
        additionalContext: dto.additionalContext,
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
