import { CROSSFIT_LIFTS, type OneRepMax } from '@/services'

interface OneRepMaxTabProps {
  oneRepMaxes: OneRepMax[]
  liftValues: Record<string, { value: string; source: 'real' | 'estimated' }>
  savingLift: string | null
  onSetEntry: (lift: string, patch: Partial<{ value: string; source: 'real' | 'estimated' }>) => void
  onSave: (lift: string) => void
}

export function OneRepMaxTab({ oneRepMaxes, liftValues, savingLift, onSetEntry, onSave }: OneRepMaxTabProps) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">Mes 1 Rep Max</h2>
        <p className="text-sm text-slate-400 mt-1">
          Renseignez vos maximums pour que l'IA calibre les charges en conséquence.
        </p>
      </div>

      <div className="space-y-3">
        {CROSSFIT_LIFTS.map((lift) => {
          const entry = liftValues[lift.value] ?? { value: '', source: 'real' as const }
          const existing = oneRepMaxes.find((r) => r.lift === lift.value)
          const isSaving = savingLift === lift.value

          return (
            <div key={lift.value} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{lift.label}</p>
                {existing && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dernier : {existing.value} kg · {existing.source === 'real' ? 'Réel' : 'Estimé'}
                  </p>
                )}
              </div>

              {/* Source toggle */}
              <div className="flex rounded-lg overflow-hidden border border-slate-700/50 text-xs font-medium flex-shrink-0">
                {(['real', 'estimated'] as const).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onSetEntry(lift.value, { source: src })}
                    className={`px-2.5 py-1.5 transition-colors ${
                      entry.source === src ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {src === 'real' ? 'Réel' : 'Estimé'}
                  </button>
                ))}
              </div>

              {/* kg input */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number"
                  value={entry.value}
                  onChange={(e) => onSetEntry(lift.value, { value: e.target.value })}
                  placeholder="kg"
                  min="0"
                  step="0.5"
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors"
                />
                <span className="text-xs text-slate-500">kg</span>
              </div>

              <button
                type="button"
                onClick={() => onSave(lift.value)}
                disabled={isSaving || !entry.value}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-all shadow-sm shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isSaving ? '...' : 'OK'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
