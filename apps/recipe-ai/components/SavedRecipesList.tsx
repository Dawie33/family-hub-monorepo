'use client';

import { useState, useEffect, useMemo } from 'react';
import { Recipe, DietaryFilter, Difficulty } from '@/types/recipe';
import { getSavedRecipes, deleteRecipe, updateRecipe } from '@/lib/recipeStorage';
import { SkeletonList } from '@/components/SkeletonLoaders';

const DIFFICULTY_STYLES: Record<string, string> = {
  débutant: 'bg-herb-50 text-herb',
  intermédiaire: 'bg-amber-50 text-amber-700',
  chef: 'bg-clay-50 text-clay',
};

const FILTERS: DietaryFilter[] = ['végétarien', 'vegan', 'sans gluten', 'sans lactose'];
const DIFFICULTIES: Difficulty[] = ['débutant', 'intermédiaire', 'chef'];

function IngredientRow({ ingredient, recipeTitle }: { ingredient: string; recipeTitle: string }) {
  const [substitutes, setSubstitutes] = useState<{ name: string; note: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetch_() {
    if (substitutes) { setOpen((v) => !v); return; }
    setLoading(true); setOpen(true);
    const res = await fetch('/api/substitute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient, recipeTitle }),
    });
    const data = await res.json();
    setSubstitutes(data.substitutes ?? []);
    setLoading(false);
  }

  return (
    <li className="space-y-1">
      <div className="flex items-start gap-2 group">
        <span className="w-1 h-1 rounded-full bg-clay mt-2 shrink-0" />
        <span className="text-sm text-stone-600 flex-1">{ingredient}</span>
        <button onClick={fetch_} className="shrink-0 opacity-0 group-hover:opacity-100 text-xs text-stone-400 hover:text-clay border border-stone-200 hover:border-clay-100 rounded px-1.5 py-0.5 transition-all bg-white">
          substitut ?
        </button>
      </div>
      {open && (
        <div className="ml-3 pl-3 border-l-2 border-clay-100 space-y-0.5 animate-slide-down">
          {loading
            ? <p className="text-xs text-stone-400 italic">Recherche…</p>
            : substitutes?.map((s, i) => (
                <p key={i} className="text-xs">
                  <span className="font-semibold text-clay">{s.name}</span>
                  <span className="text-stone-500"> — {s.note}</span>
                </p>
              ))}
        </div>
      )}
    </li>
  );
}

function StarRating({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="text-xl leading-none transition-transform hover:scale-110"
        >
          <span className={(hover || value || 0) >= star ? 'text-amber-400' : 'text-stone-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function SavedRecipesList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDiet, setFilterDiet] = useState<DietaryFilter | ''>('');
  const [filterDiff, setFilterDiff] = useState<Difficulty | ''>('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  useEffect(() => {
    getSavedRecipes().then((data) => {
      setRecipes(data);
      setLoading(false);
    });
  }, []);

  async function refresh() {
    const data = await getSavedRecipes();
    setRecipes(data);
  }

  const filtered = useMemo(() => recipes.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDiet && !r.filters.includes(filterDiet)) return false;
    if (filterDiff && r.difficulty !== filterDiff) return false;
    return true;
  }), [recipes, search, filterDiet, filterDiff]);

  if (loading) {
    return <SkeletonList count={4} />;
  }

  if (recipes.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-lg font-semibold text-stone-700">Aucune recette sauvegardée</p>
        <p className="text-sm text-stone-400 mt-1">Générez une recette et cliquez sur &quot;Sauvegarder&quot;</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une recette…"
            className="w-full pl-9 pr-4 py-2.5 border-2 border-stone-200 focus:border-clay rounded-xl text-sm text-stone-700 placeholder-stone-400 outline-none bg-stone-50/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterDiet}
            onChange={(e) => setFilterDiet(e.target.value as DietaryFilter | '')}
            className="border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-600 focus:outline-none focus:border-clay bg-white transition-colors"
          >
            <option value="">Tous les régimes</option>
            {FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value as Difficulty | '')}
            className="border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-600 focus:outline-none focus:border-clay bg-white transition-colors"
          >
            <option value="">Toutes difficultés</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || filterDiet || filterDiff) && (
            <button onClick={() => { setSearch(''); setFilterDiet(''); setFilterDiff(''); }} className="text-xs text-stone-400 hover:text-stone-700 px-2 transition-colors">
              Effacer ×
            </button>
          )}
          <span className="text-xs text-stone-400 ml-auto">
            {filtered.length} / {recipes.length} recette{recipes.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((recipe) => (
          <div key={recipe.id} className="card card-hover p-5 space-y-3 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="font-bold text-stone-900 cursor-pointer hover:text-clay transition-colors leading-snug"
                onClick={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
              >
                {recipe.title}
              </h3>
              <button onClick={() => { deleteRecipe(recipe.id); refresh(); if (expanded === recipe.id) setExpanded(null); }} className="shrink-0 text-stone-300 hover:text-red-400 transition-colors text-lg leading-none p-0.5">×</button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-idle cursor-default !text-stone-500 !text-xs !py-0.5">⏱ {recipe.duration}</span>
              <span className={`chip cursor-default !text-xs !py-0.5 ${DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-stone-50 text-stone-500'}`}>
                {recipe.difficulty}
              </span>
              {recipe.cuisineType && (
                <span className="chip cursor-default !text-xs !py-0.5 bg-blue-50 text-blue-600">{recipe.cuisineType}</span>
              )}
            </div>

            {/* Stars */}
            <StarRating value={recipe.rating} onChange={(v) => { updateRecipe(recipe.id, { rating: v }); refresh(); }} />

            {/* Expanded */}
            {expanded === recipe.id && (
              <div className="pt-3 border-t border-stone-100 space-y-4 animate-slide-down">
                {recipe.nutrition && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'kcal', val: String(recipe.nutrition.calories), bg: 'bg-clay-50', t: 'text-clay' },
                      { label: 'prot.', val: `${recipe.nutrition.proteins}g`, bg: 'bg-blue-50', t: 'text-blue-600' },
                      { label: 'gluc.', val: `${recipe.nutrition.carbs}g`, bg: 'bg-amber-50', t: 'text-amber-600' },
                      { label: 'lip.', val: `${recipe.nutrition.fat}g`, bg: 'bg-purple-50', t: 'text-purple-600' },
                    ].map(({ label, val, bg, t }) => (
                      <div key={label} className={`${bg} rounded-lg p-2 text-center`}>
                        <p className="text-xs text-stone-400">{label}</p>
                        <p className={`text-xs font-bold ${t}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="section-label mb-1.5">Ingrédients</p>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((item, i) => (
                      <IngredientRow key={i} ingredient={item} recipeTitle={recipe.title} />
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="section-label mb-1.5">Préparation</p>
                  <ol className="space-y-2">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-stone-700">
                        <span className="step-circle !w-5 !h-5 !text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Comment */}
                <div>
                  <p className="section-label mb-1.5">Note personnelle</p>
                  {editingComment === recipe.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        rows={2}
                        placeholder="Vos remarques, ajustements…"
                        className="w-full border-2 border-stone-200 focus:border-clay rounded-xl px-3 py-2 text-sm text-stone-700 placeholder-stone-400 outline-none resize-none transition-colors"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { updateRecipe(recipe.id, { comment: commentDraft }); setEditingComment(null); refresh(); }} className="text-sm text-white bg-clay hover:bg-clay-700 px-4 py-1.5 rounded-lg transition-colors font-medium">
                          Enregistrer
                        </button>
                        <button onClick={() => setEditingComment(null)} className="text-sm text-stone-400 hover:text-stone-600 px-3 py-1.5">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => { setEditingComment(recipe.id); setCommentDraft(recipe.comment ?? ''); }}
                      className="cursor-pointer text-sm text-stone-400 italic border border-dashed border-stone-200 rounded-xl px-3 py-2.5 hover:border-clay-100 hover:text-stone-600 transition-all min-h-[40px] bg-stone-50/50"
                    >
                      {recipe.comment || 'Cliquez pour ajouter une note…'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
              className="text-xs text-clay hover:text-clay-700 font-semibold mt-auto pt-1 text-left transition-colors"
            >
              {expanded === recipe.id ? 'Réduire ▲' : 'Voir la recette ▼'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-stone-400">
          Aucune recette ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
