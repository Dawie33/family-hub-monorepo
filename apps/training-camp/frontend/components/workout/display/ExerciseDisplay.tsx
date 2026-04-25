import { Exercise } from '@/domain/entities/workout-structure'

interface ExerciseDisplayProps {
    exercise: Exercise
    isStarting: boolean
    isCompleted: boolean
    onToggle?: () => void
    onExerciseClick?: (exerciseId: string) => void
    rounds?: number // Nombre de rounds de la section parente
}
/**
* Affiche un exercice unique avec ses détails.
*
* @param {ExerciseDisplayProps} props - L'exercice à afficher.
* @returns {JSX.Element} - L'affichage de l'exercice rendu.
 */
export function ExerciseDisplay({ exercise, isCompleted, onToggle, onExerciseClick }: ExerciseDisplayProps) {
    const handleExerciseNameClick = (e: React.MouseEvent) => {
        if (exercise.name && onExerciseClick) {
            e.stopPropagation()
            onExerciseClick(exercise.name)

        }
    }
    return (
        <div
            onClick={onToggle}
            className={`text-sm p-3 lg:p-4 rounded-lg lg:rounded-xl border transition-all ${onToggle ? 'cursor-pointer hover:border-orange-500/30' : ''} ${isCompleted
                ? 'bg-orange-500/10 border-orange-500/30 line-through opacity-60'
                : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={`font-semibold text-white ${exercise.name && onExerciseClick ? 'cursor-pointer hover:text-orange-400 transition-colors' : ''}`}
                            onClick={handleExerciseNameClick}
                        >
                            {exercise.name}
                        </span>
                    </div>
                    <div className="text-slate-400 flex flex-wrap gap-2 mt-1 text-xs lg:text-sm">
                        {exercise.reps && <span>• {exercise.reps} répétition{typeof exercise.reps === 'number' && exercise.reps > 1 ? 's' : ''}</span>}
                        {exercise.duration && <span>• {exercise.duration}</span>}
                        {exercise.work_duration && <span>• {exercise.work_duration} travail</span>}
                        {exercise.rest_duration && <span>• {exercise.rest_duration} repos</span>}
                        {exercise.distance && <span>• {exercise.distance}</span>}
                        {exercise.weight && <span className="text-orange-400">• {exercise.weight}</span>}
                        {exercise.intensity && <span>• Intensité: {exercise.intensity}</span>}
                        {exercise.pace && <span>• Allure: {exercise.pace}</span>}
                        {exercise.effort && <span>• Effort: {exercise.effort}</span>}
                        {exercise.tempo && <span>• Tempo: {exercise.tempo}</span>}
                        {exercise.cadence && <span>• Cadence: {exercise.cadence}</span>}
                        {exercise.per_side && <span>• par côté</span>}
                    </div>
                    {exercise.details && (
                        <div className="text-xs text-slate-500 italic mt-1">{exercise.details}</div>
                    )}
                </div>
            </div>
        </div>
    )
}