'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export type SportType = 'crossfit' | 'running' | 'hyrox' | 'athx'
export type TechFocus = '' | 'skills' | 'altero' | 'force'

export interface DayConfig {
  date: string
  isBox: boolean
  isRest: boolean
  sports: SportType[]
  crossfitFocus: TechFocus
}

const SPORTS: { type: SportType; label: string; activeClass: string; hoverClass: string }[] = [
  { type: 'crossfit', label: 'CrossFit', activeClass: 'border-orange-500 bg-orange-500/20 text-orange-300', hoverClass: 'hover:border-orange-500/40 hover:text-orange-400' },
  { type: 'running',  label: 'Running',  activeClass: 'border-green-500 bg-green-500/20 text-green-300',   hoverClass: 'hover:border-green-500/40 hover:text-green-400' },
  { type: 'hyrox',   label: 'HYROX',    activeClass: 'border-yellow-500 bg-yellow-500/20 text-yellow-300', hoverClass: 'hover:border-yellow-500/40 hover:text-yellow-400' },
  { type: 'athx',    label: 'ATHX',     activeClass: 'border-purple-500 bg-purple-500/20 text-purple-300', hoverClass: 'hover:border-purple-500/40 hover:text-purple-400' },
]

const TECH_OPTIONS: { value: TechFocus; label: string }[] = [
  { value: '', label: 'Auto' },
  { value: 'skills', label: 'Skills' },
  { value: 'altero', label: 'Altéro' },
  { value: 'force', label: 'Force' },
]

interface DayConfigGridProps {
  days: Date[]
  dayConfigs: DayConfig[]
  onToggleBox: (idx: number) => void
  onToggleRest: (idx: number) => void
  onToggleSport: (idx: number, sport: SportType) => void
  onCrossfitFocusChange: (idx: number, focus: TechFocus) => void
}

export function DayConfigGrid({ days, dayConfigs, onToggleBox, onToggleRest, onToggleSport, onCrossfitFocusChange }: DayConfigGridProps) {
  return (
    <div className="space-y-1.5">
      {days.map((day, idx) => {
        const config = dayConfigs[idx]
        const isBlocked = config.isBox || config.isRest
        const hasSports = config.sports.length > 0
        const hasCrossFit = config.sports.includes('crossfit')

        return (
          <div
            key={idx}
            className={`rounded-xl border transition-all ${
              config.isRest
                ? 'border-slate-700/50 bg-slate-800/30 opacity-50'
                : config.isBox
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : hasSports
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center px-3 py-2.5">

              {/* Jour + date — même ligne, gauche */}
              <div className="w-32 flex-shrink-0 flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white capitalize">
                  {format(day, 'EEE', { locale: fr })}
                </p>
                <p className="text-xs text-slate-500">{format(day, 'dd MMM', { locale: fr })}</p>
              </div>

              {/* Séparateur vertical */}
              <div className="w-px h-6 bg-white/10 flex-shrink-0 mr-4" />

              {/* Sport pills */}
              {!isBlocked ? (
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {SPORTS.map(({ type, label, activeClass, hoverClass }) => {
                    const selected = config.sports.includes(type)
                    return (
                      <button
                        key={type}
                        onClick={() => onToggleSport(idx, type)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                          selected ? activeClass : `border-slate-700 text-slate-500 ${hoverClass}`
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="flex-1 text-xs text-slate-600 italic">
                  {config.isBox ? 'WOD du jour à importer' : 'Journée de récupération'}
                </p>
              )}

              {/* Box / Repos — extrême droite */}
              <div className="flex gap-1.5 ml-4">
                <button
                  onClick={() => onToggleBox(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    config.isBox
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-medium'
                      : 'border-slate-700 text-slate-500 hover:border-blue-500/40 hover:text-slate-300'
                  }`}
                >
                  Box
                </button>
                <button
                  onClick={() => onToggleRest(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    config.isRest
                      ? 'border-slate-500 bg-slate-700/50 text-slate-300 font-medium'
                      : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  Repos
                </button>
              </div>
            </div>

            {/* Focus CrossFit — sous-ligne */}
            {!isBlocked && hasCrossFit && (
              <div className="flex items-center gap-2 px-3 pb-2 border-t border-white/5 pt-1.5 ml-[calc(4rem+1rem+85px+1rem)]">
                <span className="text-[10px] text-slate-500">Focus :</span>
                {TECH_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onCrossfitFocusChange(idx, opt.value)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                      config.crossfitFocus === opt.value
                        ? 'border-orange-500/60 bg-orange-500/10 text-orange-300'
                        : 'border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
