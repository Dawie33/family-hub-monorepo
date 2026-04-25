'use client'

import { PersonalizedWorkout, Workouts } from '@/domain/entities/workout'
import { Exercise } from '@/domain/entities/workout-structure'
import { StarRating } from '@/components/ui/star-rating'
import { TimeInput } from '@/components/ui/time-input'
import { sessionService, workoutsService } from '@/services'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

function getAllExercises(workout: Workouts): Exercise[] {
  const exercises: Exercise[] = []
  const collectExercises = (sections: Workouts['blocks']['sections']) => {
    for (const section of sections) {
      if (section.type === 'warmup' || section.type === 'cooldown') continue
      if (section.exercises) {
        exercises.push(...section.exercises)
      }
      if (section.sections) {
        collectExercises(section.sections)
      }
    }
  }
  if (workout.blocks?.sections) {
    collectExercises(workout.blocks.sections)
  }
  return exercises
}

function LogWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Workout selection
  const [workouts, setWorkouts] = useState<Workouts[]>([])
  const [personalizedWorkouts, setPersonalizedWorkouts] = useState<PersonalizedWorkout[]>([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedWorkout, setSelectedWorkout] = useState<(Workouts & { personalized_id?: string }) | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Exercise weights (keyed by index to handle duplicate exercise names across rounds)
  const [exerciseNotes, setWeightsUsed] = useState<Record<number, string>>({})

  // Results
  const [timeMinutes, setTimeMinutes] = useState('')
  const [timeSeconds, setTimeSeconds] = useState('')
  const [capAtteint, setCapAtteint] = useState(false)
  const [capScore, setCapScore] = useState('')
  const [rounds, setRounds] = useState('')
  const [bonusReps, setBonusReps] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [wodDate, setWodDate] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
  })

  // Saving
  const [isSaving, setIsSaving] = useState(false)

  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoadingWorkouts(true)
        const [allWorkouts, personalizedResult] = await Promise.all([
          workoutsService.getAll({ limit: 100 }),
          workoutsService.getPersonalizedWorkouts(100)
        ])
        setWorkouts(allWorkouts.rows)
        setPersonalizedWorkouts(personalizedResult.rows)
      } catch (error) {
        console.error('Error fetching workouts:', error)
        toast.error('Erreur lors du chargement des workouts')
      } finally {
        setLoadingWorkouts(false)
      }
    }
    fetchWorkouts()
  }, [])

  // Pré-sélection depuis les params URL (redirection depuis le timer)
  useEffect(() => {
    const presetWorkoutId = searchParams.get('workoutId')
    const presetPersonalizedId = searchParams.get('personalizedWorkoutId')
    const presetTime = searchParams.get('time')

    // Pré-remplir le temps (format "MM:SS")
    if (presetTime) {
      const parts = presetTime.split(':')
      if (parts.length === 2) {
        setTimeMinutes(parts[0])
        setTimeSeconds(parts[1])
      } else if (parts.length === 3) {
        const totalMin = parseInt(parts[0]) * 60 + parseInt(parts[1])
        setTimeMinutes(String(totalMin))
        setTimeSeconds(parts[2])
      }
    }

    // Pré-sélectionner le workout normal — fetch direct par ID
    if (presetWorkoutId) {
      workoutsService.getById(presetWorkoutId).then((found) => {
        setSelectedWorkout({ ...found, personalized_id: undefined })
        setSearch(found.name || '')
      }).catch(() => {/* workout introuvable, pas grave */})
    }

    // Pré-sélectionner le workout personnalisé — fetch direct par ID
    if (presetPersonalizedId) {
      workoutsService.getPersonalizedWorkout(presetPersonalizedId).then((found) => {
        setSelectedWorkout({ ...found.plan_json, personalized_id: found.id })
        setSearch(found.plan_json.name || '')
      }).catch(() => {/* workout introuvable, pas grave */})
    }
  }, [searchParams])

  // Combined workout list for search, with personalized_workout_id tracked
  const allWorkoutsList = useMemo(() => {
    const regular = workouts.map(w => ({ ...w, personalized_id: undefined as string | undefined }))
    const fromPersonalized = personalizedWorkouts.map(pw => ({
      ...pw.plan_json,
      personalized_id: pw.id,
      created_at: pw.created_at
    }))
    const result = [...regular, ...fromPersonalized]
    result.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return result
  }, [workouts, personalizedWorkouts])

  // Exercises from selected workout
  const exercises = useMemo(() => {
    if (!selectedWorkout) return []
    return getAllExercises(selectedWorkout)
  }, [selectedWorkout])

  const isAmrap = useMemo(() => {
    if (!selectedWorkout) return false
    return selectedWorkout.workout_type?.toLowerCase().includes('amrap') ||
      selectedWorkout.blocks?.sections?.some(s =>
        s.type === 'amrap' || s.format?.toLowerCase().includes('amrap')
      )
  }, [selectedWorkout])

  const handleSelectWorkout = useCallback((workout: Workouts) => {
    setSelectedWorkout(workout)
    setSearch(workout.name || '')
    setShowDropdown(false)
    setWeightsUsed({})
    setCapAtteint(false)
    setCapScore('')
  }, [])

  const handleExerciseNoteChange = useCallback((idx: number, value: string) => {
    setWeightsUsed(prev => ({ ...prev, [idx]: value }))
  }, [])

  const handleSave = async () => {

    const totalSeconds = (parseInt(timeMinutes || '0') * 60) + parseInt(timeSeconds || '0')
    if (!isAmrap && !capAtteint && totalSeconds === 0) {
      toast.error('Saisis un temps ou coche "Cap atteint"')
      return
    }
    if (isAmrap && !rounds && !bonusReps) {
      toast.error('Saisis un score AMRAP')
      return
    }

    try {
      setIsSaving(true)

      const completedAt = new Date(wodDate)
      const startedAt = new Date(completedAt.getTime() - totalSeconds * 1000)

      // Create session - use personalized_workout_id if applicable
      const sessionData: { workout_id?: string; personalized_workout_id?: string; started_at: string } = {
        started_at: startedAt.toISOString()
      }
      if (selectedWorkout?.personalized_id) {
        sessionData.personalized_workout_id = selectedWorkout.personalized_id
      } else {
        sessionData.workout_id = selectedWorkout?.id
      }
      const session = await sessionService.startSession(sessionData)

      // Clean exercise notes (remove empty values, label by exercise name + position)
      const cleanNotes: Record<string, string> = {}
      for (const [idxStr, note] of Object.entries(exerciseNotes)) {
        if (note.trim()) {
          const exercise = exercises[parseInt(idxStr)]
          const label = exercises.filter((e, i) => e.name === exercise.name && i < parseInt(idxStr)).length > 0
            ? `${exercise.name} (${parseInt(idxStr) + 1})`
            : exercise.name
          cleanNotes[label] = note.trim()
        }
      }

      // Update with results
      const resultPayload: Record<string, unknown> = {
        rounds: rounds ? parseInt(rounds) : undefined,
        reps: bonusReps ? parseInt(bonusReps) : undefined,
        rating: rating > 0 ? rating : undefined,
        exercise_details: Object.keys(cleanNotes).length > 0 ? cleanNotes : undefined,
      }
      if (!isAmrap) {
        if (capAtteint) {
          resultPayload.cap_reached = true
          if (capScore) resultPayload.reps_at_cap = parseInt(capScore, 10)
        } else if (totalSeconds > 0) {
          resultPayload.elapsed_time_seconds = totalSeconds
        }
      }
      await sessionService.updateSession(session.id, {
        completed_at: completedAt.toISOString(),
        notes: notes || undefined,
        results: resultPayload,
      })

      toast.success('WOD enregistré !')
      router.push('/tracking')
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/tracking"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            &larr;
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Enregistrer un WOD</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Log un workout réalisé manuellement</p>
          </div>
        </div>

        {/* Workout Selection */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 overflow-visible">
          <div className='flex justify-between items-center'>

            <h2 className="text-lg font-semibold text-white">Quel WOD as-tu fait ?</h2>
            <Link href={'/workouts/new'} >
              <button
                onClick={handleSave}
                className="p-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >Ajouter un wod</button>
            </Link>

          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowDropdown(true)
                if (selectedWorkout && e.target.value !== selectedWorkout.name) {
                  setSelectedWorkout(null)
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher un workout..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
            />

            {showDropdown && !selectedWorkout && (
              <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl">
                {loadingWorkouts ? (
                  <div className="p-4 text-center text-slate-400">Chargement...</div>
                ) : allWorkoutsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Aucun workout trouvé</div>
                ) : (
                  allWorkoutsList.map((w, idx) => (
                    <button
                      key={`${w.personalized_id || w.id}-${idx}`}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                      onClick={() => handleSelectWorkout(w)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{w.name}</span>
                        {w.personalized_id && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded">Perso</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {w.workout_type && (
                          <span className="text-xs text-orange-400">{w.workout_type.replace(/_/g, ' ')}</span>
                        )}
                        {w.estimated_duration && (
                          <span className="text-xs text-slate-500">{w.estimated_duration} min</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedWorkout && (
            <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{selectedWorkout.name}</p>
                  {selectedWorkout.personalized_id && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded">Perso</span>
                  )}
                </div>
                <div className="flex gap-2 mt-0.5">
                  {selectedWorkout.workout_type && (
                    <span className="text-xs text-orange-400">{selectedWorkout.workout_type.replace(/_/g, ' ')}</span>
                  )}
                  {selectedWorkout.difficulty && (
                    <span className="text-xs text-slate-400">{selectedWorkout.difficulty}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedWorkout(null)
                  setSearch('')
                  setWeightsUsed({})
                }}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Exercise Details */}
        {
          selectedWorkout && exercises.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Details des exercices</h2>
                <p className="text-xs text-slate-500 mt-0.5">Poids, distance, scaling, variante...</p>
              </div>
              <div className="space-y-3">
                {exercises.map((exercise, idx) => {
                  const hints: string[] = []
                  if (exercise.weight) hints.push(exercise.weight)
                  if (exercise.distance) hints.push(exercise.distance)
                  if (exercise.details) {
                    const scaledMatch = exercise.details.match(/Scaled:\s*([^|]+)/i)
                    if (scaledMatch) hints.push(`Scaled: ${scaledMatch[1].trim()}`)
                  }
                  const placeholder = hints.length > 0 ? hints.join(' / ') : 'ex: 60kg, Scaled, 500m...'

                  return (
                    <div key={`${exercise.name}-${idx}`} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {exercise.reps && (
                            <span className="text-xs text-slate-500">{exercise.reps} reps</span>
                          )}
                          {exercise.duration && (
                            <span className="text-xs text-slate-500">{exercise.duration}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={exerciseNotes[idx] || ''}
                          onChange={(e) => handleExerciseNoteChange(idx, e.target.value)}
                          placeholder={placeholder}
                          className="w-full mt-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        {/* Results */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5">
          <h2 className="text-lg font-semibold text-white">Résultats</h2>

          {/* Date */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Date et heure du WOD</label>
            <input
              type="datetime-local"
              value={wodDate}
              onChange={(e) => setWodDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Time */}
          {!isAmrap && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-slate-400">Temps réalisé</label>
                <button
                  onClick={() => setCapAtteint(!capAtteint)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    capAtteint
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cap atteint
                </button>
              </div>
              {!capAtteint ? (
                <TimeInput
                  minutes={timeMinutes}
                  seconds={timeSeconds}
                  onMinutesChange={setTimeMinutes}
                  onSecondsChange={setTimeSeconds}
                />
              ) : (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={capScore}
                    onChange={(e) => setCapScore(e.target.value)}
                    placeholder="0"
                    className="w-24 bg-transparent text-white text-center text-xl font-mono outline-none"
                  />
                  <span className="text-red-400 text-sm">reps au cap (score officiel)</span>
                </div>
              )}
            </div>
          )}


          {/* Rounds (if AMRAP) */}
          {isAmrap && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Score AMRAP</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-28 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-center text-xl font-mono focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <span className="text-slate-400 font-semibold">rounds +</span>
                <input
                  type="number"
                  value={bonusReps}
                  onChange={(e) => setBonusReps(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-28 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-center text-xl font-mono focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <span className="text-slate-400">reps</span>
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Comment tu t'es senti ?</label>
            <StarRating rating={rating} onChange={setRating} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comment s'est passé ton WOD ?"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-20 sm:pb-8">
          <Link
            href="/tracking"
            className="flex-1 py-3.5 text-center border border-slate-700/50 bg-slate-800/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 transition-colors"
          >
            Annuler
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedWorkout}
            className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer le WOD'}
          </button>
        </div>
      </div >
    </motion.div >
  )
}

export default function LogWorkoutPage() {
  return     <LogWorkoutContent />
}
