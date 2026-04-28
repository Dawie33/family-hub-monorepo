import { Module } from '@nestjs/common'
import { WorkoutsModule } from '../workouts/workouts.module'
import { StrengthController } from './controllers/strength.controller'
import { AIStrengthGeneratorService } from './services/ai-strength-generator.service'
import { StrengthService } from './services/strength.service'

@Module({
  imports: [WorkoutsModule],
  controllers: [StrengthController],
  providers: [StrengthService, AIStrengthGeneratorService],
  exports: [StrengthService],
})
export class StrengthModule {}
