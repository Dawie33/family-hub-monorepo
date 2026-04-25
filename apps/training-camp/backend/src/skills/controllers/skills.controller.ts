import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import {
  CreateSkillProgramDto,
  CreateSkillProgressLogDto,
  GenerateSkillProgramDto,
  UpdateSkillProgramDto,
  UpdateSkillStepDto,
} from '../dto/skill.dto'
import { AISkillGeneratorService } from '../services/ai-skill-generator.service'
import { SkillsService } from '../services/skills.service'

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly service: SkillsService,
    private readonly aiGenerator: AISkillGeneratorService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: { user: { id: string } },
    @Query('status') status?: string,
  ) {
    return this.service.findAll(req.user.id, status)
  }

  // Static routes MUST come before :id parameterized routes
  @Get('progress/step/:stepId')
  @UseGuards(JwtAuthGuard)
  async getStepLogs(@Param('stepId') stepId: string) {
    return this.service.getStepLogs(stepId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.findOne(id, req.user.id)
  }

  @Post('generate-ai')
  async generateWithAI(@Body() dto: GenerateSkillProgramDto) {
    return this.aiGenerator.generateSkillProgram(dto)
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  async logProgress(
    @Body() dto: CreateSkillProgressLogDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.logProgress(req.user.id, dto)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateSkillProgramDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.create(req.user.id, dto)
  }

  @Patch(':id/steps/:stepId')
  @UseGuards(JwtAuthGuard)
  async updateStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: UpdateSkillStepDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.updateStep(id, stepId, req.user.id, dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateProgram(
    @Param('id') id: string,
    @Body() dto: UpdateSkillProgramDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.updateProgram(id, req.user.id, dto)
  }

  @Delete('progress/:logId')
  @UseGuards(JwtAuthGuard)
  async deleteLog(
    @Param('logId') logId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.deleteLog(logId, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProgram(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.deleteProgram(id, req.user.id)
  }
}
