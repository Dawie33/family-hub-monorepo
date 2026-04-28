import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import {
  CreateStrengthSessionDto,
  GenerateStrengthSessionDto,
  StrengthSessionQueryDto,
  UpdateStrengthSessionDto,
} from '../dto/strength.dto'
import type { GeneratedStrengthSession } from '../schemas/strength-session.schema'
import { AIStrengthGeneratorService } from '../services/ai-strength-generator.service'
import { StrengthService } from '../services/strength.service'

@Controller('strength')
export class StrengthController {
  constructor(
    private readonly service: StrengthService,
    private readonly aiGenerator: AIStrengthGeneratorService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() query: StrengthSessionQueryDto,
  ) {
    return this.service.findAll(req.user.id, query)
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req: { user: { id: string } }) {
    return this.service.getStats(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.findOne(id, req.user.id)
  }

  // Retourne le plan IA sans sauvegarder
  @Post('generate/preview')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async generatePreview(
    @Body() dto: GenerateStrengthSessionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.aiGenerator.generateSession(req.user.id, dto)
  }

  // Sauvegarde après validation de l'utilisateur (plan existant passé pour éviter un second appel IA)
  @Post('generate/save')
  @UseGuards(JwtAuthGuard)
  async generateAndSave(
    @Body() dto: GenerateStrengthSessionDto,
    @Request() req: { user: { id: string } },
  ) {
    const existingPlan = dto.existingPlan as GeneratedStrengthSession | undefined
    return this.service.generateAndCreate(req.user.id, dto, existingPlan)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateStrengthSessionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.create(req.user.id, dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStrengthSessionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.update(id, req.user.id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.delete(id, req.user.id)
  }
}
