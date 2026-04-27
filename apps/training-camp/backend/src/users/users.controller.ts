import { Body, Controller, Delete, Get, Param, Patch, Query, Request, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { UpdateUserDto, UserQueryDto } from "./dto"
import { UsersService } from "./users.service"

@Controller('users')
export class UsersController {
    constructor(private readonly service: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Query() query: UserQueryDto) {
        return this.service.findAll(query)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(
        @Request() req: { user: { id: string } },
    ) {
        return await this.service.getProfile(req.user.id)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id)
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateMe(@Body() data: UpdateUserDto, @Request() req: { user: { id: string } }) {
        return this.service.update(req.user.id, data)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.service.update(id, data)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string) {
        return this.service.delete(id)
    }
} 
