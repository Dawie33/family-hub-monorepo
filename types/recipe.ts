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

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  duration: string;
  difficulty: Difficulty;
  filters: DietaryFilter[];
  cuisineType?: CuisineType;
  nutrition?: Nutrition;
  rating?: number;
  comment?: string;
  createdAt: string;
}

export interface ShoppingCategory {
  category: string;
  items: string[];
}

export interface MealPlan {
  id: string;
  numberOfMeals: number;
  numberOfPeople: number;
  filters: DietaryFilter[];
  cuisineType?: CuisineType;
  recipes: Omit<Recipe, 'id' | 'filters' | 'createdAt' | 'rating' | 'comment'>[];
  shoppingList: ShoppingCategory[];
  createdAt: string;
}
