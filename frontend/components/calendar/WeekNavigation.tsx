'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WeekNavigationProps {
  currentWeekStart: Date
  weekOffset: number
  onWeekOffsetChange: (offset: number) => void
}

export function WeekNavigation({ currentWeekStart, weekOffset, onWeekOffsetChange }: WeekNavigationProps) {
  const weekLabel = `semaine du ${format(currentWeekStart, 'dd MMMM', { locale: fr })}`

  return (
    <div className="flex items-center gap-2">
      <span>Planifier la {weekLabel}</span>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => onWeekOffsetChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onWeekOffsetChange(weekOffset + 1)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
