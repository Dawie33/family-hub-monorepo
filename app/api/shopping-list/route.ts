import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { DietaryFilter, CuisineType, Difficulty, MaxDuration } from '@/types/recipe';

const client = new OpenAI();

export async function POST(request: NextRequest) {
  const {
    numberOfMeals,
    numberOfPeople,
    filters,
    cuisineTypes,
    platTypes,
    difficulty,
    maxDuration,
  }: {
    numberOfMeals: number;
    numberOfPeople: number;
    filters: DietaryFilter[];
    cuisineTypes?: CuisineType[];
    platTypes?: string[];
    difficulty?: Difficulty;
    maxDuration?: MaxDuration;
  } = await request.json();

  const constraints: string[] = [];
  if (filters.length > 0) constraints.push(`Contraintes alimentaires : ${filters.join(', ')}`);
  if (platTypes && platTypes.length > 0) constraints.push(`Type(s) de plat : ${platTypes.join(' ou ')}`);
  if (cuisineTypes && cuisineTypes.length > 0) constraints.push(`Type(s) de cuisine : ${cuisineTypes.join(' ou ')}`);
  if (difficulty) constraints.push(`Niveau de difficulté : ${difficulty}`);
  if (maxDuration) constraints.push(`Temps de préparation maximum par repas : ${maxDuration}`);

  const constraintsText = constraints.length > 0 ? constraints.join('. ') + '.' : '';

  const prompt = `Tu es un chef cuisinier expert et nutritionniste. Planifie ${numberOfMeals} repas différents et variés pour ${numberOfPeople} personne(s).
${constraintsText}

Pour chaque recette, inclus une estimation des valeurs nutritionnelles par portion.
Consolide tous les ingrédients en une liste de courses regroupée par catégorie, quantités adaptées pour ${numberOfPeople} personne(s).

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans bloc de code) dans ce format exact :
{
  "recipes": [
    {
      "title": "Nom de la recette",
      "ingredients": ["ingrédient 1 avec quantité pour ${numberOfPeople} personne(s)", "ingrédient 2"],
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
Consolide les ingrédients communs entre les recettes.`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    return NextResponse.json({ error: 'Réponse inattendue du modèle' }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(content));
}
