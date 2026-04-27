import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { KnexModule } from 'nest-knexjs'
import knexConfig from './database/knexfile'
import { AuthModule } from './auth/auth.module'
import { envValidationSchema } from './common/config/env.validation'
import { EquipmentsModule } from './equipments/equipments.module'
import { ExercisesModule } from './exercises/exercises.module'
import { HealthcheckModule } from './healthcheck/healthcheck.module'
import { UsersModule } from './users/users.module'
import { WorkoutsModule } from './workouts/workouts.module'
import { OneRepMaxesModule } from './one-rep-maxes/one-rep-maxes.module'
import { SkillsModule } from './skills/skills.module'
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module'
import { GoogleCalendarModule } from './google-calendar/google-calendar.module'
import { ScheduledActivitiesModule } from './scheduled-activities/scheduled-activities.module'
import { RunningModule } from './running/running.module'
import { AthxModule } from './athx/athx.module'
import { HyroxModule } from './hyrox/hyrox.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,  // 1 minute
        limit: 60,   // 60 requêtes par minute par IP (routes normales)
      },
    ]),
    KnexModule.forRoot({ config: knexConfig[process.env.NODE_ENV || 'development'] }),
    AuthModule,
    WorkoutsModule,
    WorkoutSessionsModule,
    HealthcheckModule,
    EquipmentsModule,
    ExercisesModule,
    UsersModule,
    SkillsModule,
    OneRepMaxesModule,
    GoogleCalendarModule,
    ScheduledActivitiesModule,
    RunningModule,
    AthxModule,
    HyroxModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
