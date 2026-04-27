import { GeneratedRecipe, GeneratedMealPlan, DietaryFilter, CuisineType, Difficulty, MaxDuration } from '@/types/recipe';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// ─── Types re-exportés pour la page existante ──────────────────────────────

export type { GeneratedRecipe as Recipe };

// Type retourné par NestJS /api/recipes (format entity)
interface NestRecipeIngredient { item: string; quantity?: string }
interface NestRecipe {
  id: number;
  title: string;
  ingredients: NestRecipeIngredient[];
  instructions: string | null;
  prep_time: number | null;
  tags: string[];
  source: string;
  is_favorite: boolean;
  created_at: string;
}

function nestToUi(r: NestRecipe): GeneratedRecipe {
  return {
    title: r.title,
    ingredients: r.ingredients.map((i) => [i.quantity, i.item].filter(Boolean).join(' ')),
    steps: r.instructions ? r.instructions.split('\n').filter(Boolean) : [],
    duration: r.prep_time ? `${r.prep_time} min` : '—',
    difficulty: 'débutant',
  };
}

// ─── Recettes sauvegardées ──────────────────────────────────────────────────

export async function getSavedRecipes(): Promise<(GeneratedRecipe & { id?: string; created_at?: string })[]> {
  try {
    const res = await fetch(`${API_BASE}/recipes`);
    if (!res.ok) return [];
    const data: NestRecipe[] = await res.json();
    return data.map((r) => ({ ...nestToUi(r), id: String(r.id), created_at: r.created_at }));
  } catch {
    return [];
  }
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function saveRecipe(recipe: GeneratedRecipe): Promise<boolean> {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: recipe.title,
      ingredients: recipe.ingredients.map((item) => ({ item })),
      instructions: recipe.steps.join('\n'),
      source: 'chat',
      tags: recipe.filters ?? [],
    }),
  });
  return res.ok;
}

// ─── Génération ─────────────────────────────────────────────────────────────

export interface GenerateRecipeParams {
  ingredients: string[];
  filters?: DietaryFilter[];
  cuisineTypes?: CuisineType[];
  platTypes?: string[];
  difficulty?: Difficulty;
  maxDuration?: MaxDuration;
}

export interface GenerateMealPlanParams {
  numberOfMeals: number;
  numberOfPeople: number;
  filters?: DietaryFilter[];
  cuisineTypes?: CuisineType[];
  platTypes?: string[];
  difficulty?: Difficulty;
  maxDuration?: MaxDuration;
}

export async function generateRecipe(params: GenerateRecipeParams): Promise<GeneratedRecipe> {
  const res = await fetch(`${API_BASE}/recipes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Erreur lors de la génération de la recette');
  return res.json();
}

export async function generateMealPlan(
  params: GenerateMealPlanParams
): Promise<GeneratedMealPlan> {
  const res = await fetch(`${API_BASE}/recipes/meal-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Erreur lors de la génération du plan');
  return res.json();
}

// ─── Anciens types conservés pour d'éventuels usages ───────────────────────

export interface ShoppingList {
  id: string;
  name: string;
  color: string;
  created_at: string;
  family_id: string | null;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
}

export async function getShoppingLists(familyId?: string): Promise<ShoppingList[]> {
  const url = new URL(`${API_BASE}/shopping/lists`);
  if (familyId) url.searchParams.set('family_id', familyId);
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  return res.json();
}

export async function getShoppingItems(listId: string): Promise<ShoppingItem[]> {
  const res = await fetch(`${API_BASE}/shopping/items?list_id=${listId}`);
  if (!res.ok) return [];
  return res.json();
}
