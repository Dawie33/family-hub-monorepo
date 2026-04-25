import { Exercise } from '@/domain/entities/workout-structure'
import { ExerciseDisplay } from './ExerciseDisplay'

interface SectionExercisesListProps {
  exercises: Exercise[]
  rounds?: number
  isStarting?: boolean
  isSectionCompleted?: boolean
  canStart?: boolean
  onExerciseClick?: (exerciseId: string) => void
  onStartSection?: () => void
}

export function SectionExercisesList({
  exercises,
  rounds,
  isStarting,
  isSectionCompleted,
  canStart = true,
  onExerciseClick,
  onStartSection,
}: SectionExercisesListProps) {
  return (
    <div className="space-y-2 pl-4 border-l-2 border-orange-500/30">
      {exercises.map((exercise, exIdx) => (
        <ExerciseDisplay
          key={exIdx}
          exercise={exercise}
          isStarting={false}
          isCompleted={false}
          rounds={rounds}
          onExerciseClick={onExerciseClick}
        />
      ))}

      {isStarting && !isSectionCompleted && (
        <div className="space-y-2 mt-2">
          <button
            onClick={onStartSection}
            disabled={!canStart}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium shadow-md ${
              canStart
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Démarrer</span>
          </button>
          {!canStart && (
            <p className="text-xs text-slate-500 text-center">Terminez la section précédente pour débloquer</p>
          )}
        </div>
      )}
    </div>
  )
}
