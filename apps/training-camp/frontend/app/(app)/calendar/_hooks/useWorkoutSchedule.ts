'use client'

import { activitiesApi, UnifiedActivity, UnifiedActivityQueryParams } from '@/services/activities'
import { scheduleApi, CreateScheduleDto, UpdateScheduleDto } from '@/services/schedule'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useWorkoutSchedule(params?: UnifiedActivityQueryParams) {
  const [schedules, setSchedules] = useState<UnifiedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await activitiesApi.getUnified(params)
      setSchedules(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching activities:', err)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [params?.start_date, params?.end_date, params?.status, params?.module])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // --- CrossFit CRUD (user_workout_schedule) ---

  const createSchedule = async (data: CreateScheduleDto) => {
    try {
      const newSchedule = await scheduleApi.create(data)
      await fetchSchedules()
      toast.success('Workout planifié avec succès')
      return newSchedule
    } catch (err) {
      const error = err as { message?: string }
      toast.error(error.message || 'Erreur lors de la planification')
      throw err
    }
  }

  const updateSchedule = async (id: string, data: UpdateScheduleDto) => {
    try {
      const updated = await scheduleApi.update(id, data)
      await fetchSchedules()
      toast.success('Planification mise à jour')
      return updated
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
      throw err
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      const activity = schedules.find((s) => s.id === id)
      if (activity?._source === 'scheduled_activities') {
        await activitiesApi.delete(id)
      } else {
        await scheduleApi.delete(id)
      }
      setSchedules((prev) => prev.filter((s) => s.id !== id))
      toast.success('Planification supprimée')
    } catch (err) {
      toast.error('Erreur lors de la suppression')
      throw err
    }
  }

  const markAsCompleted = async (id: string, sessionId?: string) => {
    try {
      const activity = schedules.find((s) => s.id === id)
      if (activity?._source === 'scheduled_activities') {
        const updated = await activitiesApi.markAsCompleted(id)
        setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)))
      } else {
        await scheduleApi.markAsCompleted(id, sessionId)
        await fetchSchedules()
      }
      toast.success('Activité marquée comme complétée')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
      throw err
    }
  }

  const markAsSkipped = async (id: string) => {
    try {
      const activity = schedules.find((s) => s.id === id)
      if (activity?._source === 'scheduled_activities') {
        const updated = await activitiesApi.markAsSkipped(id)
        setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)))
      } else {
        await scheduleApi.markAsSkipped(id)
        await fetchSchedules()
      }
      toast.success('Activité marquée comme sautée')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
      throw err
    }
  }

  const getScheduleForDate = (date: Date): UnifiedActivity | null => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.find((s) => s.scheduled_date === dateStr) || null
  }

  return {
    schedules,
    loading,
    error,
    count: schedules.length,
    refetch: fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    markAsCompleted,
    markAsSkipped,
    getScheduleForDate,
  }
}
