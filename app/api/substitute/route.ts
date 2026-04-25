import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI();

export async function POST(request: NextRequest) {
  const { ingredient, recipeTitle }: { ingredient: string; recipeTitle: string } =
    await request.json();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Dans la recette "${recipeTitle}", je n'ai pas "${ingredient}".
Propose 2 à 3 substituts possibles avec une courte explication pour chacun.
Réponds UNIQUEMENT en JSON : { "substitutes": [{ "name": "...", "note": "..." }] }`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  if (!content) return NextResponse.json({ error: 'Erreur modèle' }, { status: 500 });

  return NextResponse.json(JSON.parse(content));
}
