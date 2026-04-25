'use client'

import { SaveBenchmarkResultDto } from "@/domain/entities/benchmark"
import { Workouts } from "@/domain/entities/workout"
import { workoutsService } from "@/services"
import { useState } from "react"
import { toast } from "sonner"

interface BenchmarkResultFormProps {
    workout: Workouts
    onSuccess?: (level: string) => void
}

export function BenchmarkResultForm({ workout, onSuccess }: BenchmarkResultFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // États pour les différents types de résultats
    const [timeMinutes, setTimeMinutes] = useState<string>('')
    const [timeSeconds, setTimeSeconds] = useState<string>('')
    const [rounds, setRounds] = useState<string>('')
    const [reps, setReps] = useState<string>('')
    const [weight, setWeight] = useState<string>('')
    const [notes, setNotes] = useState<string>('')

    if (!workout.is_benchmark) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            // Construire l'objet result selon le type de workout
            const result: SaveBenchmarkResultDto['result'] = {}

            // For Time workouts (Fran, Helen, 5K Time Trial...)
            if (workout.workout_type === 'for_time' && (timeMinutes || timeSeconds)) {
                const totalSeconds = (parseInt(timeMinutes || '0') * 60) + parseInt(timeSeconds || '0')
                result.time_seconds = totalSeconds
            }

            // AMRAP workouts (Cindy, Cooper Test...)
            if (workout.workout_type === 'amrap' && rounds) {
                result.rounds = parseInt(rounds)
                if (reps) {
                    result.reps = parseInt(reps)
                }
            }

            // Strength workouts (1RM Squat, Bench Press...)
            if (workout.workout_type === 'strength' && weight) {
                result.weight = parseFloat(weight)
            }

            // Vérifier qu'au moins une métrique est renseignée
            if (Object.keys(result).length === 0) {
                toast.error('Veuillez renseigner au moins un résultat')
                return
            }

            if (notes) {
                result.notes = notes
            }

            const data: SaveBenchmarkResultDto = {
                workoutId: workout.id,
                workoutName: workout.name,
                result
            }

            const response = await workoutsService.saveBenchmarkResult(data)

            toast.success(`Résultat enregistré ! Votre nouveau niveau : ${getLevelLabel(response.level)}`)

            // Reset form
            setTimeMinutes('')
            setTimeSeconds('')
            setRounds('')
            setReps('')
            setWeight('')
            setNotes('')
            setShowForm(false)

            if (onSuccess) {
                onSuccess(response.level)
            }
        } catch (error) {
            console.error('Error saving benchmark result:', error)
            toast.error('Erreur lors de l\'enregistrement du résultat')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return 'Débutant'
            case 'intermediate': return 'Intermédiaire'
            case 'advanced': return 'Avancé'
            case 'elite': return 'Elite'
            default: return level
        }
    }

    if (!showForm) {
        return (
            <div className="p-6 bg-gradient-to-r from-primary/5 to-background border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <h3 className="font-semibold text-lg">Workout Benchmark</h3>
                            <p className="text-sm text-muted-foreground">
                                Enregistrez votre résultat pour évaluer votre niveau
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Enregistrer mon résultat
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-card border rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                        <h3 className="font-semibold text-lg">Enregistrer votre résultat</h3>
                        <p className="text-sm text-muted-foreground">
                            Votre niveau sera calculé automatiquement
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    X
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* For Time workouts */}
                {workout.workout_type === 'for_time' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">
                            Temps réalisé
                        </label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Minutes"
                                    value={timeMinutes}
                                    onChange={(e) => setTimeMinutes(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-xs text-muted-foreground mt-1 block">Minutes</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="Secondes"
                                    value={timeSeconds}
                                    onChange={(e) => setTimeSeconds(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-xs text-muted-foreground mt-1 block">Secondes</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* AMRAP workouts */}
                {workout.workout_type === 'amrap' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre de rounds complétés
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ex: 20"
                                value={rounds}
                                onChange={(e) => setRounds(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Reps additionnelles (optionnel)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ex: 8"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}

                {/* Strength workouts (1RM) */}
                {workout.workout_type === 'strength' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Poids soulevé (kg)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Ex: 100"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Notes (optionnel)
                    </label>
                    <textarea
                        placeholder="Ex: RX, Scaled, ressenti, conditions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer mon résultat'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    )
}
