'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminWorkoutExercise } from '@/domain/entities/workout'

interface WorkoutExercisesListProps {
  exercises?: AdminWorkoutExercise[]
}

export function WorkoutExercisesList({ exercises }: WorkoutExercisesListProps) {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercises ({exercises.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={ex.id} className="border-b pb-3 last:border-0">
              <div className="font-medium">
                {idx + 1}. {ex.exercise_name}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {ex.sets && <span className="mr-4">Sets: {ex.sets}</span>}
                {ex.reps && <span className="mr-4">Reps: {ex.reps}</span>}
                {ex.weight && <span className="mr-4">Weight: {ex.weight}</span>}
                {ex.time && <span className="mr-4">Time: {ex.time}</span>}
                {ex.distance && <span className="mr-4">Distance: {ex.distance}</span>}
              </div>
              {ex.specific_instructions && (
                <div className="text-sm text-muted-foreground mt-1">
                  Note: {ex.specific_instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
