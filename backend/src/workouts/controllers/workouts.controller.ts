import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CreateWorkoutDto, GeneratePersonalizedWorkoutDto, GenerateWorkoutDto, LookupWorkoutDto, ParseWorkoutTextDto, SaveBenchmarkResultDto, WeeklyPlanDto, WorkoutDto, WorkoutQueryDto } from '../dto/workout.dto'
import { AIWorkoutGeneratorService, GeneratedWorkout, WeeklyPlanResult } from '../services/ai-workout-generator.service'
import { WorkoutsService } from '../services/workouts.service'

@Controller('workouts')
export class WorkoutsController {
  constructor(
    private readonly service: WorkoutsService,
    private readonly aiGenerator: AIWorkoutGeneratorService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: WorkoutQueryDto, @Request() req: { user: { id: string } }) {
    return await this.service.findAll(query, req.user.id)
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  async getDailyWorkout(
    @Request() req: { user: { id: string } },
    @Query('date') date?: string,
  ) {
    const workout = await this.service.getDailyWorkout(req.user.id, date)
    if (!workout) {
      throw new NotFoundException('Aucun workout trouvé pour cette date')
    }
    return workout
  }

  @Get('benchmark')
  @UseGuards(JwtAuthGuard)
  async getBenchmarkWorkouts() {
    return await this.service.getBenchmarkWorkouts()
  }

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalizedWorkouts(
    @Request() req: { user: { id: string } },
    @Query() query: WorkoutQueryDto & {
      limit?: string
      offset?: string
      search?: string
      difficulty?: string
      intensity?: string
      minDuration?: string
      maxDuration?: string
    }
  ) {
    return await this.service.getPersonalizedWorkouts(
      req.user.id,
      query.limit,
      query.offset,
      query.search,
      query.difficulty,
      query.intensity,
      query.minDuration,
      query.maxDuration
    )
  }

  @Get('personalized/:id')
  @UseGuards(JwtAuthGuard)
  async getPersonalizedWorkout(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return await this.service.getPersonalizedWorkout(id, req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getWorkoutById(@Param('id') id: string) {
    const workout = await this.service.findOne(id)
    if (!workout) {
      throw new NotFoundException('Workout non trouvé')
    }
    return workout
  }

  @Post('personalized')
  @UseGuards(JwtAuthGuard)
  async createPersonalizedWorkouts(
    @Body() data: WorkoutDto,
    @Request() req: { user: { id: string } },
  ) {
    const response = await this.service.createPersonalizedWorkout(data, req.user.id)
    return response
  }


  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return await this.service.create(createWorkoutDto)
  }

  @Post('parse-text')
  @UseGuards(JwtAuthGuard)
  async parseText(@Body() dto: ParseWorkoutTextDto): Promise<GeneratedWorkout> {
    return this.aiGenerator.parseWorkoutText(dto.text)
  }

  @Post('lookup')
  @UseGuards(JwtAuthGuard)
  async lookupWorkout(@Body() dto: LookupWorkoutDto): Promise<GeneratedWorkout> {
    return this.aiGenerator.lookupWorkoutByName(dto.name, dto.referenceData)
  }

  @Post('weekly-plan')
  @UseGuards(JwtAuthGuard)
  async weeklyPlan(
    @Body() dto: WeeklyPlanDto,
    @Request() req: { user: { id: string } },
  ): Promise<WeeklyPlanResult> {
    return this.aiGenerator.generateWeeklyPlan(req.user.id, dto.days)
  }

  @Post('generate-ai-personalized')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generatePersonalizedWithAI(
    @Body() dto: GeneratePersonalizedWorkoutDto,
    @Request() req: { user: { id: string } },
  ): Promise<GeneratedWorkout> {
    return this.aiGenerator.generatePersonalizedWorkout(req.user.id, dto)
  }

  @Post('generate-ai')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateWithAI(@Body() dto: GenerateWorkoutDto) {
    return this.aiGenerator.generateWorkout(dto)
  }

  @Post('benchmark-result')
  @UseGuards(JwtAuthGuard)
  async saveBenchmarkResult(
    @Request() req: { user: { id: string } },
    @Body() body: SaveBenchmarkResultDto
  ) {
    return await this.service.saveBenchmarkResult(req.user.id, body)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateWorkoutDto: CreateWorkoutDto) {
    return await this.service.update(id, updateWorkoutDto)
  }

  @Delete('personalized/:id')
  @UseGuards(JwtAuthGuard)
  async deletePersonalizedWorkout(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.service.deletePersonalizedWorkout(id, req.user.id)
    return { success: true, message: 'Workout personnalisé supprimé' }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return await this.service.remove(id)
  }

}


