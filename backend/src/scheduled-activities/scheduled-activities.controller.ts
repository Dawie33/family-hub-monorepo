import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CreateScheduledActivityDto, UnifiedActivityQueryDto, UpdateScheduledActivityDto } from './dto/scheduled-activity.dto'
import { ScheduledActivitiesService } from './scheduled-activities.service'

@Controller('scheduled-activities')
@UseGuards(JwtAuthGuard)
export class ScheduledActivitiesController {
  constructor(private readonly service: ScheduledActivitiesService) {}

  /**
   * Vue unifiée de toutes les activités planifiées (CrossFit + HYROX + Running + ATHX)
   */
  @Get('unified')
  async findUnified(
    @Request() req: { user: { id: string } },
    @Query() query: UnifiedActivityQueryDto,
  ) {
    return this.service.findUnified(req.user.id, query)
  }

  /**
   * Crée une nouvelle activité planifiée (HYROX / Running / ATHX)
   */
  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() data: CreateScheduledActivityDto,
  ) {
    return this.service.create(req.user.id, data)
  }

  /**
   * Met à jour une activité planifiée (HYROX / Running / ATHX)
   */
  @Patch(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() data: UpdateScheduledActivityDto,
  ) {
    return this.service.update(id, req.user.id, data)
  }

  /**
   * Supprime une activité planifiée (HYROX / Running / ATHX)
   */
  @Delete(':id')
  async delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.delete(id, req.user.id)
  }

  /**
   * Marque une activité comme complétée
   */
  @Patch(':id/complete')
  async markAsCompleted(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.markAsCompleted(id, req.user.id)
  }

  /**
   * Marque une activité comme sautée
   */
  @Patch(':id/skip')
  async markAsSkipped(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.service.markAsSkipped(id, req.user.id)
  }
}
