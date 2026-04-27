import { Injectable } from '@nestjs/common'
import { OpenAIService } from '../ai/openai.service'
import { GenerateRecipeDto } from './dto/generate-recipe.dto'
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto'

export interface GeneratedRecipeNutrition {
  calories: number
  proteins: number
  carbs: number
  fat: number
}

export interface GeneratedRecipe {
  title: string
  ingredients: string[]
  steps: string[]
  duration: string
  difficulty: 'débutant' | 'intermédiaire' | 'chef'
  nutrition?: GeneratedRecipeNutrition
}

export interface ShoppingCategory {
  category: string
  items: string[]
}

export interface GeneratedMealPlan {
  recipes: GeneratedRecipe[]
  shoppingList: ShoppingCategory[]
}

export interface SubstituteResult {
  substitutes: Array<{ name: string; note: string }>
}

@Injectable()
export class RecipeGenerationService {
  constructor(private readonly openai: OpenAIService) {}

  async generateRecipe(dto: GenerateRecipeDto): Promise<GeneratedRecipe> {
    const constraints: string[] = []
    if (dto.filters?.length) constraints.push(`Contraintes alimentaires : ${dto.filters.join(', ')}`)
    if (dto.platTypes?.length) constraints.push(`Type(s) de plat : ${dto.platTypes.join(' ou ')}`)
    if (dto.cuisineTypes?.length) constraints.push(`Type(s) de cuisine : ${dto.cuisineTypes.join(' ou ')}`)
    if (dto.difficulty) constraints.push(`Niveau de difficulté : ${dto.difficulty}`)
    if (dto.maxDuration) constraints.push(`Temps de préparation maximum : ${dto.maxDuration}`)

    const constraintsText = constraints.length ? constraints.join('. ') + '.' : ''

    const prompt = `Tu es un chef cuisinier expert. Génère une recette détaillée à partir des ingrédients suivants : ${dto.ingredients.join(', ')}.
${constraintsText}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans bloc de code) dans ce format exact :
{
  "title": "Nom de la recette",
  "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
  "steps": ["Étape 1 détaillée", "Étape 2 détaillée"],
  "duration": "30 minutes",
  "difficulty": "débutant",
  "nutrition": { "calories": 450, "proteins": 32, "carbs": 48, "fat": 14 }
}

La difficulté doit être l'une de ces valeurs exactes : "débutant", "intermédiaire" ou "chef".
Les valeurs nutritionnelles sont par portion (estimation raisonnable).`

    return this.openai.chatJson<GeneratedRecipe>([{ role: 'user', content: prompt }])
  }

  async generateMealPlan(dto: GenerateMealPlanDto): Promise<GeneratedMealPlan> {
    const constraints: string[] = []
    if (dto.filters?.length) constraints.push(`Contraintes alimentaires : ${dto.filters.join(', ')}`)
    if (dto.platTypes?.length) constraints.push(`Type(s) de plat : ${dto.platTypes.join(' ou ')}`)
    if (dto.cuisineTypes?.length) constraints.push(`Type(s) de cuisine : ${dto.cuisineTypes.join(' ou ')}`)
    if (dto.difficulty) constraints.push(`Niveau de difficulté : ${dto.difficulty}`)
    if (dto.maxDuration) constraints.push(`Temps de préparation maximum par repas : ${dto.maxDuration}`)

    const constraintsText = constraints.length ? constraints.join('. ') + '.' : ''

    const prompt = `Tu es un chef cuisinier expert et nutritionniste. Planifie ${dto.numberOfMeals} repas différents et variés pour ${dto.numberOfPeople} personne(s).
${constraintsText}

Pour chaque recette, inclus une estimation des valeurs nutritionnelles par portion.
Consolide tous les ingrédients en une liste de courses regroupée par catégorie, quantités adaptées pour ${dto.numberOfPeople} personne(s).

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact :
{
  "recipes": [
    {
      "title": "Nom de la recette",
      "ingredients": ["ingrédient 1 avec quantité pour ${dto.numberOfPeople} personne(s)"],
      "steps": ["Étape 1", "Étape 2"],
      "duration": "30 minutes",
      "difficulty": "débutant",
      "nutrition": { "calories": 450, "proteins": 32, "carbs": 48, "fat": 14 }
    }
  ],
  "shoppingList": [
    { "category": "Viandes & Poissons", "items": ["200g de poulet"] },
    { "category": "Légumes & Fruits", "items": ["3 tomates", "1 oignon"] }
  ]
}

Difficulté : "débutant", "intermédiaire" ou "chef".
Catégories possibles : Viandes & Poissons, Légumes & Fruits, Produits laitiers, Épicerie & Condiments, Féculents & Céréales, Surgelés, Autres.
Consolide les ingrédients communs entre les recettes.`

    return this.openai.chatJson<GeneratedMealPlan>([{ role: 'user', content: prompt }])
  }

  async suggestSubstitute(ingredient: string, recipeTitle: string): Promise<SubstituteResult> {
    return this.openai.chatJson<SubstituteResult>([
      {
        role: 'user',
        content: `Dans la recette "${recipeTitle}", je n'ai pas "${ingredient}".
Propose 2 à 3 substituts possibles avec une courte explication pour chacun.
Réponds UNIQUEMENT en JSON : { "substitutes": [{ "name": "...", "note": "..." }] }`,
      },
    ])
  }

  formatShoppingList(shoppingList: ShoppingCategory[]): string {
    return shoppingList
      .map(cat => `**${cat.category}**\n${cat.items.map(i => `• ${i}`).join('\n')}`)
      .join('\n\n')
  }

  formatMealPlanSummary(result: GeneratedMealPlan): string {
    return result.recipes.map((r, i) => `Repas ${i + 1}: ${r.title}`).join(', ')
  }
}
