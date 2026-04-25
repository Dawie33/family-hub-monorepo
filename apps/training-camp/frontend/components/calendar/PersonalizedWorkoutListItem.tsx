'use client'

import { Sparkles } from 'lucide-react'
import { Check } from 'lucide-react'

interface PersonalizedWorkoutListItemProps {
  workout: {
    id: string
    wod_date?: string | null
    plan_json?: {
      name?: string
      workout_type?: string
      difficulty?: string
      estimated_duration?: number
    }
  }
  selected: boolean
  onSelect: () => void
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-400 bg-green-500/20 border-green-500/30',
  intermediate: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  advanced: 'text-red-400 bg-red-500/20 border-red-500/30',
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

export function PersonalizedWorkoutListItem({ workout, selected, onSelect }: PersonalizedWorkoutListItemProps) {
  const plan = workout.plan_json

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-3 rounded-xl border text-left transition-all ${
        selected
          ? 'border-blue-500/50 bg-blue-500/10'
          : 'border-white/10 bg-slate-800/40 hover:border-white/20 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
            <h4 className="font-semibold text-sm text-white truncate">{plan?.name || 'Workout Personnalisé'}</h4>
            {selected && <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {plan?.workout_type && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {plan.workout_type.replace(/_/g, ' ')}
              </span>
            )}
            {plan?.difficulty && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${difficultyColors[plan.difficulty] || 'text-slate-400 bg-slate-500/20 border-slate-500/30'}`}
              >
                {difficultyLabels[plan.difficulty] || plan.difficulty}
              </span>
            )}
            {plan?.estimated_duration && (
              <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-white/10">
                {plan.estimated_duration} min
              </span>
            )}
            {workout.wod_date && (
              <span className="text-slate-500">
                {new Date(workout.wod_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
