export const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  scheduled: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/20' },
  completed: { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/20' },
  skipped: { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/20' },
  rescheduled: { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/20' },
}

// Badge coloré par module (affiché uniquement pour les modules non-CrossFit)
export const moduleBadges: Record<string, { label: string; color: string }> = {
  hyrox: { label: 'HYROX', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  running: { label: 'RUN', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
  athx: { label: 'ATHX', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  strength: { label: 'FORCE', color: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
}

export function CustomEventContent({ calendarEvent }: { calendarEvent: Record<string, unknown> }) {
  const status = (calendarEvent.status as string) || 'scheduled'
  const module = (calendarEvent.module as string) || 'crossfit'
  const colors = statusColors[status] || statusColors.scheduled
  const badge = moduleBadges[module]

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-0.5 w-full overflow-hidden">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
      {badge && (
        <span className={`text-[9px] font-bold px-1 rounded flex-shrink-0 ${badge.color}`}>
          {badge.label}
        </span>
      )}
      <span className={`text-xs font-medium truncate ${colors.text}`}>
        {calendarEvent.title as string}
      </span>
      {!!calendarEvent.workout_type && !badge && (
        <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
          {(calendarEvent.workout_type as string).replace(/_/g, ' ')}
        </span>
      )}
    </div>
  )
}
