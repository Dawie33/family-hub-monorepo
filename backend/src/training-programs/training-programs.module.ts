import { Module } from '@nestjs/common'
import { WorkoutsModule } from 'src/workouts/workouts.module'
import { AIProgramGeneratorService } from './ai-program-generator.service'
import { TrainingProgramsController } from './training-programs.controller'
import { TrainingProgramsService } from './training-programs.service'

@Module({
  imports: [WorkoutsModule],
  controllers: [TrainingProgramsController],
  providers: [TrainingProgramsService, AIProgramGeneratorService],
  exports: [TrainingProgramsService],
})
export class TrainingProgramsModule {}
