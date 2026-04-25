import { Body, Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { UpsertOneRepMaxDto } from './dto/one-rep-max.dto'
import { OneRepMaxesService } from './one-rep-maxes.service'

@Controller('one-rep-maxes')
@UseGuards(JwtAuthGuard)
export class OneRepMaxesController {
  constructor(private readonly service: OneRepMaxesService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.service.findAllByUser(req.user.id)
  }

  @Get('history')
  async findHistory(@Request() req: { user: { id: string } }) {
    return this.service.findHistoryByUser(req.user.id)
  }

  @Put(':lift')
  async upsert(
    @Param('lift') lift: string,
    @Body() dto: UpsertOneRepMaxDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.upsert(req.user.id, lift, dto.value, dto.source)
  }
}
