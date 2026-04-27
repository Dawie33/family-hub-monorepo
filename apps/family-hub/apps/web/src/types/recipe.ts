export type DietaryFilter = 'végétarien' | 'vegan' | 'sans gluten' | 'sans lactose';
export type CuisineType = 'française' | 'italienne' | 'asiatique' | 'mexicaine' | 'méditerranéenne' | 'indienne' | 'américaine';
export type Difficulty = 'débutant' | 'intermédiaire' | 'chef';
export type MaxDuration = '15 min' | '30 min' | '45 min' | '1h';

export interface Nutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
}

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  duration: string;
  difficulty: Difficulty;
  filters?: DietaryFilter[];
  cuisineType?: CuisineType;
  nutrition?: Nutrition;
}

export interface ShoppingCategory {
  category: string;
  items: string[];
}

export interface GeneratedMealPlan {
  recipes: GeneratedRecipe[];
  shoppingList: ShoppingCategory[];
}
