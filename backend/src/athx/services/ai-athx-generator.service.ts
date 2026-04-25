import { BadRequestException, Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { UserContextService } from 'src/workouts/services/user-context.service'
import { GenerateAthxSessionDto } from '../dto/athx.dto'
import { buildAthxSystemPrompt, buildAthxUserPrompt } from '../prompts/athx-generator.prompt'
import { GeneratedAthxPlanSchema, GeneratedAthxPlanValidated } from '../schemas/athx.schema'

@Injectable()
export class AIAthxGeneratorService {
  private openai: OpenAI

  constructor(private readonly userContextService: UserContextService) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set')
    this.openai = new OpenAI({ apiKey })
  }

  async generateAthxSession(userId: string, params: GenerateAthxSessionDto): Promise<GeneratedAthxPlanValidated> {
    const ctx = await this.userContextService.getUserAIContext(userId)

    try {
      const equipmentAvailable = params.equipment_available ?? ctx.equipment_available
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: buildAthxSystemPrompt(equipmentAvailable) },
          {
            role: 'user',
            content: buildAthxUserPrompt({
              ...params,
              userLevel: ctx.sport_level,
              oneRepMaxes: ctx.oneRepMaxes,
              equipmentAvailable,
              injuries: ctx.injuries,
            }),
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new BadRequestException('No response from AI')

      return GeneratedAthxPlanSchema.parse(JSON.parse(content))
    } catch (error) {
      if (error instanceof SyntaxError) throw new BadRequestException('AI generated invalid JSON')
      if (error instanceof ZodError) {
        const msg = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`ATHX plan validation failed: ${msg}`)
      }
      throw new BadRequestException(`Failed to generate ATHX session: ${(error as Error).message}`)
    }
  }
}
