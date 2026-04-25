'use client'

import { Workouts } from '@/domain/entities/workout'

interface WorkoutInfoFormProps {
  workout: Workouts
  onChange: (workout: Workouts) => void
}

export function WorkoutInfoForm({ workout, onChange }: WorkoutInfoFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-accent/30 border border-gray-200 dark:border-border rounded-lg p-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-muted-foreground uppercase tracking-wide">
          Nom du workout
        </label>
        <input
          type="text"
          value={workout.name}
          onChange={e => onChange({ ...workout, name: e.target.value })}
          className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-card border border-gray-300 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-foreground"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <textarea
          value={workout.description}
          onChange={e => onChange({ ...workout, description: e.target.value })}
          rows={3}
          className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-card border border-gray-300 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-foreground"
        />
      </div>
    </div>
  )
}
