import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { AIProgramGeneratorService } from './ai-program-generator.service'
import { CreateProgramDto } from './dto/create-program.dto'
import { GenerateProgramDto } from './dto/generate-program.dto'
import { ScheduleWeekDto, SwapSessionDto, UpdateEnrollmentDto } from './dto/update-enrollment.dto'
import { TrainingProgramsService } from './training-programs.service'

@Controller('training-programs')
@UseGuards(JwtAuthGuard)
export class TrainingProgramsController {
  constructor(
    private readonly service: TrainingProgramsService,
    private readonly aiGenerator: AIProgramGeneratorService,
  ) {}

  // --- Routes statiques (avant les routes paramétrées) ---

  /**
   * POST /api/training-programs/generate-ai
   * Génère un programme avec l'IA (aperçu sans sauvegarde)
   */
  @Post('generate-ai')
  async generateWithAI(@Request() req: { user: { id: string } }, @Body() dto: GenerateProgramDto) {
    return this.aiGenerator.generateProgram(req.user.id, dto)
  }

  /**
   * POST /api/training-programs
   * Sauvegarde le programme généré et inscrit l'utilisateur
   */
  @Post()
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreateProgramDto) {
    return this.service.createAndEnroll(req.user.id, dto)
  }

  /**
   * GET /api/training-programs/active
   * Récupère le programme actif de l'utilisateur
   */
  @Get('active')
  async getActive(@Request() req: { user: { id: string } }) {
    return this.service.getActiveEnrollment(req.user.id)
  }

  // --- Routes d'enrollment ---

  /**
   * PATCH /api/training-programs/enrollments/:id/start
   */
  @Patch('enrollments/:id/start')
  async start(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.updateEnrollment(id, req.user.id, { status: 'active' })
  }

  /**
   * PATCH /api/training-programs/enrollments/:id/pause
   */
  @Patch('enrollments/:id/pause')
  async pause(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.updateEnrollment(id, req.user.id, { status: 'paused' })
  }

  /**
   * PATCH /api/training-programs/enrollments/:id/abandon
   */
  @Patch('enrollments/:id/abandon')
  async abandon(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.updateEnrollment(id, req.user.id, { status: 'abandoned' })
  }

  /**
   * PATCH /api/training-programs/enrollments/:id
   * Mise à jour générale (semaine courante, statut)
   */
  @Patch('enrollments/:id')
  async updateEnrollment(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.service.updateEnrollment(id, req.user.id, dto)
  }

  /**
   * GET /api/training-programs/enrollments/:id/week/:weekNum
   * Sessions d'une semaine donnée avec customisations appliquées
   */
  @Get('enrollments/:id/week/:weekNum')
  async getWeek(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('weekNum', ParseIntPipe) weekNum: number,
  ) {
    return this.service.getWeekSessions(id, req.user.id, weekNum)
  }

  /**
   * POST /api/training-programs/enrollments/:id/schedule-week
   * Planifie les sessions d'une semaine dans le calendrier
   */
  @Post('enrollments/:id/schedule-week')
  async scheduleWeek(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: ScheduleWeekDto,
  ) {
    return this.service.scheduleWeek(id, req.user.id, dto)
  }

  /**
   * PATCH /api/training-programs/enrollments/:id/sessions/:sessionInWeek/swap
   * Swap d'une session (workout entier ou exercice individuel)
   * Query param: ?week=1
   */
  @Patch('enrollments/:id/sessions/:sessionInWeek/swap')
  async swapSession(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('sessionInWeek', ParseIntPipe) sessionInWeek: number,
    @Body() dto: SwapSessionDto & { week: number },
  ) {
    const weekNum = dto.week
    if (!weekNum) {
      throw new Error('week requis dans le body')
    }
    return this.service.swapSession(id, req.user.id, weekNum, sessionInWeek, dto)
  }

  /**
   * GET /api/training-programs/enrollments/:id/check-week-progress
   * Vérifie si toutes les sessions de la semaine courante sont complètes
   */
  @Get('enrollments/:id/check-week-progress')
  async checkWeekProgress(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.service.checkAndAdvanceWeek(id, req.user.id)
  }
}
