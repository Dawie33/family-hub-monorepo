'use client'

import { Workouts } from '@/domain/entities/workout'
import { Clock, Dumbbell, TrendingUp } from 'lucide-react'

interface WorkoutListItemProps {
  workout: Workouts
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

export function WorkoutListItem({ workout, selected, onSelect }: WorkoutListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-3 rounded-xl border text-left transition-all ${
        selected
          ? 'border-orange-500/50 bg-orange-500/10'
          : 'border-white/10 bg-slate-800/40 hover:border-white/20 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-semibold text-sm text-white truncate">{workout.name}</h4>
            {selected && (
              <svg className="h-4 w-4 text-orange-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {workout.workout_type && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Dumbbell className="h-3 w-3" />
                {workout.workout_type.replace(/_/g, ' ')}
              </span>
            )}
            {workout.difficulty && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${difficultyColors[workout.difficulty] || 'text-slate-400 bg-slate-500/20 border-slate-500/30'}`}
              >
                <TrendingUp className="h-3 w-3" />
                {difficultyLabels[workout.difficulty] || workout.difficulty}
              </span>
            )}
            {workout.estimated_duration && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-white/10">
                <Clock className="h-3 w-3" />
                {workout.estimated_duration} min
              </span>
            )}
          </div>
          {workout.description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{workout.description}</p>}
        </div>
      </div>
    </button>
  )
}
