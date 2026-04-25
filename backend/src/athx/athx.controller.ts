import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { AthxSessionQueryDto, CreateAthxSessionDto, GenerateAthxSessionDto, UpdateAthxSessionDto } from './dto/athx.dto'
import { AthxService } from './services/athx.service'

@Controller('athx')
@UseGuards(JwtAuthGuard)
export class AthxController {
  constructor(private readonly athxService: AthxService) {}

  @Get('sessions')
  findAll(@Req() req, @Query() query: AthxSessionQueryDto) {
    return this.athxService.findAll(req.user.id, query)
  }

  @Get('sessions/stats')
  getStats(@Req() req) {
    return this.athxService.getStats(req.user.id)
  }

  @Get('sessions/:id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.athxService.findOne(id, req.user.id)
  }

  @Post('sessions')
  create(@Req() req, @Body() data: CreateAthxSessionDto) {
    return this.athxService.create(req.user.id, data)
  }

  @Patch('sessions/:id')
  update(@Req() req, @Param('id') id: string, @Body() data: UpdateAthxSessionDto) {
    return this.athxService.update(id, req.user.id, data)
  }

  @Delete('sessions/:id')
  delete(@Req() req, @Param('id') id: string) {
    return this.athxService.delete(id, req.user.id)
  }

  @Post('generate/preview')
  generatePreview(@Req() req, @Body() data: GenerateAthxSessionDto) {
    return this.athxService.generatePreview(req.user.id, data)
  }

  @Post('generate/save')
  generateAndSave(@Req() req, @Body() data: GenerateAthxSessionDto) {
    return this.athxService.generateAndSave(req.user.id, data)
  }
}
