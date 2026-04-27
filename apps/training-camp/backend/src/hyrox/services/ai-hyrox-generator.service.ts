import { BadRequestException, Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { UserContextService } from 'src/workouts/services/user-context.service'
import { GenerateHyroxSessionDto } from '../dto/hyrox.dto'
import { buildHyroxSystemPrompt, buildHyroxUserPrompt } from '../prompts/hyrox-generator.prompt'
import { GeneratedHyroxPlanSchema, GeneratedHyroxPlanValidated } from '../schemas/hyrox.schema'

@Injectable()
export class AIHyroxGeneratorService {
  private openai: OpenAI

  constructor(private readonly userContextService: UserContextService) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set')
    this.openai = new OpenAI({ apiKey })
  }

  async generateHyroxSession(userId: string, params: GenerateHyroxSessionDto, recentSessionNames: string[] = []): Promise<GeneratedHyroxPlanValidated> {
    const ctx = await this.userContextService.getUserAIContext(userId)

    // Résolution de l'équipement selon le mode choisi
    let resolvedEquipment: string[] | undefined
    if (params.equipment_mode === 'official') {
      resolvedEquipment = undefined
    } else if (params.equipment_mode === 'saved') {
      resolvedEquipment = ctx.equipment_available.length > 0 ? ctx.equipment_available : undefined
    } else {
      resolvedEquipment = params.equipment_available?.length ? params.equipment_available : undefined
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: buildHyroxSystemPrompt() },
          {
            role: 'user',
            content: buildHyroxUserPrompt({
              ...params,
              userLevel: ctx.sport_level,
              injuries: ctx.injuries,
              resolvedEquipment,
              isOfficialMode: params.equipment_mode === 'official',
              recentSessionNames,
            }),
          },
        ],
        temperature: 0.9,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new BadRequestException('No response from AI')

      return GeneratedHyroxPlanSchema.parse(JSON.parse(content))
    } catch (error) {
      if (error instanceof SyntaxError) throw new BadRequestException('AI generated invalid JSON')
      if (error instanceof ZodError) {
        const msg = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`HYROX plan validation failed: ${msg}`)
      }
      throw new BadRequestException(`Failed to generate HYROX session: ${(error as Error).message}`)
    }
  }
}
