import { WorkoutSection } from '@/domain/entities/workout-structure'

function formatExerciseLine(ex: {
  name: string
  sets?: number
  reps?: number | string
  weight?: string
  duration?: string
  distance?: string
  details?: string
}): string {
  const parts: string[] = []
  if (ex.sets && ex.sets > 1) parts.push(`${ex.sets}×`)
  if (ex.reps) parts.push(`${ex.reps}`)
  parts.push(ex.name)
  if (ex.weight) parts.push(`@ ${ex.weight}`)
  if (ex.duration) parts.push(`(${ex.duration})`)
  if (ex.distance) parts.push(ex.distance)
  if (ex.details) parts.push(`— ${ex.details}`)
  return parts.join(' ')
}

function sectionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    warmup: 'Échauffement',
    skill_work: 'Technique',
    strength: 'Force',
    accessory: 'Accessoire',
    cardio: 'Cardio',
    metcon: 'MetCon',
    amrap: 'AMRAP',
    emom: 'EMOM',
    for_time: 'For Time',
    circuit: 'Circuit',
    finisher: 'Finisher',
    core: 'Core',
    mobility: 'Mobilité',
    cooldown: 'Retour au calme',
    tabata: 'Tabata',
    intervals: 'Intervalles',
  }
  return labels[type] || type
}

export function PrintSection({ section }: { section: WorkoutSection }) {
  const typeLabel = sectionTypeLabel(section.type)
  const formatLine = [
    section.format,
    section.duration_min ? `${section.duration_min} min` : null,
    section.rounds ? `${section.rounds} rounds` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="print-section">
      <div className="print-section-header">
        <span className="print-section-type">{typeLabel}</span>
        <span className="print-section-title">{section.title}</span>
        {formatLine && <span className="print-section-format">{formatLine}</span>}
      </div>
      {section.description && <p className="print-section-desc">{section.description}</p>}
      {section.exercises && section.exercises.length > 0 && (
        <ul className="print-exercise-list">
          {section.exercises.map((ex, i) => (
            <li key={i} className="print-exercise-item">
              <span className="print-bullet">—</span>
              <span>{formatExerciseLine(ex)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
