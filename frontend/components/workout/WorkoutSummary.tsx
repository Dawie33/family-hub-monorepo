'use client'

import { BenchmarkResultForm } from '@/components/workout/BenchmarkResultForm'
import { sessionService } from '@/services'
import { Workouts } from '@/domain/entities/workout'
import { Check, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface WorkoutSummaryProps {
  workout: Workouts
  sessionId: string
  elapsedTime: number
  blockProgress: Record<string, boolean>
}

interface TrainingMetrics {
  avg_heart_rate?: number
  max_heart_rate?: number
  calories?: number
  distance_km?: number
  perceived_effort?: number // 1-10
}

export function WorkoutSummary({
  workout,
  sessionId,
  elapsedTime,
  blockProgress,
}: WorkoutSummaryProps) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [metrics, setMetrics] = useState<TrainingMetrics>({})
  const [isSaving, setIsSaving] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`
    }
    return `${minutes}min ${secs}s`
  }

  /**
   * Sauvegarde la session de workout en cours avec les informations 
   * de durée, de notes, de progression des blocs, de notation, de 
   * métriques de l'entraînement.
   *  
   * @throws {Error} - Erreur si la sauvegarde échoue.
   */
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await sessionService.updateSession(sessionId, {
        completed_at: new Date().toISOString(),
        notes,
        results: {
          elapsed_time_seconds: elapsedTime,
          block_progress: blockProgress,
          rating,
          metrics,
        },
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving workout summary:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const completedExercises = Object.values(blockProgress).filter(Boolean).length

  // Calculer le nombre total d'exercices dans le workout
  const totalExercises = workout.blocks.sections?.reduce((total, section) => {
    return total + (section.exercises?.length || 0)
  }, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Workout terminé !</h1>
          <p className="text-muted-foreground text-lg">
            Félicitations pour avoir terminé ce workout
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Durée</p>
            <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Exercices</p>
            <p className="text-2xl font-bold">
              {completedExercises}/{totalExercises}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Date</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Comment était ce workout ?</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                    }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              {rating === 1 && 'Très difficile'}
              {rating === 2 && 'Difficile'}
              {rating === 3 && 'Correct'}
              {rating === 4 && 'Bien'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Benchmark Result Form - Only for benchmark workouts */}
        {workout.is_benchmark && (
          <BenchmarkResultForm workout={workout} />
        )}

        {/* Training Metrics */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Données d'entraînement</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate Average */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fréquence cardiaque moyenne (bpm)
              </label>
              <input
                type="number"
                value={metrics.avg_heart_rate || ''}
                onChange={(e) =>
                  setMetrics({ ...metrics, avg_heart_rate: parseInt(e.target.value) || undefined })
                }
                placeholder="145"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Heart Rate Max */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fréquence cardiaque max (bpm)
              </label>
              <input
                type="number"
                value={metrics.max_heart_rate || ''}
                onChange={(e) =>
                  setMetrics({ ...metrics, max_heart_rate: parseInt(e.target.value) || undefined })
                }
                placeholder="180"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Calories */}
            <div>
              <label className="block text-sm font-medium mb-2">Calories brûlées (kcal)</label>
              <input
                type="number"
                value={metrics.calories || ''}
                onChange={(e) =>
                  setMetrics({ ...metrics, calories: parseInt(e.target.value) || undefined })
                }
                placeholder="450"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={metrics.distance_km || ''}
                onChange={(e) =>
                  setMetrics({ ...metrics, distance_km: parseFloat(e.target.value) || undefined })
                }
                placeholder="5.2"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Perceived Effort */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Effort perçu (RPE 1-10)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  onClick={() => setMetrics({ ...metrics, perceived_effort: level })}
                  className={`flex-1 py-2 rounded border transition-colors ${metrics.perceived_effort === level
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              1 = Très facile • 10 = Effort maximal
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Notes</h3>
          <textarea
            className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            placeholder="Comment t'es-tu senti ? Qu'as-tu appris ? Modifications apportées..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-6 py-4 border border-border rounded-lg font-semibold hover:bg-accent transition-colors cursor-pointer"
          >
            Ignorer
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary text-primary-foreground px-6 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
