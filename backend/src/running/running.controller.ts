import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import {
  CreateRunningSessionDto,
  GenerateRunningSessionDto,
  RunningSessionQueryDto,
  UpdateRunningSessionDto,
} from './dto/running.dto'
import { RunningService } from './services/running.service'
import { StravaService } from './services/strava.service'

@Controller('running')
@UseGuards(JwtAuthGuard)
export class RunningController {
  constructor(
    private readonly runningService: RunningService,
    private readonly stravaService: StravaService,
  ) {}

  // ── Sessions ────────────────────────────────────────────────────────────────

  @Get('sessions')
  async findAll(@Req() req, @Query() query: RunningSessionQueryDto) {
    return this.runningService.findAll(req.user.id, query)
  }

  @Get('sessions/stats')
  async getStats(@Req() req) {
    return this.runningService.getStats(req.user.id)
  }

  @Get('sessions/:id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.runningService.findOne(id, req.user.id)
  }

  @Post('sessions')
  async create(@Req() req, @Body() data: CreateRunningSessionDto) {
    return this.runningService.create(req.user.id, data)
  }

  @Patch('sessions/:id')
  async update(@Req() req, @Param('id') id: string, @Body() data: UpdateRunningSessionDto) {
    return this.runningService.update(id, req.user.id, data)
  }

  @Delete('sessions/:id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.runningService.delete(id, req.user.id)
  }

  // ── Génération IA ────────────────────────────────────────────────────────────

  /**
   * Prévisualise un plan sans le sauvegarder
   */
  @Post('generate/preview')
  async generatePreview(@Req() req, @Body() data: GenerateRunningSessionDto) {
    return this.runningService.generatePreview(req.user.id, data)
  }

  /**
   * Génère et sauvegarde directement la séance
   */
  @Post('generate/save')
  async generateAndSave(@Req() req, @Body() data: GenerateRunningSessionDto) {
    return this.runningService.generateAndSave(req.user.id, data)
  }

  // ── Strava OAuth ─────────────────────────────────────────────────────────────

  @Get('strava/auth-url')
  getStravaAuthUrl(@Req() req) {
    const url = this.stravaService.getAuthUrl(req.user.id)
    return { url }
  }

  @Get('strava/status')
  async getStravaStatus(@Req() req) {
    const connected = await this.stravaService.isConnected(req.user.id)
    return { connected }
  }

  @Post('strava/sync')
  async syncStrava(@Req() req) {
    return this.stravaService.syncActivities(req.user.id)
  }

  @Delete('strava/disconnect')
  async disconnectStrava(@Req() req) {
    await this.stravaService.disconnect(req.user.id)
    return { success: true }
  }

  // Callback Strava — pas de JwtAuthGuard (appelé par Strava directement)
}

@Controller('running/strava')
export class StravaCallbackController {
  constructor(private readonly stravaService: StravaService) {}

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Res() res: Response,
  ) {
    await this.stravaService.handleCallback(code, userId)
    return res.redirect(`${process.env.FRONTEND_URL}/running?strava_connected=true`)
  }
}
