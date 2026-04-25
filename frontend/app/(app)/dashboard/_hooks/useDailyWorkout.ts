import { workoutsService } from '@/services'
import { Workouts } from '@/domain/entities/workout'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useDailyWorkout() {
    const [dailyWorkout, setDailyWorkout] = useState<Workouts | null>(null)
    const [workoutLoading, setWorkoutLoading] = useState(false)

    /**
     * Récupère le workout du jour.
     * Si une erreur survient lors de la récupération, affiche null comme workout du jour.
     * Met à jour le statut de chargement du workout du jour.
     */
    const fetchDailyWorkout = useCallback(async () => {

        try {
            setWorkoutLoading(true)
            const response = await workoutsService.getDailyWorkout()
            // On prend le premier workout du tableau
            setDailyWorkout(response)
        } catch (err) {
            toast.error(`Une erreur est survenue lors de la récupération du workout du jour: ${err}`)
        } finally {
            setWorkoutLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDailyWorkout()
    }, [fetchDailyWorkout])

    return { dailyWorkout, workoutLoading }
}