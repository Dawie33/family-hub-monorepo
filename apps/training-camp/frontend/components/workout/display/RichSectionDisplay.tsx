import { Exercise, WorkoutSection } from '@/domain/entities/workout-structure';

const FORMAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  amrap: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  emom: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  'for time': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  'for_time': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  tabata: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  warmup: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' },
  cooldown: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' },
  strength: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  skill_work: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
}

function getSectionColors(section: WorkoutSection) {
  const formatLower = section.format?.toLowerCase() || ''
  const sectionType = section.type

  // E2MOM, E3MOM, etc. → EMOM colors
  if (/e\d+mom/.test(formatLower)) return FORMAT_COLORS['emom']

  for (const key of Object.keys(FORMAT_COLORS)) {
    if (formatLower.includes(key)) return FORMAT_COLORS[key]
  }
  if (FORMAT_COLORS[sectionType]) return FORMAT_COLORS[sectionType]

  return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-600' }
}

function getFormatLabel(section: WorkoutSection): string | null {
  if (section.format) return section.format
  const typeFormats: Record<string, string> = {
    amrap: 'AMRAP',
    emom: 'EMOM',
    for_time: 'For Time',
    tabata: 'Tabata',
  }
  return typeFormats[section.type] || null
}

function RichExerciseDisplay({ exercise, idx, colors }: { exercise: Exercise; idx: number; colors: ReturnType<typeof getSectionColors> }) {
  return (
    <div className="flex items-start justify-between p-3 bg-slate-900/50 rounded-lg lg:rounded-xl hover:bg-slate-900/70 transition-colors">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
        <div className={`w-6 h-8 lg:w-10 lg:h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} font-bold text-sm lg:text-base flex-shrink-0 mt-0.5`}>
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white">{exercise.name}</div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {exercise.duration && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-whrite text-xs text-slate-300">{exercise.duration}</span>
            )}
            {exercise.distance && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">{exercise.distance}</span>
            )}
            {exercise.per_side && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">par côté</span>
            )}
            {exercise.tempo && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">Tempo: {exercise.tempo}</span>
            )}
          </div>

          {exercise.weight && (
            <div className="text-xs lg:text-sm text-slate-400 mt-0.5">{exercise.weight}</div>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {exercise.intensity && (
              <span className="text-xs text-slate-500">Intensité: {exercise.intensity}</span>
            )}
            {exercise.pace && (
              <span className="text-xs text-slate-500">Pace: {exercise.pace}</span>
            )}
            {exercise.effort && (
              <span className="text-xs text-slate-500">Effort: {exercise.effort}</span>
            )}
          </div>

          {exercise.details && (
            <div className="text-xs text-slate-500 mt-1">{exercise.details}</div>
          )}
        </div>
      </div>
      {exercise.reps && (
        <div className='text-white'>
          {exercise.reps} reps
        </div>
      )}
    </div>
  )
}

export function RichSectionDisplay({ section }: { section: WorkoutSection }) {
  const colors = getSectionColors(section)
  const formatLabel = getFormatLabel(section)
  console.log('section', colors)
  return (
    <div className="space-y-4">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden">
        <div className="bg-slate-800/50 p-4 lg:p-6 border border-slate-700/50 border-l-0 rounded-r-xl lg:rounded-r-2xl">
          {/* Section Header */}
          <div className="flex items-center gap-2 lg:gap-3 mb-3">
            <h3 className="text-lg lg:text-xl font-semibold text-white">
              {section.title || section.format || section.type}
            </h3>
            {formatLabel && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                {formatLabel}
              </span>
            )}
            {section.duration_min && (
              <span className="text-slate-400 text-sm">{section.duration_min} min</span>
            )}
          </div>

          {/* Section metadata */}
          <div className="flex flex-wrap gap-2 mb-3">
            {section.rounds && section.rounds > 1 && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                {section.rounds} rounds
              </span>
            )}
            {section.rest_between_rounds && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                Rest: {section.rest_between_rounds}s entre rounds
              </span>
            )}
            {section.focus && (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                Focus: {section.focus}
              </span>
            )}
          </div>

          {section.goal && (
            <p className="text-sm text-slate-400 mb-3">{section.goal}</p>
          )}
          {section.description && (
            <p className="text-sm text-slate-400 italic mb-3">{section.description}</p>
          )}

          {/* Exercises */}
          {section.exercises && section.exercises.length > 0 && (
            <div className="space-y-3 lg:space-y-4">
              {section.exercises.map((exercise, idx) => (
                <RichExerciseDisplay key={idx} exercise={exercise} idx={idx} colors={colors} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nested sections */}
      {section.sections?.map((sub, idx) => (
        <div key={idx} className="ml-0 mt-4">
          <RichSectionDisplay section={sub} />
        </div>
      ))}
    </div>
  )
}
