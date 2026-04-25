import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CreateScheduleDto, ScheduleQueryDto, UpdateScheduleDto } from '../dto/schedule.dto'
import { WorkoutScheduleService } from '../services/workout-schedule.service'

@Controller('workout-schedule')
@UseGuards(JwtAuthGuard)
export class WorkoutScheduleController {
  constructor(
    private readonly scheduleService: WorkoutScheduleService
  ) { }

  /**
   * Récupère toutes les planifications de l'utilisateur
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(

    @Request() req: { user: { id: string } },
    @Query() query: ScheduleQueryDto
  ) {
    return this.scheduleService.findAllByUser(req.user.id, query)
  }

  /**
   * Suggère une configuration de semaine basée sur l'historique
   */
  @Get('week-suggestion')
  @UseGuards(JwtAuthGuard)
  async getWeekSuggestion(
    @Request() req: { user: { id: string } },
    @Query('weekStart') weekStart: string,
  ) {
    return this.scheduleService.suggestWeek(req.user.id, weekStart)
  }

  /**
   * Récupère une planification spécifique
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string
  ) {
    return this.scheduleService.findOne(id, req.user.id)
  }

  /**
   * Récupère la planification pour une date spécifique
   */
  @Get('by-date/:date')
  @UseGuards(JwtAuthGuard)
  async findByDate(
    @Request() req: { user: { id: string } },
    @Param('date') date: string
  ) {
    return this.scheduleService.findByDate(req.user.id, date)
  }

  /**
   * Crée une nouvelle planification
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: { id: string } },
    @Body() data: CreateScheduleDto
  ) {
    return this.scheduleService.create(req.user.id, data)
  }

  /**
   * Met à jour une planification
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() data: UpdateScheduleDto
  ) {
    return this.scheduleService.update(id, req.user.id, data)
  }

  /**
   * Supprime une planification
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string
  ) {
    return this.scheduleService.delete(id, req.user.id)
  }

  /**
   * Marque une planification comme complétée
   */
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  async markAsCompleted(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { session_id?: string }
  ) {
    return this.scheduleService.markAsCompleted(id, req.user.id, body.session_id)
  }

  /**
   * Marque une planification comme sautée
   */
  @Patch(':id/skip')
  @UseGuards(JwtAuthGuard)
  async markAsSkipped(
    @Request() req: { user: { id: string } },
    @Param('id') id: string
  ) {
    return this.scheduleService.markAsSkipped(id, req.user.id)
  }
}
