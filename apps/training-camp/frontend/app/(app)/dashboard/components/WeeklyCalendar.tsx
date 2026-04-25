'use client'

import { useWorkoutSchedule } from '@/app/(app)/calendar/_hooks/useWorkoutSchedule'
import { useWorkoutSession } from '@/app/(app)/tracking/_hooks/useWorkoutSession'
import { Workouts } from '@/domain/entities/workout'
import { workoutsService } from '@/services/workouts'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DayWorkout, WeekDay } from './types'



export function WeeklyCalendar() {
  const router = useRouter()
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const { workoutSessions } = useWorkoutSession()
  const { schedules } = useWorkoutSchedule()
  const [workoutsDetails, setWorkoutsDetails] = useState<Map<string, Workouts>>(new Map())

  // Récupérer les détails des workouts
  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      const allWorkoutIds = new Set<string>()

      if (workoutSessions && workoutSessions.length > 0) {
        workoutSessions.forEach(s => { if (s.workout_id) allWorkoutIds.add(s.workout_id) })
      }

      if (schedules && schedules.length > 0) {
        schedules.forEach(s => { if (s.workout_id) allWorkoutIds.add(s.workout_id) })
      }

      if (allWorkoutIds.size === 0) return

      const details = new Map<string, Workouts>()

      await Promise.all(
        Array.from(allWorkoutIds).map(async (workoutId) => {
          try {
            const workout = await workoutsService.getById(workoutId)
            details.set(workoutId, workout)
          } catch (error) {
            console.error(`Failed to fetch workout ${workoutId}:`, error)
          }
        })
      )

      setWorkoutsDetails(details)
    }

    fetchWorkoutDetails()
  }, [workoutSessions, schedules])

  const weekDays = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + 1 + currentWeekOffset * 7)

    const days: WeekDay[] = []
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      const dateStr = date.toISOString().split('T')[0]
      const dayWorkouts: DayWorkout[] = []

      // Sessions complétées
      if (workoutSessions && workoutSessions.length > 0) {
        workoutSessions.forEach(session => {
          const sessionDate = new Date(session.started_at).toISOString().split('T')[0]

          if (sessionDate === dateStr) {
            const isCompleted = !!session.completed_at
            const duration = isCompleted && session.completed_at
              ? Math.floor((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000)
              : undefined

            const workoutDetail = session.workout_id ? workoutsDetails.get(session.workout_id) : undefined
            const workoutName = workoutDetail?.name || `Workout ${(session.workout_id ?? session.id).substring(0, 8)}`

            let intensity: 'low' | 'medium' | 'high' | undefined
            if (workoutDetail?.intensity) {
              const intensityMap: { [key: string]: 'low' | 'medium' | 'high' } = {
                'low': 'low', 'medium': 'medium', 'high': 'high',
                'faible': 'low', 'moyen': 'medium', 'intense': 'high'
              }
              intensity = intensityMap[workoutDetail.intensity.toLowerCase()]
            }

            dayWorkouts.push({
              id: session.id,
              workoutId: session.workout_id ?? undefined,
              name: workoutName,
              type: isCompleted ? 'completed' : 'scheduled',
              duration,
              intensity
            })
          }
        })
      }

      // Workouts planifiés sans session
      if (schedules && schedules.length > 0) {
        schedules.forEach(schedule => {
          const scheduleDateObj = new Date(schedule.scheduled_date)
          const scheduleDate = new Date(scheduleDateObj.getTime() - scheduleDateObj.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0]

          if (scheduleDate === dateStr) {
            const hasSession = workoutSessions?.some(
              session =>
                session.workout_id === schedule.workout_id &&
                new Date(session.started_at).toISOString().split('T')[0] === dateStr
            )

            if (!hasSession && schedule.status === 'scheduled') {
              const workoutName = schedule.workout_name || `Workout ${schedule.workout_id?.substring(0, 8) ?? 'unknown'}`

              let intensity: 'low' | 'medium' | 'high' | undefined
              if (schedule.intensity) {
                const intensityMap: { [key: string]: 'low' | 'medium' | 'high' } = {
                  'low': 'low', 'medium': 'medium', 'high': 'high',
                  'faible': 'low', 'moyen': 'medium', 'intense': 'high'
                }
                intensity = intensityMap[schedule.intensity.toLowerCase()]
              }

              dayWorkouts.push({
                id: schedule.id,
                workoutId: schedule.workout_id ?? undefined,
                name: workoutName,
                type: 'scheduled',
                duration: schedule.estimated_duration,
                intensity
              })
            }
          }
        })
      }

      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isToday,
        workouts: dayWorkouts
      })
    }

    return days
  }, [currentWeekOffset, workoutSessions, schedules, workoutsDetails])

  const currentMonth = weekDays[3].date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const handleDayClick = (day: WeekDay) => {
    router.push('/calendar')
  }

  return (
    <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Planning hebdomadaire</h3>
          <p className="text-sm text-slate-400 capitalize">{currentMonth}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="px-4 py-2 rounded-lg bg-white/5 text-sm cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setCurrentWeekOffset(0)}
          >
            Aujourd'hui
          </span>
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const hasWorkouts = day.workouts.length > 0
          const isRest = hasWorkouts && day.workouts[0]?.type === 'rest'
          const hasCompleted = day.workouts.some(w => w.type === 'completed')
          const hasScheduled = day.workouts.some(w => w.type === 'scheduled')

          return (
            <motion.div
              key={`${day.date.toISOString()}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleDayClick(day)}
              className={`
                relative p-3 rounded-2xl text-center transition-all duration-300 cursor-pointer min-h-[100px]
                ${day.isToday
                  ? 'bg-gradient-to-br from-orange-500/20 to-rose-500/20 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20'
                  : isRest
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'}
              `}
            >
              {/* Today indicator */}
              {day.isToday && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              )}

              {/* Day Header */}
              <div className="flex flex-col items-center mb-2">
                <p className="text-xs text-slate-400 mb-1">{day.dayName}</p>
                <p className={`text-xl font-bold ${day.isToday ? 'text-orange-400' : ''}`}>
                  {day.dayNumber}
                </p>
              </div>

              {/* Workout badges */}
              {isRest && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                  Repos
                </span>
              )}
              {hasWorkouts && !isRest && (
                <div className="space-y-1 mt-1">
                  {day.workouts.slice(0, 2).map((workout) => (
                    workout.workoutId ? (
                      <Link
                        key={workout.id}
                        href={`/workout/${workout.workoutId}`}
                        onClick={e => e.stopPropagation()}
                        className={`
                          block text-xs font-medium px-1.5 py-1 rounded-lg text-left leading-tight
                          ${workout.type === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'}
                        `}
                      >
                        <span className="line-clamp-2">{workout.name}</span>
                      </Link>
                    ) : (
                      <div
                        key={workout.id}
                        className={`
                          text-xs font-medium px-1.5 py-1 rounded-lg text-left leading-tight
                          ${workout.type === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-orange-500/20 text-orange-300'}
                        `}
                      >
                        <span className="line-clamp-2">{workout.name}</span>
                      </div>
                    )
                  ))}
                  {day.workouts.length > 2 && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      +{day.workouts.length - 2}
                    </div>
                  )}
                </div>
              )}

              {/* Status dots */}
              {hasWorkouts && !isRest && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {hasCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {hasScheduled && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <span className="text-xs text-slate-400">Planifié</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">Complété</span>
        </div>
        <Link href="/calendar" className="ml-auto text-sm text-orange-400 hover:text-orange-300 transition-colors">
          Calendrier complet →
        </Link>
      </div>
    </div>
  )
}
