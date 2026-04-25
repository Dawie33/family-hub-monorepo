'use client';

import { useState } from 'react';
import { Recipe, MealPlan } from '@/types/recipe';
import RecipeForm, { GenerateParams, PlanParams } from '@/components/RecipeForm';
import RecipeResult from '@/components/RecipeResult';
import ShoppingListResult from '@/components/ShoppingListResult';
import { saveRecipe } from '@/lib/recipeStorage';
import { SkeletonRecipeResult } from '@/components/SkeletonLoaders';

type Result = { type: 'recipe'; data: Recipe } | { type: 'plan'; data: MealPlan };

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleGenerate(params: GenerateParams) {
    setLoading(true); setError(null); setResult(null); setSaved(false);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Une erreur est survenue');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setResult({ type: 'recipe', data: { ...data, id: crypto.randomUUID(), filters: params.filters, cuisineType: params.cuisineTypes?.[0], createdAt: new Date().toISOString() } });
    setLoading(false);
  }

  async function handleGeneratePlan(params: PlanParams) {
    setLoading(true); setError(null); setResult(null);
    const res = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Une erreur est survenue');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setResult({ type: 'plan', data: { ...data, id: crypto.randomUUID(), numberOfMeals: params.numberOfMeals, numberOfPeople: params.numberOfPeople, filters: params.filters, cuisineType: params.cuisineTypes?.[0], createdAt: new Date().toISOString() } });
    setLoading(false);
  }

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="pt-2 pb-1">
        <h1 className="text-4xl font-black tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-coral via-mango to-sunshine bg-clip-text text-transparent">
            Cuisinez en famille
          </span>
          <br />
          <span className="text-stone-800">avec </span>
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-mint via-sky to-lavender bg-clip-text text-transparent">l&apos;IA</span>
            <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 6" preserveAspectRatio="none">
              <path d="M0,3 Q25,0 50,3 T100,3" stroke="url(#wave)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <defs>
                <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6BCB77"/>
                  <stop offset="50%" stopColor="#4D96FF"/>
                  <stop offset="100%" stopColor="#9B59B6"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>
        <p className="text-stone-500 mt-3 text-base leading-relaxed">
          Entrez vos ingrédients ou planifiez votre semaine —
          <br />
          <span className="text-mint font-semibold">des recettes délicieuses</span> pour toute la famille !
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="chip chip-coral text-xs">🥗 Équilibré</span>
          <span className="chip chip-mango text-xs">👶 Enfants</span>
          <span className="chip chip-mint text-xs">⚡ Rapide</span>
          <span className="chip chip-sky text-xs">🌍 Du monde</span>
        </div>
      </div>

      <RecipeForm onGenerate={handleGenerate} onGeneratePlan={handleGeneratePlan} loading={loading} />

      {error && (
        <div className="bg-coral/10 border-2 border-coral/30 text-coral rounded-2xl p-4 text-sm flex items-start gap-3 animate-pop-in">
          <span className="shrink-0 text-lg">😅</span>
          {error}
        </div>
      )}

      {result?.type === 'recipe' && (
        <div className="animate-fade-in">
          <RecipeResult recipe={result.data} onSave={async () => { await saveRecipe(result.data as Recipe); setSaved(true); }} saved={saved} />
        </div>
      )}
      {result?.type === 'plan' && (
        <div className="animate-fade-in">
          <ShoppingListResult plan={result.data} />
        </div>
      )}
      {loading && !result && <SkeletonRecipeResult />}
    </div>
  );
}
