interface IntervalsWork {
  distance?: string
  duration?: string
  pace?: string
  effort?: string
}

interface IntervalsRest {
  duration?: string
  type?: 'active' | 'passive'
}

interface Intervals {
  work: IntervalsWork
  rest: IntervalsRest
}

interface SectionIntervalsProps {
  intervals?: Intervals
  rounds?: number
}

export function SectionIntervals({ intervals, rounds }: SectionIntervalsProps) {
  if (!intervals) return null

  return (
    <div className="bg-slate-900/50 rounded-xl p-3 space-y-2 border border-slate-700/50">
      <div className="text-sm text-slate-300">
        <span className="font-medium">Travail:</span>
        {intervals.work.distance && ` ${intervals.work.distance}`}
        {intervals.work.duration && ` ${intervals.work.duration}`}
        {intervals.work.pace && ` @ ${intervals.work.pace}`}
        {intervals.work.effort && ` (${intervals.work.effort})`}
      </div>
      <div className="text-sm text-slate-400">
        <span className="font-medium">Repos:</span> {intervals.rest.duration}
        {intervals.rest.type && ` (${intervals.rest.type})`}
      </div>
      {rounds && <div className="text-sm font-medium text-orange-400">x {rounds} répétitions</div>}
    </div>
  )
}
