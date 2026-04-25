'use client';

import { useState, KeyboardEvent } from 'react';
import { DietaryFilter, CuisineType, Difficulty, MaxDuration } from '@/types/recipe';

const FILTERS: DietaryFilter[] = ['végétarien', 'vegan', 'sans gluten', 'sans lactose'];
const CUISINES: CuisineType[] = ['française', 'italienne', 'asiatique', 'mexicaine', 'méditerranéenne', 'indienne', 'américaine'];
const PLAT_TYPES = ['viande', 'poisson', 'volaille', 'pâtes', 'soupe', 'salade', 'dessert'];
const DIFFICULTIES: Difficulty[] = ['débutant', 'intermédiaire', 'chef'];
const DURATIONS: MaxDuration[] = ['15 min', '30 min', '45 min', '1h'];

type Mode = 'recette' | 'plan';

export interface GenerateParams {
  ingredients: string[];
  filters: DietaryFilter[];
  cuisineTypes?: CuisineType[];
  platTypes?: string[];
  difficulty?: Difficulty;
  maxDuration?: MaxDuration;
}

export interface PlanParams {
  numberOfMeals: number;
  numberOfPeople: number;
  filters: DietaryFilter[];
  cuisineTypes?: CuisineType[];
  platTypes?: string[];
  difficulty?: Difficulty;
  maxDuration?: MaxDuration;
}

interface RecipeFormProps {
  onGenerate: (params: GenerateParams) => void;
  onGeneratePlan: (params: PlanParams) => void;
  loading: boolean;
}

export default function RecipeForm({ onGenerate, onGeneratePlan, loading }: RecipeFormProps) {
  const [mode, setMode] = useState<Mode>('recette');
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [numberOfMeals, setNumberOfMeals] = useState(5);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedFilters, setSelectedFilters] = useState<DietaryFilter[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [platTypes, setPlatTypes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [maxDuration, setMaxDuration] = useState<MaxDuration | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);

  function addIngredient() {
    const value = input.trim();
    if (value && !ingredients.includes(value)) setIngredients([...ingredients, value]);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addIngredient(); }
    if (e.key === 'Backspace' && input === '' && ingredients.length > 0)
      setIngredients(ingredients.slice(0, -1));
  }

  function toggleFilter(f: DietaryFilter) {
    setSelectedFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }

  function handleSubmit() {
    const common = { filters: selectedFilters, cuisineTypes, platTypes, difficulty, maxDuration };
    if (mode === 'recette') {
      if (ingredients.length === 0) return;
      onGenerate({ ingredients, ...common });
    } else {
      onGeneratePlan({ numberOfMeals, numberOfPeople, ...common });
    }
  }

  function toggleCuisine(c: CuisineType) {
    setCuisineTypes((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function togglePlatType(p: string) {
    setPlatTypes((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  const advancedCount = [cuisineTypes.length > 0, platTypes.length > 0, difficulty, maxDuration].filter(Boolean).length;

  return (
    <div className="card p-6 space-y-6">
      {/* Mode toggle */}
      <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
        {(['recette', 'plan'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === m
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {m === 'recette' ? '🍳 Recette unique' : '🛒 Plan de repas'}
          </button>
        ))}
      </div>

      {/* Ingredients input */}
      {mode === 'recette' && (
        <div>
          <label className="block mb-2 text-sm font-bold text-stone-600">Ingrédients disponibles</label>
          <div className="flex flex-wrap gap-2 p-3 border-2 border-coral/20 rounded-2xl min-h-[52px] focus-within:border-coral focus-within:bg-coral/5 transition-all bg-mango/5">
            {ingredients.map((item, i) => (
              <span key={item} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full font-semibold text-white shadow-sm" style={{ background: ['#FF6B6B', '#FF9F43', '#6BCB77', '#4D96FF', '#9B59B6'][i % 5] }}>
                {item}
                <button
                  onClick={() => setIngredients(ingredients.filter((i) => i !== item))}
                  className="opacity-70 hover:opacity-100 font-bold leading-none ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addIngredient}
              placeholder={ingredients.length === 0 ? 'Tomates, poulet, ail… (Entrée pour ajouter)' : ''}
              className="flex-1 min-w-[200px] outline-none text-sm text-stone-700 placeholder-stone-400 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Plan counters */}
      {mode === 'plan' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nombre de repas', value: numberOfMeals, set: setNumberOfMeals, min: 1, max: 14, color: '#FF6B6B' },
            { label: 'Personnes', value: numberOfPeople, set: setNumberOfPeople, min: 1, max: 20, color: '#6BCB77' },
          ].map(({ label, value, set, min, max, color }) => (
            <div key={label}>
              <label className="block mb-2 text-sm font-bold" style={{ color }}>{label}</label>
              <div className="flex items-center rounded-2xl border-2 overflow-hidden" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <button
                  onClick={() => set((n) => Math.max(min, n - 1))}
                  className="px-4 py-3 text-stone-400 hover:text-stone-700 text-xl font-light transition-colors"
                  style={{ color }}
                >−</button>
                <span className="flex-1 text-center text-xl font-black text-stone-900">{value}</span>
                <button
                  onClick={() => set((n) => Math.min(max, n + 1))}
                  className="px-4 py-3 text-stone-400 hover:text-stone-700 text-xl font-light transition-colors"
                  style={{ color }}
                >+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dietary filters */}
      <div>
        <label className="block mb-2 text-sm font-bold text-stone-600">Régime alimentaire</label>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f, i) => {
            const colors = ['chip-coral', 'chip-mango', 'chip-mint', 'chip-sky'];
            const activeClass = colors[i % colors.length];
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`chip ${selectedFilters.includes(f) ? activeClass : 'chip-idle'}`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced options */}
      <div>
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            viewBox="0 0 12 12" fill="currentColor"
          >
            <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Options avancées
          {advancedCount > 0 && (
            <span className="bg-gradient-to-r from-coral to-mango text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {advancedCount}
            </span>
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-coral/20 animate-slide-down">
            <div>
              <label className="block mb-2 text-sm font-bold text-stone-600">Type de plat</label>
              <div className="flex flex-wrap gap-2">
                {PLAT_TYPES.map((p, i) => {
                  const colors = ['chip-coral', 'chip-mango', 'chip-mint', 'chip-sky', 'chip-lavender', 'chip-peach', 'chip-sunshine'];
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatType(p)}
                      className={`chip ${platTypes.includes(p) ? colors[i % colors.length] : 'chip-idle'}`}
                    >{p}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-stone-600">Type de cuisine</label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c, i) => {
                  const colors = ['chip-coral', 'chip-mango', 'chip-mint', 'chip-sky', 'chip-lavender', 'chip-peach', 'chip-sunshine'];
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`chip ${cuisineTypes.includes(c) ? colors[i % colors.length] : 'chip-idle'}`}
                    >{c}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-stone-600">Difficulté</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d, i) => {
                  const colors = ['chip-mint', 'chip-sky', 'chip-lavender'];
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(difficulty === d ? undefined : d)}
                      className={`chip ${difficulty === d ? colors[i] : 'chip-idle'}`}
                    >{d}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-stone-600">Temps maximum</label>
              <div className="flex gap-2">
                {DURATIONS.map((dur, i) => {
                  const colors = ['chip-coral', 'chip-mango', 'chip-sunshine', 'chip-mint'];
                  return (
                    <button
                      key={dur}
                      onClick={() => setMaxDuration(maxDuration === dur ? undefined : dur)}
                      className={`chip ${maxDuration === dur ? colors[i] : 'chip-idle'}`}
                    >{dur}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (mode === 'recette' && ingredients.length === 0)}
        className="btn-cta w-full"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin" />
            <span className="font-semibold">Génération en cours…</span>
          </>
        ) : mode === 'recette' ? (
          <>
            <span className="text-xl">🍳</span>
            <span className="font-semibold">Générer la recette</span>
          </>
        ) : (
          <>
            <span className="text-xl">🛒</span>
            <span className="font-semibold">Générer le plan de repas</span>
          </>
        )}
      </button>
    </div>
  );
}
