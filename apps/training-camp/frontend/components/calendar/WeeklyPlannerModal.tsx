'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { activitiesApi } from '@/services/activities'
import { scheduleApi } from '@/services/schedule'
import { workoutsService } from '@/services/workouts'
import { addDays, addWeeks, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Loader2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DayConfig, DayConfigGrid, SportType, TechFocus } from './DayConfigGrid'
import { PlanResultList } from './PlanResultList'
import { PlanSummary } from './PlanSummary'
import { WeekNavigation } from './WeekNavigation'

interface WeeklyPlannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  weekStart: Date
  onPlanned: () => void
}

type Phase = 'config' | 'loading' | 'result'

interface PlanResult {
  workouts: { date: string; workout_name: string; schedule_id: string }[]
  boxDays: string[]
  skipped: string[]
  activities: { date: string; type: string }[]
}

function defaultDayConfig(date: string): DayConfig {
  return { date, isBox: false, isRest: false, sports: [], crossfitFocus: '' }
}

export function WeeklyPlannerModal({ open, onOpenChange, weekStart, onPlanned }: WeeklyPlannerModalProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const currentWeekStart = addWeeks(weekStart, weekOffset)
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(() =>
    days.map(d => defaultDayConfig(format(d, 'yyyy-MM-dd')))
  )
  const [phase, setPhase] = useState<Phase>('config')
  const [result, setResult] = useState<PlanResult | null>(null)
  const [suggestionWeeks, setSuggestionWeeks] = useState(0)

  useEffect(() => {
    if (!open) return
    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd')
    setSuggestionWeeks(0)
    setDayConfigs(days.map(d => defaultDayConfig(format(d, 'yyyy-MM-dd'))))

    scheduleApi
      .getWeekSuggestion(weekStartStr)
      .then(suggestion => {
        if (suggestion && suggestion.weeks_analyzed > 0) {
          setSuggestionWeeks(suggestion.weeks_analyzed)
          setDayConfigs(
            days.map(d => {
              const date = format(d, 'yyyy-MM-dd')
              const suggested = suggestion.days.find((s: { date: string; type: string }) => s.date === date)
              const raw = suggested?.type ?? 'repos'
              const isBox = raw === 'box'
              const isRest = raw === 'repos' || raw === 'rest'
              const sports: SportType[] = (!isBox && !isRest && raw === 'maison') ? ['crossfit'] : []
              return { date, isBox, isRest, sports, crossfitFocus: '' as TechFocus }
            })
          )
        }
      })
      .catch(() => {})
  }, [open, weekOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateDay = (idx: number, patch: Partial<DayConfig>) =>
    setDayConfigs(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c))

  const handleToggleBox = (idx: number) =>
    updateDay(idx, { isBox: !dayConfigs[idx].isBox, isRest: false, sports: [] })

  const handleToggleRest = (idx: number) =>
    updateDay(idx, { isRest: !dayConfigs[idx].isRest, isBox: false, sports: [] })

  const handleToggleSport = (idx: number, sport: SportType) => {
    const current = dayConfigs[idx].sports
    const sports = current.includes(sport)
      ? current.filter(s => s !== sport)
      : [...current, sport]
    updateDay(idx, { sports })
  }

  const handleCrossfitFocusChange = (idx: number, focus: TechFocus) =>
    updateDay(idx, { crossfitFocus: focus })

  const boxDays = dayConfigs.filter(d => d.isBox)
  const activeSportDays = dayConfigs.filter(d => !d.isBox && !d.isRest && d.sports.length > 0)
  const totalActiveDays = boxDays.length + activeSportDays.length

  const handleGenerate = async () => {
    if (totalActiveDays === 0) {
      toast.error('Sélectionne au moins un jour d\'entraînement')
      return
    }

    setPhase('loading')
    try {
      // CrossFit (maison AI + box)
      const crossfitHomeDays = activeSportDays.filter(d => d.sports.includes('crossfit'))
      let crossfitResult = {
        scheduled: [] as { date: string; workout_name: string; schedule_id: string }[],
        box_days: [] as string[],
        skipped: [] as string[],
      }

      const crossfitPayload = [
        ...crossfitHomeDays.map(d => ({
          date: d.date,
          type: 'perso' as const,
          focus: d.crossfitFocus || undefined,
        })),
        ...boxDays.map(d => ({ date: d.date, type: 'box' as const })),
      ]

      if (crossfitPayload.length > 0) {
        crossfitResult = await workoutsService.generateWeeklyPlan(crossfitPayload)
      }

      // Autres sports via activitiesApi
      const sportActivities: { date: string; type: string }[] = []
      const sportRequests: Promise<unknown>[] = []

      for (const day of activeSportDays) {
        for (const sport of day.sports) {
          if (sport === 'crossfit') continue
          sportRequests.push(
            activitiesApi.create({ activity_type: sport, scheduled_date: day.date })
          )
          const labels: Record<string, string> = { running: 'Running', hyrox: 'HYROX', athx: 'ATHX' }
          sportActivities.push({ date: day.date, type: labels[sport] })
        }
      }

      if (sportRequests.length > 0) {
        await Promise.all(sportRequests)
      }

      setResult({
        workouts: crossfitResult.scheduled,
        boxDays: crossfitResult.box_days,
        skipped: crossfitResult.skipped,
        activities: sportActivities,
      })
      setPhase('result')
      if (totalActiveDays > 0) onPlanned()
    } catch {
      toast.error('Erreur lors de la génération. Veuillez réessayer.')
      setPhase('config')
    }
  }

  const handleClose = () => {
    setPhase('config')
    setResult(null)
    setSuggestionWeeks(0)
    setWeekOffset(0)
    setDayConfigs(days.map(d => defaultDayConfig(format(d, 'yyyy-MM-dd'))))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-orange-400" />
            <WeekNavigation
              currentWeekStart={currentWeekStart}
              weekOffset={weekOffset}
              onWeekOffsetChange={setWeekOffset}
            />
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Box / Repos = jours bloqués · Sinon, sélectionne un ou plusieurs sports par jour
          </DialogDescription>
        </DialogHeader>

        {phase === 'config' && (
          <div className="flex flex-col gap-4 flex-1 overflow-auto">
            {suggestionWeeks > 0 && (
              <div className="text-xs text-slate-400 px-1">
                💡 Pré-rempli d&apos;après tes {suggestionWeeks} dernière{suggestionWeeks > 1 ? 's' : ''} semaine
                {suggestionWeeks > 1 ? 's' : ''} — modifie si besoin.
              </div>
            )}

            <DayConfigGrid
              days={days}
              dayConfigs={dayConfigs}
              onToggleBox={handleToggleBox}
              onToggleRest={handleToggleRest}
              onToggleSport={handleToggleSport}
              onCrossfitFocusChange={handleCrossfitFocusChange}
            />

            <PlanSummary dayConfigs={dayConfigs} />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white">
                Annuler
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={totalActiveDays === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Générer le plan
              </Button>
            </div>
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16">
            <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
            <div className="text-center">
              <p className="text-white font-medium">Génération en cours...</p>
              <p className="text-slate-400 text-sm mt-1">
                {activeSportDays.filter(d => d.sports.includes('crossfit')).length > 1
                  ? `${activeSportDays.filter(d => d.sports.includes('crossfit')).length} workouts CrossFit IA en parallèle — 30-60s`
                  : 'Quelques secondes...'}
              </p>
            </div>
          </div>
        )}

        {phase === 'result' && result && <PlanResultList result={result} onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  )
}
