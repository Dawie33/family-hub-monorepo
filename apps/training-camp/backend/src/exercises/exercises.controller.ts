import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { CreateExerciseDto, ExerciseQueryDto, UpdateExerciseDto } from "./dto/exercises.dto"
import { ExercisesService } from "./exercises.service"

@Controller('exercises')
export class ExercisesController {
    constructor(
        private readonly service: ExercisesService
    ) { }

    @Get()
    async findAll(@Query() query: ExerciseQueryDto) {
        return await this.service.findAll(query)
    }

    @Get('by-name/:name')
    async findByName(@Param('name') name: string) {
        return this.service.findByName(name)
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() data: CreateExerciseDto) {
        return this.service.create(data)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() data: UpdateExerciseDto) {
        return this.service.update(id, data)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string) {
        return this.service.delete(id)
    }
}
