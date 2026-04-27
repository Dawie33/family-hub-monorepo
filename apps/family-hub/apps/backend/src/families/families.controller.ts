import { Controller, Get, Post, Body } from '@nestjs/common'
import { FamiliesService } from './families.service'

@Controller('families')
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  findAll() {
    return this.families.findAll()
  }

  @Post()
  create(@Body() body: { name: string; userId?: string }) {
    return this.families.create(body.name, body.userId)
  }
}
