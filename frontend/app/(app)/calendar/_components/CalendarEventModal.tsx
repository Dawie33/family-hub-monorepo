import { Button } from '@/components/ui/button'
import { Check, ExternalLink, FileDown, SkipForward, Trash2, Trophy } from 'lucide-react'
import { statusColors } from './CalendarEventContent'

export function CustomEventModal({ calendarEvent }: { calendarEvent: Record<string, unknown> }) {
  const status = (calendarEvent.status as string) || 'scheduled'
  const colors = statusColors[status] || statusColors.scheduled
  const onComplete = calendarEvent._onComplete as (() => void) | undefined
  const onSkip = calendarEvent._onSkip as (() => void) | undefined
  const onDelete = calendarEvent._onDelete as (() => void) | undefined
  const onLog = calendarEvent._onLog as (() => void) | undefined
  const onPrint = calendarEvent._onPrint as (() => void) | undefined

  return (
    <div className="p-4 min-w-[280px]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${colors.dot}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-100 truncate">
            {calendarEvent.title as string}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${colors.bg} ${colors.text}`}>
              {status === 'scheduled' ? 'Programmé' : status === 'completed' ? 'Complété' : status === 'skipped' ? 'Sauté' : 'Replanifié'}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {!!calendarEvent.workout_type && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Type:</span>
            <span className="text-slate-300 capitalize">{(calendarEvent.workout_type as string).replace(/_/g, ' ')}</span>
          </div>
        )}
        {!!calendarEvent.difficulty && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Difficulté:</span>
            <span className="text-slate-300 capitalize">{calendarEvent.difficulty as string}</span>
          </div>
        )}
        {!!calendarEvent.duration && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Durée:</span>
            <span className="text-slate-300">{calendarEvent.duration as number} min</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
        {status === 'scheduled' && (
          <>
            {onLog && (
              <Button
                size="sm"
                onClick={onLog}
                className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
              >
                <Trophy className="w-3.5 h-3.5 mr-1" />
                Logger le WOD
              </Button>
            )}
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Terminer sans résultat
            </Button>
            <Button
              size="sm"
              onClick={onSkip}
              className="bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1" />
              Sauté
            </Button>
          </>
        )}
        {!!(calendarEvent.workout_id || calendarEvent.personalized_workout_id) && (
          <Button
            size="sm"
            asChild
            className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
          >
            <a href={calendarEvent.workout_id ? `/workout/${calendarEvent.workout_id as string}` : `/personalized-workout/${calendarEvent.personalized_workout_id as string}`}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Voir
            </a>
          </Button>
        )}
        {!!calendarEvent.workout_id && onPrint && (
          <Button
            size="sm"
            onClick={onPrint}
            className="bg-slate-500/20 text-slate-300 border border-slate-500/30 hover:bg-slate-500/30"
          >
            <FileDown className="w-3.5 h-3.5 mr-1" />
            PDF
          </Button>
        )}
        <Button
          size="sm"
          onClick={onDelete}
          className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
