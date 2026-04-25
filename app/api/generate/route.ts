import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { DietaryFilter, CuisineType, Difficulty, MaxDuration } from '@/types/recipe';

const client = new OpenAI();

export async function POST(request: NextRequest) {
  const {
    ingredients,
    filters,
    cuisineTypes,
    platTypes,
    difficulty,
    maxDuration,
  }: {
    ingredients: string[];
    filters: DietaryFilter[];
    cuisineTypes?: CuisineType[];
    platTypes?: string[];
    difficulty?: Difficulty;
    maxDuration?: MaxDuration;
  } = await request.json();

  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: 'Aucun ingrédient fourni' }, { status: 400 });
  }

  const constraints: string[] = [];
  if (filters.length > 0) constraints.push(`Contraintes alimentaires : ${filters.join(', ')}`);
  if (platTypes && platTypes.length > 0) constraints.push(`Type(s) de plat : ${platTypes.join(' ou ')}`);
  if (cuisineTypes && cuisineTypes.length > 0) constraints.push(`Type(s) de cuisine : ${cuisineTypes.join(' ou ')}`);
  if (difficulty) constraints.push(`Niveau de difficulté : ${difficulty}`);
  if (maxDuration) constraints.push(`Temps de préparation maximum : ${maxDuration}`);

  const constraintsText = constraints.length > 0 ? constraints.join('. ') + '.' : '';

  const prompt = `Tu es un chef cuisinier expert. Génère une recette détaillée à partir des ingrédients suivants : ${ingredients.join(', ')}.
${constraintsText}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans bloc de code) dans ce format exact :
{
  "title": "Nom de la recette",
  "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
  "steps": ["Étape 1 détaillée", "Étape 2 détaillée"],
  "duration": "30 minutes",
  "difficulty": "débutant",
  "nutrition": {
    "calories": 450,
    "proteins": 32,
    "carbs": 48,
    "fat": 14
  }
}

La difficulté doit être l'une de ces valeurs exactes : "débutant", "intermédiaire" ou "chef".
Les valeurs nutritionnelles sont par portion (estimation raisonnable).`;

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
