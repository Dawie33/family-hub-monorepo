import { Module } from '@nestjs/common'
import { WorkoutsModule } from '../workouts/workouts.module'
import { RunningController, StravaCallbackController } from './running.controller'
import { AIRunningGeneratorService } from './services/ai-running-generator.service'
import { RunningService } from './services/running.service'
import { StravaService } from './services/strava.service'

@Module({
  imports: [WorkoutsModule],
  controllers: [RunningController, StravaCallbackController],
  providers: [RunningService, AIRunningGeneratorService, StravaService],
  exports: [RunningService, StravaService],
})
export class RunningModule {}
