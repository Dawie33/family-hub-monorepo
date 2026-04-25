import { WorkoutSession } from "@/domain/entities/workout"
import { sessionService } from "@/services/sessions"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"


export function useWorkoutSession() {
    const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
    const [loading, setLoading] = useState(true)

    const fetchWorkoutsSessions = useCallback(async () => {
        try {
            setLoading(true)
            const results = await sessionService.getAll()
            setWorkoutSessions(results.rows)
        } catch (err) {
            toast.error(`Failed to load workouts : ${err}`)

        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWorkoutsSessions()
    }, [fetchWorkoutsSessions])

    return {
        workoutSessions,
        loading,
    }
}