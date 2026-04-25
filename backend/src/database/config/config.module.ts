import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      // Load .env file
      envFilePath: '.env',
      // Use configuration file to validate, set default values and cast the loaded values
      load: [configuration],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule { }
