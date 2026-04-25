import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CreateHyroxSessionDto, GenerateHyroxSessionDto, HyroxSessionQueryDto, HYROX_ALTERNATIVES, HYROX_STATIONS, UpdateHyroxSessionDto } from './dto/hyrox.dto'
import { HyroxService } from './services/hyrox.service'

@Controller('hyrox')
@UseGuards(JwtAuthGuard)
export class HyroxController {
  constructor(private readonly hyroxService: HyroxService) {}

  @Get('sessions')
  findAll(@Req() req, @Query() query: HyroxSessionQueryDto) {
    return this.hyroxService.findAll(req.user.id, query)
  }

  @Get('sessions/stats')
  getStats(@Req() req) {
    return this.hyroxService.getStats(req.user.id)
  }

  @Get('sessions/:id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.hyroxService.findOne(id, req.user.id)
  }

  @Post('sessions')
  create(@Req() req, @Body() data: CreateHyroxSessionDto) {
    return this.hyroxService.create(req.user.id, data)
  }

  @Patch('sessions/:id')
  update(@Req() req, @Param('id') id: string, @Body() data: UpdateHyroxSessionDto) {
    return this.hyroxService.update(id, req.user.id, data)
  }

  @Delete('sessions/:id')
  delete(@Req() req, @Param('id') id: string) {
    return this.hyroxService.delete(id, req.user.id)
  }

  @Post('generate/preview')
  generatePreview(@Req() req, @Body() data: GenerateHyroxSessionDto) {
    return this.hyroxService.generatePreview(req.user.id, data)
  }

  @Post('generate/save')
  generateAndSave(@Req() req, @Body() data: GenerateHyroxSessionDto) {
    return this.hyroxService.generateAndSave(req.user.id, data)
  }

  // Référence statique des stations et alternatives (utile pour le frontend)
  @Get('stations')
  getStations() {
    return { stations: HYROX_STATIONS, alternatives: HYROX_ALTERNATIVES }
  }
}
