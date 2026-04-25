'use client'

import { StarRating } from '@/components/ui/star-rating'
import { WorkoutSession } from '@/domain/entities/workout'
import { sessionService } from '@/services'
import { useState } from 'react'

interface WorkoutResultsModalProps {
  isOpen: boolean
  onClose: () => void
  workoutId: string
  workoutName: string
  timeElapsed: string
  rounds?: number
  version: 'RX' | 'SCALED'
}

export function WorkoutResultsModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  timeElapsed,
  rounds,
  version
}: WorkoutResultsModalProps) {
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Créer la session
      const session = await sessionService.startSession({
        workout_id: workoutId,
        started_at: new Date(Date.now() - parseTimeToMs(timeElapsed)).toISOString()
      })

      // Mettre à jour avec les résultats
      await sessionService.updateSession(session.id, {
        completed_at: new Date().toISOString(),
        notes: notes || undefined,
        results: {
          elapsed_time_seconds: Math.floor(parseTimeToMs(timeElapsed) / 1000),
          rounds,
          version,
          rating: rating || undefined
        }
      })

      onClose()
    } catch (error) {
      console.error('Error saving workout results:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Convertir le temps formaté en millisecondes
  const parseTimeToMs = (time: string): number => {
    const parts = time.split(':')
    if (parts.length === 2) {
      const [mins, secs] = parts.map(Number)
      return (mins * 60 + secs) * 1000
    }
    return 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">WOD Terminé !</h2>
              <p className="text-green-50 mt-1">{workoutName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <span className="text-xl font-bold">&times;</span>
            </button>
          </div>

          {/* Résultats */}
          <div className="mt-6 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono">{timeElapsed}</span>
              <span className="text-green-50">({version})</span>
            </div>
            {rounds !== undefined && (
              <p className="text-green-50">
                {rounds} round{rounds !== 1 ? 's' : ''} complété{rounds !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Comment vous êtes-vous senti ?
            </label>
            <StarRating rating={rating ?? 0} onChange={setRating} allowDeselect={false} />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comment s'est passé votre WOD ? Ajoutez vos notes ici..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
