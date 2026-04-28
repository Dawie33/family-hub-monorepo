'use client'

import { workoutsService } from '@/services'
import { googleCalendarApi } from '@/services/google-calendar'
import { scheduleApi } from '@/services/schedule'
import type { UnifiedActivity } from '@/services/activities'
import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useCalendarApp } from '@schedule-x/react'
import type { Workouts } from '@/domain/entities/workout'
import { printWorkout } from '@/components/workout/WorkoutPrintView'
import { format } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CustomEventContent } from '../_components/CalendarEventContent'
import { useWorkoutSchedule } from './useWorkoutSchedule'

export function useCalendarPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateActionOpen, setDateActionOpen] = useState(false)
  const [parseBoxWodOpen, setParseBoxWodOpen] = useState(false)
  const [parseBoxWodMode, setParseBoxWodMode] = useState<'instagram' | 'search'>('instagram')
  const [weeklyPlannerOpen, setWeeklyPlannerOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [logModalData, setLogModalData] = useState<{
    scheduleId: string
    workoutId?: string
    workoutName: string
    workoutType?: string
    defaultLocation?: 'box' | 'maison'
  } | null>(null)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [printWorkoutData, setPrintWorkoutData] = useState<Workouts | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null)
  const [eventsService] = useState(() => createEventsServicePlugin())

  const { schedules, loading, createSchedule, refetch, updateSchedule, deleteSchedule, markAsCompleted, markAsSkipped } = useWorkoutSchedule()

  // Google Calendar status + OAuth callback
  useEffect(() => {
    googleCalendarApi.getStatus().then(setGoogleConnected).catch(() => { })

    const params = new URLSearchParams(window.location.search)
    if (params.get('google_connected') === 'true') {
      setGoogleConnected(true)
      toast.success('Google Calendar connecté !')
      window.history.replaceState({}, '', '/calendar')
    }
  }, [])

  const handleGoogleConnect = async () => {
    setGoogleLoading(true)
    try {
      const url = await googleCalendarApi.getAuthUrl()
      window.location.href = url
    } catch {
      toast.error('Erreur lors de la connexion à Google Calendar')
      setGoogleLoading(false)
    }
  }

  const handleGoogleDisconnect = async () => {
    setGoogleLoading(true)
    try {
      await googleCalendarApi.disconnect()
      setGoogleConnected(false)
      toast.success('Google Calendar déconnecté')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Couleurs par module pour différencier visuellement les activités dans le calendrier
  const MODULE_COLORS: Record<string, string> = {
    crossfit: '',       // couleur par défaut (status-based)
    hyrox: 'hyrox',
    running: 'running',
    athx: 'athx',
    strength: 'strength',
  }

  const mapSchedulesToEvents = useCallback((scheduleList: UnifiedActivity[]) => {
    return scheduleList.map((schedule) => {
      const scheduleDateObj = new Date(schedule.scheduled_date)
      const dateStr = new Date(scheduleDateObj.getTime() - scheduleDateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0]

      const isBoxSession = schedule.session_type === 'box_session'

      return {
        id: schedule.id,
        title: schedule.title,
        start: Temporal.PlainDate.from(dateStr),
        end: Temporal.PlainDate.from(dateStr),
        status: schedule.status,
        module: schedule.module,
        moduleColor: MODULE_COLORS[schedule.module] || '',
        session_type: schedule.session_type,
        workout_type: schedule.workout_type,
        difficulty: schedule.difficulty,
        duration: schedule.estimated_duration,
        workout_id: schedule.workout_id,
        personalized_workout_id: schedule.personalized_workout_id,
        activity_type: schedule.activity_type,
        activity_id: schedule.activity_id,
        session_data: schedule.session_data,
        _source: schedule._source,
        target_muscles: schedule.target_muscles,
        session_goal: schedule.session_goal,
        duration_minutes: schedule.duration_minutes,
        perceived_effort: schedule.perceived_effort,
        _onComplete: schedule._source === 'strength_sessions' ? undefined : () => { markAsCompleted(schedule.id); setSelectedEvent(null) },
        _onSkip: schedule._source === 'strength_sessions' ? undefined : () => { markAsSkipped(schedule.id); setSelectedEvent(null) },
        _onDelete: schedule._source === 'strength_sessions' ? undefined : () => {
          if (confirm('Voulez-vous vraiment supprimer cette planification ?')) {
            deleteSchedule(schedule.id)
            setSelectedEvent(null)
          }
        },
        _onLog: (schedule.workout_id || isBoxSession) ? () => {
          setLogModalData({
            scheduleId: schedule.id,
            workoutId: schedule.workout_id ?? undefined,
            workoutName: isBoxSession ? 'Séance Box' : schedule.title,
            workoutType: schedule.workout_type,
            defaultLocation: isBoxSession ? 'box' : 'maison',
          })
          setSelectedEvent(null)
          setLogModalOpen(true)
        } : undefined,
        _onPrint: schedule.workout_id ? () => {
          setSelectedEvent(null)
          workoutsService.getById(schedule.workout_id!).then((w) => {
            setPrintWorkoutData(w)
            setTimeout(printWorkout, 100)
          }).catch(() => toast.error('Impossible de charger le workout'))
        } : undefined,
      }
    })
  }, [markAsCompleted, markAsSkipped, deleteSchedule])

  const calendar = useCalendarApp({
    locale: 'fr-FR',
    isDark: true,
    defaultView: createViewMonthGrid().name,
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: [],
    plugins: [eventsService, createDragAndDropPlugin()],
    callbacks: {
      onEventClick: (calendarEvent: Record<string, unknown>) => {
        setSelectedEvent(calendarEvent)
      },
      onClickDate: (date: Temporal.PlainDate) => {
        const d = new Date(date.year, date.month - 1, date.day)
        setSelectedDate(d)
        setDateActionOpen(true)
      },
      onClickDateTime: (dateTime: Temporal.ZonedDateTime) => {
        const d = new Date(dateTime.year, dateTime.month - 1, dateTime.day)
        setSelectedDate(d)
        setDateActionOpen(true)
      },
      onEventUpdate: (updatedEvent: Record<string, unknown>) => {
        const start = updatedEvent.start as Temporal.PlainDate | Temporal.ZonedDateTime
        let dateStr: string
        if ('toPlainDate' in start) {
          dateStr = start.toPlainDate().toString()
        } else {
          dateStr = start.toString()
        }
        updateSchedule(updatedEvent.id as string, { scheduled_date: dateStr })
      },
    },
  })

  // Sync schedules → calendar events
  useEffect(() => {
    if (!loading) {
      eventsService.set(mapSchedulesToEvents(schedules))
    }
  }, [schedules, loading, mapSchedulesToEvents, eventsService])

  const handleScheduleWorkout = async (
    payload: { workout_id?: string; personalized_workout_id?: string },
    notes?: string
  ) => {
    await createSchedule({
      ...payload,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      notes,
    })
  }

  const handleMarkBoxDay = async () => {
    const date = format(selectedDate, 'yyyy-MM-dd')
    try {
      const schedule = await scheduleApi.createBoxSession(date)
      // Ajouter manuellement dans la liste locale
      refetch()
      toast.success(`Jour Box marqué pour le ${format(selectedDate, 'dd/MM/yyyy')}`)
      return schedule
    } catch {
      toast.error('Impossible de marquer ce jour box (déjà occupé ?)')
    }
  }

  const customComponents = useMemo(() => ({
    monthGridEvent: CustomEventContent,
    dateGridEvent: CustomEventContent,
    timeGridEvent: CustomEventContent,
  }), [])

  return {
    // Modal state
    modalOpen, setModalOpen,
    selectedDate, setSelectedDate,
    dateActionOpen, setDateActionOpen,
    parseBoxWodOpen, setParseBoxWodOpen, parseBoxWodMode, setParseBoxWodMode,
    weeklyPlannerOpen, setWeeklyPlannerOpen,
    logModalOpen, setLogModalOpen,
    logModalData,
    // Google
    googleConnected, googleLoading,
    handleGoogleConnect, handleGoogleDisconnect,
    // Print
    printWorkoutData,
    // Calendar
    loading,
    calendar, customComponents,
    selectedEvent, setSelectedEvent,
    // Actions
    handleScheduleWorkout,
    handleMarkBoxDay,
    refetch,
  }
}
