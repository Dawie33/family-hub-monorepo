import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from './database/database.module'
import { AIModule } from './ai/ai.module'
import { ChatModule } from './chat/chat.module'
import { EventsModule } from './events/events.module'
import { BriefingsModule } from './briefings/briefings.module'
import { NotificationsModule } from './notifications/notifications.module'
import { PdfModule } from './pdf/pdf.module'
import { WeatherModule } from './weather/weather.module'
import { RecipesModule } from './recipes/recipes.module'
import { TrainingCampModule } from './training-camp/training-camp.module'
import { ShoppingModule } from './shopping/shopping.module'
import { FcmModule } from './fcm/fcm.module'
import { GmailModule } from './gmail/gmail.module'
import { FamiliesModule } from './families/families.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          createKeyv(
            `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
          ),
        ],
        ttl: 5 * 60 * 1000, // 5 min par défaut (en millisecondes)
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AIModule,
    ChatModule,
    EventsModule,
    BriefingsModule,
    NotificationsModule,
    PdfModule,
    WeatherModule,
    RecipesModule,
    TrainingCampModule,
    ShoppingModule,
    FcmModule,
    GmailModule,
    FamiliesModule,
  ],
})
export class AppModule {}
