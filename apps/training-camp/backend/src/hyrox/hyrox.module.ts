import { Module } from '@nestjs/common'
import { WorkoutsModule } from '../workouts/workouts.module'
import { HyroxController } from './hyrox.controller'
import { AIHyroxGeneratorService } from './services/ai-hyrox-generator.service'
import { HyroxService } from './services/hyrox.service'

@Module({
  imports: [WorkoutsModule],
  controllers: [HyroxController],
  providers: [HyroxService, AIHyroxGeneratorService],
  exports: [HyroxService],
})
export class HyroxModule {}
