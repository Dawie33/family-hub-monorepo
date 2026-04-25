import { Controller, Delete, Get, Query, Req, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

import { GoogleCalendarService } from './google-calendar.service'

@Controller('calendar/google')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) { }

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@Req() req) {
    const url = this.googleCalendarService.getAuthUrl(req.user.id)
    return { url }
  }


  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Res() res: Response,
  ) {
    await this.googleCalendarService.handleCallback(code, userId)
    return res.redirect(`${process.env.FRONTEND_URL}/calendar?google_connected=true`)
  }


  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req) {
    const connected = await this.googleCalendarService.isConnected(req.user.id)
    return { connected }
  }


  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(@Req() req) {
    await this.googleCalendarService.disconnect(req.user.id)
    return { success: true }
  }
}
