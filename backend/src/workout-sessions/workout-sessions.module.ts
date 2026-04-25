import { Module } from '@nestjs/common'
import { WorkoutAnalysisService } from './workout-analysis.service'
import { WorkoutSessionsController } from './workout-sessions.controller'
import { WorkoutSessionsService } from './workout-sessions.service'

@Module({
    controllers: [WorkoutSessionsController],
    providers: [WorkoutSessionsService, WorkoutAnalysisService],
    exports: [WorkoutSessionsService],
})
export class WorkoutSessionsModule { }
