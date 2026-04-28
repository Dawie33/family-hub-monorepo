import { Module } from '@nestjs/common'
import { StrengthController } from './controllers/strength.controller'
import { AIStrengthGeneratorService } from './services/ai-strength-generator.service'
import { StrengthService } from './services/strength.service'

@Module({
  controllers: [StrengthController],
  providers: [StrengthService, AIStrengthGeneratorService],
  exports: [StrengthService],
})
export class StrengthModule {}
