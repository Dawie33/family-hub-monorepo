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

  private pickVariationSeed(recentNames: string[]): string {
    const axes = [
      'Accent sur la Zone Force — varie les soulevés et les schémas de répétitions par rapport aux séances précédentes',
      'Accent sur la Zone Endurance — format cardio pur différent (pas toujours run+row)',
      'Accent sur le MetCon X — format CHIPPER avec mouvements différents des dernières séances',
      'Séance force-endurance enchaînée — transitions courtes entre les blocs pour simuler la fatigue compétition',
      'Volume élevé sur les mouvements olympiques — snatch, clean & jerk, overhead',
      'Focus métabolique lactique — efforts 85-95%, repos courts, fréquence cardiaque haute',
      'Séance de vitesse et puissance — charges légères mais mouvements explosifs',
      'Simulation tactique — adapter le pacing et la stratégie de chaque zone',
      'Travail des points faibles — exercices accessoires ciblés, mouvements techniques',
      'Format compétition condensé — toutes les zones en moins de temps, intensité augmentée',
    ]
    const idx = (recentNames.length + new Date().getHours()) % axes.length
    return axes[idx]
  }

  async generateAthxSession(userId: string, params: GenerateAthxSessionDto, recentSessionNames: string[] = [], recentEnduranceExercises: string[] = []): Promise<GeneratedAthxPlanValidated> {
    const ctx = await this.userContextService.getUserAIContext(userId)

    try {
      // En mode 'saved' profil vide → on force une liste minimale poids du corps
      // pour que hasEquipmentConstraint soit true et que les machines cardio soient bloquées
      const HOME_BODYWEIGHT: string[] = ['bodyweight', 'jump-rope']

      const equipmentAvailable = params.equipment_mode === 'official'
        ? undefined
        : params.equipment_mode === 'saved'
          ? (ctx.equipment_available.length > 0 ? ctx.equipment_available : HOME_BODYWEIGHT)
          : (params.equipment_available ?? ctx.equipment_available)

      const isHomeMode = params.equipment_mode === 'saved'

      const variationSeed = this.pickVariationSeed(recentSessionNames)

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: buildAthxSystemPrompt(equipmentAvailable, isHomeMode) },
          {
            role: 'user',
            content: buildAthxUserPrompt({
              ...params,
              userLevel: ctx.sport_level,
              oneRepMaxes: ctx.oneRepMaxes,
              equipmentAvailable,
              injuries: ctx.injuries,
              recentSessionNames,
              recentEnduranceExercises,
              variationSeed,
              trainingLocation: params.equipment_mode === 'official' ? 'Box ATHX' : 'Maison / extérieur',
            }),
          },
        ],
        temperature: 0.9,
        max_tokens: 4096,
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
