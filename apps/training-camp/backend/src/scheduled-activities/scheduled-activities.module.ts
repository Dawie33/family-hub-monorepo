import { Module } from '@nestjs/common'
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module'
import { ScheduledActivitiesController } from './scheduled-activities.controller'
import { ScheduledActivitiesService } from './scheduled-activities.service'

@Module({
  imports: [GoogleCalendarModule],
  controllers: [ScheduledActivitiesController],
  providers: [ScheduledActivitiesService],
  exports: [ScheduledActivitiesService],
})
export class ScheduledActivitiesModule {}
