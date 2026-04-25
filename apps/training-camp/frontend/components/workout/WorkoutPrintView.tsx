'use client'

import { Workouts } from '@/domain/entities/workout'
import { PrintSection } from './print/PrintSection'
import { printStyles } from './print/printStyles'

interface WorkoutPrintViewProps {
  workout: Workouts
}

export function WorkoutPrintView({ workout }: WorkoutPrintViewProps) {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <style>{printStyles}</style>

      <div id="workout-print-view">
        <div className="print-header">
          <div className="print-app-name">Training Camp · WOD</div>
          <h1 className="print-workout-name">{workout.name}</h1>
          <div className="print-meta">
            {workout.workout_type && <span className="print-tag">{workout.workout_type.replace(/_/g, ' ')}</span>}
            {workout.difficulty && <span className="print-tag print-tag-neutral">{workout.difficulty}</span>}
            {workout.estimated_duration && (
              <span className="print-tag print-tag-neutral">{workout.estimated_duration} min</span>
            )}
            {workout.intensity && (
              <span className="print-tag print-tag-neutral">{workout.intensity.replace(/_/g, ' ')}</span>
            )}
          </div>
          {workout.blocks?.stimulus && <p className="print-stimulus">"{workout.blocks.stimulus}"</p>}
        </div>

        {workout.blocks?.sections?.map((section, i) => (
          <PrintSection key={i} section={section} />
        ))}

        {workout.equipment_required && workout.equipment_required.length > 0 && (
          <div className="print-equipment">
            <strong>Équipement :</strong> {workout.equipment_required.join(', ')}
          </div>
        )}

        <div className="print-score-box">
          <div className="print-score-title">Mon score</div>
          <div className="print-score-line" />
          <div className="print-score-line" />
        </div>

        <div className="print-footer">
          <span>Training Camp</span>
          <span>{today}</span>
        </div>
      </div>
    </>
  )
}

export function printWorkout() {
  window.print()
}
