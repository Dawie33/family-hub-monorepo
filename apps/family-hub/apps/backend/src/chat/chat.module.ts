import { Module } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { EventsModule } from '../events/events.module';
import { MemoryModule } from '../memory/memory.module';
import { RecipesModule } from '../recipes/recipes.module';
import { TrainingCampModule } from '../training-camp/training-camp.module';
import { DatabaseModule } from '../database/database.module';
import { FcmModule } from '../fcm/fcm.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SearchService } from './services/search.service';
import { RecipeExtractorService } from './services/recipe-extractor.service';

@Module({
  imports: [AIModule, EventsModule, MemoryModule, RecipesModule, TrainingCampModule, DatabaseModule, FcmModule],
  controllers: [ChatController],
  providers: [ChatService, SearchService, RecipeExtractorService],
})
export class ChatModule {}
