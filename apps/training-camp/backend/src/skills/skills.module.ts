import { Module } from '@nestjs/common'
import { SkillsController } from './controllers/skills.controller'
import { AISkillGeneratorService } from './services/ai-skill-generator.service'
import { SkillsService } from './services/skills.service'

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, AISkillGeneratorService],
  exports: [SkillsService],
})
export class SkillsModule {}
