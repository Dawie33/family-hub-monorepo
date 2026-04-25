'use client'

import { Exercise as ExerciseEntity } from '@/domain/entities/exercise'
import { Exercise as WorkoutExercise } from '@/domain/entities/workout-structure'
import { getExerciseByName } from '@/services/exercises'
import { AlertCircle, Loader2, Play, Flame, Timer, Coffee, ArrowLeftRight, Info, FileText, Dumbbell, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DetailedExerciseDisplayProps {
  exercise: WorkoutExercise
  rounds?: number
  isCompleted: boolean
  onToggle?: () => void
}

/**
 * Composant qui affiche un exercice avec toutes ses informations détaillées
 * Style minimaliste et compact - focus sur l'essentiel
 */
export function DetailedExerciseDisplay({
  exercise,
}: DetailedExerciseDisplayProps) {
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)

  // Convertir une URL YouTube en URL embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[7].length === 11) ? match[7] : null
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  useEffect(() => {
    const loadExerciseDetails = async () => {
      if (!exercise.name) return

      try {
        setLoading(true)
        setError(null)
        const details = await getExerciseByName(exercise.name)
        setExerciseDetails(details)
      } catch (err) {
        console.error('Erreur lors du chargement de l\'exercice:', err)
        setError('Impossible de charger les détails')
      } finally {
        setLoading(false)
      }
    }

    loadExerciseDetails()
  }, [exercise.name])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Titre centré */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{exercise.name}</h2>
        {exerciseDetails?.category && (
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {exerciseDetails.category.replace('_', ' ')}
          </p>
        )}
      </div>

      {/* Infos clés - Taille compacte */}
      {(() => {
        const keyInfos = [
          exercise.reps && { label: 'RÉPÉTITIONS', value: exercise.reps },
          exercise.duration && { label: 'MINUTES', value: exercise.duration },
          exercise.weight && { label: 'POIDS', value: exercise.weight },
          exercise.distance && { label: 'DISTANCE', value: exercise.distance },
        ].filter(Boolean)

        const isSingle = keyInfos.length === 1

        return (
          <div className={`flex items-center gap-3 ${isSingle ? 'justify-center' : ''}`}>
            {exercise.reps && (
              <div className={`bg-white border-2 border-foreground text-foreground rounded-2xl px-2 py-2 text-center shadow-xl ${isSingle ? 'max-w-xs' : 'w-full max-w-sm'}`}>
                <div className="text-xl font-bold">{exercise.reps}</div>
                <div className="text-xs font-semibold mt-0.5 tracking-wide">RÉPÉTITIONS</div>
              </div>
            )}
            {exercise.duration && (
              <div className={`bg-white border-2 border-foreground text-foreground rounded-2xl px-6 py-2.5 text-center shadow-xl ${isSingle ? 'max-w-xs' : 'w-full max-w-md'}`}>
                <div className="text-2xl font-bold">{exercise.duration}</div>
                <div className="text-xs font-semibold mt-0.5 tracking-wide">MINUTES</div>
              </div>
            )}
            {exercise.weight && (
              <div className={`bg-white border-2 border-foreground text-foreground rounded-2xl px-6 py-2.5 text-center shadow-xl ${isSingle ? 'max-w-xs' : 'w-full max-w-md'}`}>
                <div className="text-xl font-bold">{exercise.weight}</div>
                <div className="text-xs font-semibold mt-0.5 tracking-wide">POIDS</div>
              </div>
            )}
            {exercise.distance && (
              <div className={`bg-white border-2 border-foreground text-foreground rounded-2xl px-6 py-2.5 text-center shadow-xl ${isSingle ? 'max-w-xs' : 'w-full max-w-md'}`}>
                <div className="text-xl font-bold">{exercise.distance}</div>
                <div className="text-xs font-semibold mt-0.5 tracking-wide">DISTANCE</div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Détails d'intensité et format - Pills compactes */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exercise.intensity && (
          <div className="px-4 py-2 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800 rounded-full flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-900 dark:text-orange-200" />
            <span className="text-xs font-medium text-orange-900 dark:text-orange-200">
              Intensité: {exercise.intensity}
            </span>
          </div>
        )}
        {exercise.tempo && (
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 rounded-full flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-blue-900 dark:text-blue-200" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-200">
              Tempo: {exercise.tempo}
            </span>
          </div>
        )}
        {exercise.rest_duration && (
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 rounded-full flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-purple-900 dark:text-purple-200" />
            <span className="text-xs font-medium text-purple-900 dark:text-purple-200">
              Repos: {exercise.rest_duration}
            </span>
          </div>
        )}
        {exercise.per_side && (
          <div className="px-4 py-2 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-full flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-green-900 dark:text-green-200" />
            <span className="text-xs font-medium text-green-900 dark:text-green-200">
              Par côté
            </span>
          </div>
        )}
      </div>

      {/* Détails additionnels si présents */}
      {exercise.details && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-900 dark:text-amber-200 text-center font-medium flex items-center justify-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            {exercise.details}
          </p>
        </div>
      )}

      {/* Vidéo compacte si disponible */}
      {exerciseDetails?.video_url && (
        <div className="relative w-full aspect-video max-h-[200px] bg-black rounded-lg overflow-hidden">
          {showVideo ? (
            <iframe
              src={getYouTubeEmbedUrl(exerciseDetails.video_url) || exerciseDetails.video_url}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/70 hover:bg-black/60 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Description rapide */}
      {exerciseDetails?.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{exerciseDetails.description}</p>
      )}

      {/* Instructions principales */}
      {exerciseDetails?.instructions && (
        <div className="bg-card border rounded-lg p-3">
          <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Instructions
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{exerciseDetails.instructions}</p>
        </div>
      )}

      {/* Groupes musculaires et équipement en ligne */}
      <div className="flex flex-wrap gap-2">
        {exerciseDetails?.muscle_groups && exerciseDetails.muscle_groups.length > 0 && (
          <>
            <Dumbbell className="w-4 h-4 text-primary" />
            {exerciseDetails.muscle_groups.map((muscle, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                {muscle}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Équipement si présent */}
      {exerciseDetails?.equipment_required && exerciseDetails.equipment_required.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Wrench className="w-4 h-4" />
          {exerciseDetails.equipment_required.map((equipment, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
              {equipment}
            </span>
          ))}
        </div>
      )}

      {/* Alertes de sécurité uniquement si présentes */}
      {exerciseDetails?.safety_notes && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">{exerciseDetails.safety_notes}</p>
          </div>
        </div>
      )}

      {!exerciseDetails?.safety_notes && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2.5">
          <div className="flex items-center gap-2 ">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-md text-yellow-800 dark:text-yellow-200 leading-relaxed">Aucune donnée pour cette exercice</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-muted-foreground text-center p-4 bg-muted rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
