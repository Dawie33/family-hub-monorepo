'use client';

import { useState } from 'react';
import { GeneratedMealPlan, GeneratedRecipe } from '@/types/recipe';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

const DIFFICULTY_STYLES: Record<string, string> = {
  débutant:      'bg-green-50 text-green-700',
  intermédiaire: 'bg-amber-50 text-amber-700',
  chef:          'bg-orange-50 text-orange-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Viandes & Poissons': '🥩',
  'Légumes & Fruits': '🥦',
  'Produits laitiers': '🧀',
  'Épicerie & Condiments': '🫙',
  'Féculents & Céréales': '🌾',
  Surgelés: '❄️',
  Autres: '🛒',
};

interface ShoppingListResultProps {
  plan: GeneratedMealPlan & { numberOfMeals: number; numberOfPeople: number; filters: string[] };
  onSaveRecipes?: (recipes: GeneratedRecipe[]) => void;
}

export default function ShoppingListResult({ plan, onSaveRecipes }: ShoppingListResultProps) {
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [recipesSaved, setRecipesSaved] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  function toggleCheck(key: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleExport() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const marginLeft = 15, pageWidth = 210, contentWidth = pageWidth - 30;
    let y = 20;

    function checkPage(needed = 8) { if (y + needed > 280) { doc.addPage(); y = 20; } }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(28, 25, 23);
    doc.text('Liste de courses', marginLeft, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `${plan.numberOfMeals} repas · ${plan.numberOfPeople} personne${plan.numberOfPeople > 1 ? 's' : ''}${plan.filters.length ? ' · ' + plan.filters.join(', ') : ''}`,
      marginLeft, y
    );
    y += 4;
    doc.setDrawColor(200, 100, 60);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 8;

    for (const cat of plan.shoppingList) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(28, 25, 23);
      doc.text(`${CATEGORY_ICONS[cat.category] ?? ''} ${cat.category}`.trim(), marginLeft, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 55, 52);
      for (const item of cat.items) {
        checkPage(6);
        doc.setDrawColor(180, 170, 165);
        doc.rect(marginLeft, y - 3.5, 3.5, 3.5);
        const lines = doc.splitTextToSize(item, contentWidth - 8);
        doc.text(lines, marginLeft + 6, y);
        y += lines.length * 5 + 1;
      }
      y += 4;
    }
    doc.save(`liste-courses-${plan.numberOfMeals}-repas.pdf`);
  }

  async function handleSaveRecipes() {
    if (onSaveRecipes) {
      onSaveRecipes(plan.recipes);
    } else {
      await Promise.allSettled(
        plan.recipes.map((recipe) =>
          fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: recipe.title,
              ingredients: recipe.ingredients.map((item) => ({ item })),
              instructions: recipe.steps.join('\n'),
              source: 'chat',
              tags: recipe.filters ?? [],
            }),
          })
        )
      );
    }
    setRecipesSaved(true);
    setConfirmSave(false);
  }

  const totalItems = plan.shoppingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="recipe-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="recipe-section-label mb-1">Plan généré</p>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {plan.numberOfMeals} repas pour {plan.numberOfPeople} personne{plan.numberOfPeople > 1 ? 's' : ''}
            </h2>
            {plan.filters.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {plan.filters.map((f) => (
                  <span key={f} className="recipe-chip recipe-chip-idle !text-xs cursor-default bg-green-50 text-green-700">{f}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="recipe-chip recipe-chip-idle !px-4 !py-2 !rounded-xl">
              📥 Exporter (PDF)
            </button>
            {!recipesSaved && !confirmSave && (
              <button onClick={() => setConfirmSave(true)} className="recipe-chip recipe-chip-clay !px-4 !py-2 !rounded-xl text-white">
                💾 Sauvegarder les recettes
              </button>
            )}
            {confirmSave && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2">
                <span className="text-sm text-stone-700">Sauvegarder les {plan.recipes.length} recettes ?</span>
                <button onClick={handleSaveRecipes} className="text-sm font-bold text-green-600 hover:text-green-700">Oui</button>
                <span className="text-stone-300">·</span>
                <button onClick={() => setConfirmSave(false)} className="text-sm text-stone-400 hover:text-stone-600">Non</button>
              </div>
            )}
            {recipesSaved && (
              <span className="recipe-chip recipe-chip-idle !px-4 !py-2 !rounded-xl bg-green-50 text-green-700 cursor-default">
                ✓ {plan.recipes.length} recettes sauvegardées
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Liste de courses */}
      <div className="recipe-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <span>🛒</span> Liste de courses
          </h3>
          <span className="text-sm text-stone-400">{checkedCount}/{totalItems} cochés</span>
        </div>

        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {plan.shoppingList.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <p className="recipe-section-label flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[cat.category] ?? '🛒'}</span>
                {cat.category}
              </p>
              <ul className="space-y-2">
                {cat.items.map((item) => {
                  const key = `${cat.category}-${item}`;
                  const checked = checkedItems.has(key);
                  return (
                    <li key={key} onClick={() => toggleCheck(key)} className="flex items-start gap-2.5 cursor-pointer group">
                      <span className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300 group-hover:border-green-400'
                      }`}>
                        {checked && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm transition-colors leading-relaxed ${checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Recettes */}
      <div className="space-y-3">
        <p className="recipe-section-label px-1">Les recettes</p>
        {plan.recipes.map((recipe, i) => (
          <div key={i} className="recipe-card p-5 space-y-3">
            <div
              className="flex items-start justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedRecipe(expandedRecipe === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <h4 className="font-semibold text-stone-900">{recipe.title}</h4>
              </div>
              <span className="text-stone-400 text-sm shrink-0">{expandedRecipe === i ? '▲' : '▼'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="recipe-chip recipe-chip-idle cursor-default !text-xs !py-0.5">⏱ {recipe.duration}</span>
              <span className={`recipe-chip cursor-default !text-xs !py-0.5 ${DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-stone-50 text-stone-500'}`}>
                {recipe.difficulty}
              </span>
            </div>

            {recipe.nutrition && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: 'kcal', v: String(recipe.nutrition.calories), bg: 'bg-orange-50', t: 'text-orange-600' },
                  { l: 'prot.', v: `${recipe.nutrition.proteins}g`, bg: 'bg-blue-50', t: 'text-blue-600' },
                  { l: 'gluc.', v: `${recipe.nutrition.carbs}g`, bg: 'bg-amber-50', t: 'text-amber-600' },
                  { l: 'lip.', v: `${recipe.nutrition.fat}g`, bg: 'bg-purple-50', t: 'text-purple-600' },
                ].map(({ l, v, bg, t }) => (
                  <div key={l} className={`${bg} rounded-lg p-2 text-center`}>
                    <p className="text-xs text-stone-400">{l}</p>
                    <p className={`text-xs font-bold ${t}`}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            {expandedRecipe === i && (
              <div className="pt-3 border-t border-stone-100 space-y-4 animate-slide-down">
                <div>
                  <p className="recipe-section-label mb-1.5">Ingrédients</p>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((item, j) => (
                      <li key={j} className="flex gap-2 text-sm text-stone-600">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="recipe-section-label mb-1.5">Préparation</p>
                  <ol className="space-y-2">
                    {recipe.steps.map((step, j) => (
                      <li key={j} className="flex gap-3 text-sm text-stone-700">
                        <span className="recipe-step-circle shrink-0 mt-0.5">{j + 1}</span>
                        <span className="leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
