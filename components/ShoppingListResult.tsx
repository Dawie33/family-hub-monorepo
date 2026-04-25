'use client';

import { useState } from 'react';
import { MealPlan, Recipe } from '@/types/recipe';
import { saveRecipe } from '@/lib/recipeStorage';

const DIFFICULTY_STYLES: Record<string, string> = {
  débutant: 'bg-herb-50 text-herb',
  intermédiaire: 'bg-amber-50 text-amber-700',
  chef: 'bg-clay-50 text-clay',
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

export default function ShoppingListResult({ plan }: { plan: MealPlan }) {
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
    doc.setDrawColor(200, 75, 49);
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

  function handleSaveRecipes() {
    const now = new Date().toISOString();
    plan.recipes.forEach((recipe) => {
      saveRecipe({ ...recipe, id: crypto.randomUUID(), filters: plan.filters, createdAt: now } as Recipe);
    });
    setRecipesSaved(true);
    setConfirmSave(false);
  }

  const totalItems = plan.shoppingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="section-label mb-1">Plan généré</p>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {plan.numberOfMeals} repas pour {plan.numberOfPeople} personne{plan.numberOfPeople > 1 ? 's' : ''}
            </h2>
            {(plan.filters.length > 0 || plan.cuisineType) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {plan.cuisineType && <span className="chip !text-xs bg-blue-50 text-blue-600 cursor-default">{plan.cuisineType}</span>}
                {plan.filters.map((f) => <span key={f} className="chip !text-xs bg-herb-50 text-herb cursor-default">{f}</span>)}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="chip chip-idle !px-4 !py-2 !rounded-xl">
              📥 Exporter (PDF)
            </button>
            {!recipesSaved && !confirmSave && (
              <button onClick={() => setConfirmSave(true)} className="chip chip-active-clay !px-4 !py-2 !rounded-xl">
                💾 Sauvegarder les recettes
              </button>
            )}
            {confirmSave && (
              <div className="flex items-center gap-2 bg-clay-50 border border-clay-100 rounded-xl px-4 py-2">
                <span className="text-sm text-stone-700">Sauvegarder les {plan.recipes.length} recettes ?</span>
                <button onClick={handleSaveRecipes} className="text-sm font-bold text-herb hover:text-herb/80">Oui</button>
                <span className="text-stone-300">·</span>
                <button onClick={() => setConfirmSave(false)} className="text-sm text-stone-400 hover:text-stone-600">Non</button>
              </div>
            )}
            {recipesSaved && (
              <span className="chip bg-herb-50 text-herb cursor-default !px-4 !py-2 !rounded-xl">
                ✓ {plan.recipes.length} recettes sauvegardées
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shopping list */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <span>🛒</span> Liste de courses
          </h3>
          <span className="text-sm text-stone-400">{checkedCount}/{totalItems} cochés</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-herb rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {plan.shoppingList.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <p className="section-label flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[cat.category] ?? '🛒'}</span>
                {cat.category}
              </p>
              <ul className="space-y-2">
                {cat.items.map((item) => {
                  const key = `${cat.category}-${item}`;
                  const checked = checkedItems.has(key);
                  return (
                    <li
                      key={key}
                      onClick={() => toggleCheck(key)}
                      className="flex items-start gap-2.5 cursor-pointer group"
                    >
                      <span className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked ? 'bg-herb border-herb text-white' : 'border-stone-300 group-hover:border-herb'
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

      {/* Recipes */}
      <div className="space-y-3">
        <p className="section-label px-1">Les recettes</p>
        {plan.recipes.map((recipe, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div
              className="flex items-start justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedRecipe(expandedRecipe === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-clay-50 text-clay text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <h4 className="font-semibold text-stone-900">{recipe.title}</h4>
              </div>
              <span className="text-stone-400 text-sm shrink-0">{expandedRecipe === i ? '▲' : '▼'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-idle cursor-default !text-xs !py-0.5">⏱ {recipe.duration}</span>
              <span className={`chip cursor-default !text-xs !py-0.5 ${DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-stone-50 text-stone-500'}`}>
                {recipe.difficulty}
              </span>
            </div>

            {recipe.nutrition && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: 'kcal', v: String(recipe.nutrition.calories), bg: 'bg-clay-50', t: 'text-clay' },
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
                  <p className="section-label mb-1.5">Ingrédients</p>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((item, j) => (
                      <li key={j} className="flex gap-2 text-sm text-stone-600">
                        <span className="w-1 h-1 rounded-full bg-clay mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="section-label mb-1.5">Préparation</p>
                  <ol className="space-y-2">
                    {recipe.steps.map((step, j) => (
                      <li key={j} className="flex gap-3 text-sm text-stone-700">
                        <span className="step-circle shrink-0 mt-0.5">{j + 1}</span>
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
