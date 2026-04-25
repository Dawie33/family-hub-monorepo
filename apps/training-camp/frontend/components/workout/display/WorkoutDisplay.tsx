import { WorkoutBlocks } from '@/domain/entities/workout-structure'
import { SectionDisplay } from './SectionDisplay'

interface WorkoutDisplayProps {
  blocks: WorkoutBlocks
  showTitle?: boolean
  isStarting?: boolean
  onExerciseClick?: (exerciseId: string) => void
}

/**
 * Affiche un workout complet avec ses blocs et exercices.
 * @param {WorkoutDisplayProps} props - Les propriétés de l'affichage du workout.
 * @returns {JSX.Element} - L'affichage du workout rendu.
 */
export function WorkoutDisplay({ blocks, isStarting, onExerciseClick }: WorkoutDisplayProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {blocks.stimulus && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="font-semibold text-orange-400 mb-2">Objectif</h3>
          <p className="text-slate-300 text-sm lg:text-base">{blocks.stimulus}</p>
        </div>
      )}

      <div className="space-y-3 lg:space-y-4">
        {blocks.sections.map((section, idx) => (
          <SectionDisplay
            key={idx}
            section={section}
            index={idx}
            isStarting={isStarting}
            onExerciseClick={onExerciseClick}
          />
        ))}
      </div>

      {blocks.estimated_calories && (
        <div className="text-sm text-slate-500 text-center pt-4 border-t border-slate-700/50">
          Estimation : {blocks.estimated_calories} calories
        </div>
      )}
    </div>
  )
}

