import { BadRequestException, Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { ZodError } from 'zod'
import { UserContextService } from 'src/workouts/services/user-context.service'
import { GenerateProgramDto } from './dto/generate-program.dto'
import {
  buildProgramGeneratorSystemPrompt,
  buildProgramGeneratorUserPrompt,
} from './prompts/program-generator.prompt'
import { GeneratedProgramSchema, GeneratedProgramValidated } from './schemas/program.schema'

@Injectable()
export class AIProgramGeneratorService {
  private openai: OpenAI

  constructor(private readonly userContextService: UserContextService) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async generateProgram(userId: string, params: GenerateProgramDto): Promise<GeneratedProgramValidated> {
    try {
      const context = await this.userContextService.getUserAIContext(userId)

      const systemPrompt = buildProgramGeneratorSystemPrompt()
      const userPrompt = buildProgramGeneratorUserPrompt(params, context)

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new BadRequestException("Pas de réponse de l'IA")
      }

      const programData = JSON.parse(content)
      const validatedProgram = GeneratedProgramSchema.parse(programData)

      return validatedProgram
    } catch (error) {
      console.error('Error generating training program with AI:', error)

      if (error instanceof SyntaxError) {
        throw new BadRequestException("L'IA a généré un JSON invalide")
      }

      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`Validation du programme échouée : ${errorMessages}`)
      }

      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException(`Échec de la génération du programme : ${(error as Error).message}`)
    }
  }
}
