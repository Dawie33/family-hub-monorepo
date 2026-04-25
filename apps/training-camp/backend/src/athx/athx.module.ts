import { Module } from '@nestjs/common'
import { WorkoutsModule } from '../workouts/workouts.module'
import { AthxController } from './athx.controller'
import { AIAthxGeneratorService } from './services/ai-athx-generator.service'
import { AthxService } from './services/athx.service'

@Module({
  imports: [WorkoutsModule],
  controllers: [AthxController],
  providers: [AthxService, AIAthxGeneratorService],
  exports: [AthxService],
})
export class AthxModule {}
