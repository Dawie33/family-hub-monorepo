import { WorkoutSection } from '@/domain/entities/workout-structure'
import { ExerciseDisplay } from './ExerciseDisplay'
import { ExerciseSlider } from './ExerciseSlider'
import { AMRAPTimer } from '@/app/(app)/timer/timers/AMRAPTimer'
import { EMOMTimer } from '@/app/(app)/timer/timers/EMOMTimer'
import { ForTimeTimer } from '@/app/(app)/timer/timers/ForTimeTimer'
import { StrengthRestTimer } from '@/app/(app)/timer/timers/StrengthRestTimer'
import { TabataTimer } from '@/app/(app)/timer/timers/TabataTimer'
import { Check, X } from 'lucide-react'

interface SectionActiveModeProps {
  section: WorkoutSection
  onClose: () => void
  onAllExercisesCompleted: () => void
  onExerciseClick?: (exerciseId: string) => void
}

export function SectionActiveMode({
  section,
  onClose,
  onAllExercisesCompleted,
  onExerciseClick,
}: SectionActiveModeProps) {
  const isAMRAP = section.type === 'amrap' || section.format?.toLowerCase().includes('amrap')
  const isStrengthWithRest = !isAMRAP && !!section.rounds && section.rounds > 1 && !!section.rest_between_rounds

  const renderTimer = () => {
    if ((section.type === 'amrap' || section.format?.toLowerCase().includes('amrap')) && section.duration_min) {
      return <AMRAPTimer duration={section.duration_min} />
    }
    if (section.type === 'for_time' || section.format?.toLowerCase().includes('for time')) {
      return <ForTimeTimer capMin={section.duration_min} />
    }
    if (
      section.type === 'emom' ||
      section.format?.toLowerCase().includes('emom') ||
      /e\d+mom/.test(section.format?.toLowerCase() || '')
    ) {
      const formatLower = section.format?.toLowerCase() || ''
      const intervalMatch = formatLower.match(/e(\d+)mom/)
      const intervalMin = intervalMatch ? parseInt(intervalMatch[1]) : 1
      const durationMin = section.rounds ? section.rounds * intervalMin : section.duration_min
      if (!durationMin) return null
      return <EMOMTimer durationMin={durationMin} intervalMin={intervalMin} />
    }
    if (section.type === 'tabata' || section.format?.toLowerCase().includes('tabata')) {
      return <TabataTimer rounds={section.rounds} workSeconds={20} restSeconds={10} />
    }
    if (section.rounds && section.rounds > 1 && section.rest_between_rounds) {
      return <StrengthRestTimer rounds={section.rounds} restSeconds={section.rest_between_rounds} />
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-auto">
      <div className="min-h-screen p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{section.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {section.description && <p className="text-sm text-slate-400 mb-4">{section.description}</p>}

        {isAMRAP || isStrengthWithRest ? <div className="mb-4">{renderTimer()}</div> : renderTimer()}

        <div className="mt-4">
          {isAMRAP || isStrengthWithRest ? (
            <>
              <div className="space-y-3">
                {(section.exercises ?? []).map((exercise, idx) => (
                  <ExerciseDisplay
                    key={idx}
                    exercise={exercise}
                    isStarting={false}
                    isCompleted={false}
                    onExerciseClick={onExerciseClick}
                  />
                ))}
              </div>
              {isAMRAP && (
                <button
                  onClick={onAllExercisesCompleted}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold text-base shadow-lg shadow-green-500/30"
                >
                  <Check className="w-5 h-5" />
                  <span>Terminer la section</span>
                </button>
              )}
            </>
          ) : (
            <ExerciseSlider
              exercises={section.exercises ?? []}
              rounds={section.rounds}
              onExerciseClick={onExerciseClick}
              onAllExercisesCompleted={onAllExercisesCompleted}
            />
          )}
        </div>
      </div>
    </div>
  )
}
