import { Module } from '@nestjs/common'
import { OneRepMaxesController } from './one-rep-maxes.controller'
import { OneRepMaxesService } from './one-rep-maxes.service'

@Module({
  controllers: [OneRepMaxesController],
  providers: [OneRepMaxesService],
  exports: [OneRepMaxesService],
})
export class OneRepMaxesModule {}
