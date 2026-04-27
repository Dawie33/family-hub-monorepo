import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { MealPlansService } from './meal-plans.service';
import { RecipeGenerationService } from './recipe-generation.service';
import { RecipesController, MealPlansController } from './recipes.controller';

@Module({
  controllers: [RecipesController, MealPlansController],
  providers: [RecipesService, MealPlansService, RecipeGenerationService],
  exports: [RecipesService, MealPlansService, RecipeGenerationService],
})
export class RecipesModule {}
