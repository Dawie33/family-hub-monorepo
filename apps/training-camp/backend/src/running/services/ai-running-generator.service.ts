import { BadRequestException, Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { UserContextService } from 'src/workouts/services/user-context.service'
import { GenerateRunningSessionDto } from '../dto/running.dto'
import { buildRunningSystemPrompt, buildRunningUserPrompt } from '../prompts/running-generator.prompt'
import { GeneratedRunningPlanSchema, GeneratedRunningPlanValidated } from '../schemas/running.schema'

@Injectable()
export class AIRunningGeneratorService {
  private openai: OpenAI

  constructor(
    @InjectModel() private readonly knex: Knex,
    private readonly userContextService: UserContextService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set')
    this.openai = new OpenAI({ apiKey })
  }

  async generateRunningSession(userId: string, params: GenerateRunningSessionDto): Promise<GeneratedRunningPlanValidated> {
    const [ctx, recentRunningSessions] = await Promise.all([
      this.userContextService.getUserAIContext(userId),
      this.knex('running_sessions')
        .select('distance_km', 'run_type')
        .where('user_id', userId)
        .orderBy('session_date', 'desc')
        .limit(5),
    ])

    const systemPrompt = buildRunningSystemPrompt()
    const userPrompt = buildRunningUserPrompt({
      ...params,
      userLevel: ctx.sport_level,
      recentSessions: recentRunningSessions,
      injuries: ctx.injuries,
      physicalLimitations: ctx.physical_limitations,
      trainingPreferences: ctx.training_preferences,
    })

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new BadRequestException('No response from AI')

      const parsed = JSON.parse(content)
      return GeneratedRunningPlanSchema.parse(parsed)
    } catch (error) {
      if (error instanceof SyntaxError) throw new BadRequestException('AI generated invalid JSON')
      if (error instanceof ZodError) {
        const msg = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`Running plan validation failed: ${msg}`)
      }
      throw new BadRequestException(`Failed to generate running session: ${(error as Error).message}`)
    }
  }
}
