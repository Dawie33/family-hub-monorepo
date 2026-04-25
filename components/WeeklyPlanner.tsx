'use client';

import { MealPlan } from '@/types/recipe';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function WeeklyPlanner({ plan }: { plan: MealPlan }) {
  const weeks: (typeof plan.recipes[0] | null)[][] = [];
  let current: (typeof plan.recipes[0] | null)[] = Array(7).fill(null);
  let dayIndex = 0;

  plan.recipes.forEach((recipe) => {
    if (dayIndex === 7) { weeks.push(current); current = Array(7).fill(null); dayIndex = 0; }
    current[dayIndex] = recipe;
    dayIndex++;
  });
  weeks.push(current);

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-clay">📅</span>
        <h3 className="font-bold text-stone-900">Planning de la semaine</h3>
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="space-y-2">
          {weeks.length > 1 && (
            <p className="section-label">Semaine {wi + 1}</p>
          )}
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((day, di) => {
              const recipe = week[di];
              return (
                <div key={day} className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-stone-400 text-center">{day}</p>
                  <div className={`rounded-xl p-2 min-h-[68px] flex flex-col justify-center text-center transition-colors ${
                    recipe ? 'bg-clay-50 border border-clay-100' : 'bg-stone-50 border border-dashed border-stone-200'
                  }`}>
                    {recipe ? (
                      <>
                        <p className="text-xs font-semibold text-stone-800 leading-tight line-clamp-2">{recipe.title}</p>
                        <p className="text-xs text-stone-400 mt-1">{recipe.duration}</p>
                      </>
                    ) : (
                      <p className="text-stone-300 text-sm">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
