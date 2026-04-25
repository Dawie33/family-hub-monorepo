'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PostWodAnalysisModal } from '@/components/workout/PostWodAnalysisModal'
import { sessionService, type WodAnalysis } from '@/services/sessions'
import { scheduleApi } from '@/services/schedule'
import { toast } from 'sonner'
import { StarRating } from '@/components/ui/star-rating'
import { Trophy } from 'lucide-react'
import { LocationToggle } from './LogWorkoutModal/LocationToggle'
import { ScoreTypeTabs } from './LogWorkoutModal/ScoreTypeTabs'
import { ForTimeScoreInput } from './LogWorkoutModal/ForTimeScoreInput'
import { AMRAPScoreInput } from './LogWorkoutModal/AMRAPScoreInput'
import { RxToggle } from './LogWorkoutModal/RxToggle'

interface LogWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  workoutId?: string
  workoutName: string
  workoutType?: string
  defaultLocation?: 'box' | 'maison'
  onLogged: () => void
}

type ScoreType = 'for_time' | 'amrap' | 'libre'
type Location = 'box' | 'maison'

function detectScoreType(workoutType?: string): ScoreType {
  if (!workoutType) return 'for_time'
  if (workoutType === 'for_time') return 'for_time'
  if (workoutType === 'amrap') return 'amrap'
  if (workoutType === 'emom' || workoutType === 'strength') return 'libre'
  return 'for_time'
}

export function LogWorkoutModal({
  open,
  onOpenChange,
  scheduleId,
  workoutId,
  workoutName,
  workoutType,
  defaultLocation = 'maison',
  onLogged,
}: LogWorkoutModalProps) {
  const [saving, setSaving] = useState(false)
  const [scoreType, setScoreType] = useState<ScoreType>(() => detectScoreType(workoutType))
  const [location, setLocation] = useState<Location>(defaultLocation)
  const [mins, setMins] = useState('')
  const [secs, setSecs] = useState('')
  const [capAtteint, setCapAtteint] = useState(false)
  const [capScore, setCapScore] = useState('')
  const [capDescription, setCapDescription] = useState('')
  const [rounds, setRounds] = useState('')
  const [bonusReps, setBonusReps] = useState('')
  const [isRx, setIsRx] = useState(true)
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)

  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysis, setAnalysis] = useState<WodAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setScoreType(detectScoreType(workoutType))
      setLocation(defaultLocation)
      setMins('')
      setSecs('')
      setCapAtteint(false)
      setCapScore('')
      setCapDescription('')
      setRounds('')
      setBonusReps('')
      setIsRx(true)
      setNotes('')
      setRating(0)
      setAnalysis(null)
    }
  }, [open, workoutType, defaultLocation])

  const handleSave = async () => {
    setSaving(true)
    try {
      const session = await sessionService.startSession({
        workout_id: workoutId,
        started_at: new Date().toISOString(),
      })

      const results: Record<string, unknown> = { rx: isRx, location }
      if (scoreType === 'for_time') {
        if (capAtteint) {
          results.cap_reached = true
          if (capScore) results.reps_at_cap = parseInt(capScore, 10)
          if (capDescription) results.cap_description = capDescription
        } else {
          const totalSecs = parseInt(mins || '0', 10) * 60 + parseInt(secs || '0', 10)
          if (totalSecs > 0) results.elapsed_time_seconds = totalSecs
        }
      } else if (scoreType === 'amrap') {
        if (rounds) results.rounds = parseInt(rounds, 10)
        if (bonusReps) results.reps = parseInt(bonusReps, 10)
      }
      if (rating > 0) results.rating = rating

      await sessionService.updateSession(session.id, {
        completed_at: new Date().toISOString(),
        notes: notes || undefined,
        results,
      })

      await scheduleApi.markAsCompleted(scheduleId, session.id)

      toast.success('WOD enregistré !')
      onLogged()
      onOpenChange(false)
      if (workoutId) handleAnalyze(session.id)
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyze = async (sessionId: string) => {
    setAnalysisOpen(true)
    setAnalysisLoading(true)
    setAnalysis(null)
    try {
      const result = await sessionService.analyzeSession(sessionId)
      setAnalysis(result)
    } catch {
      toast.error("Impossible de générer l'analyse")
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-orange-400" />
              Logger le WOD
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1 truncate">{workoutName}</p>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <LocationToggle location={location} onLocationChange={setLocation} />
            <ScoreTypeTabs scoreType={scoreType} onScoreTypeChange={setScoreType} />

            {scoreType === 'for_time' && (
              <ForTimeScoreInput
                mins={mins}
                secs={secs}
                capAtteint={capAtteint}
                capScore={capScore}
                capDescription={capDescription}
                onMinsChange={setMins}
                onSecsChange={setSecs}
                onCapAtteintChange={setCapAtteint}
                onCapScoreChange={setCapScore}
                onCapDescriptionChange={setCapDescription}
              />
            )}

            {scoreType === 'amrap' && (
              <AMRAPScoreInput
                rounds={rounds}
                bonusReps={bonusReps}
                onRoundsChange={setRounds}
                onBonusRepsChange={setBonusReps}
              />
            )}

            <RxToggle isRx={isRx} onIsRxChange={setIsRx} />

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Note (optionnel)</label>
              <StarRating rating={rating} onChange={setRating} />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ressenti, substitutions, PR..."
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PostWodAnalysisModal
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        analysis={analysis}
        loading={analysisLoading}
        workoutName={workoutName}
      />
    </>
  )
}
