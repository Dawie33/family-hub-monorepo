'use client'

import 'temporal-polyfill/global'
import './calendar-theme.css'

import { LogWorkoutModal } from '@/components/calendar/LogWorkoutModal'
import { ParseBoxWodModal } from '@/components/calendar/ParseBoxWodModal'
import { ScheduleWorkoutModal } from '@/components/calendar/ScheduleWorkoutModal'
import { WeeklyPlannerModal } from '@/components/calendar/WeeklyPlannerModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { WorkoutPrintView } from '@/components/workout/WorkoutPrintView'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { ScheduleXCalendar } from '@schedule-x/react'
import { startOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { Calendar, Unlink } from 'lucide-react'
import { CustomEventModal } from './_components/CalendarEventModal'
import { DateActionDialog } from './_components/DateActionDialog'
import { useCalendarPage } from './_hooks/useCalendarPage'

function CalendarContent() {
  const {
    modalOpen, setModalOpen,
    selectedDate,
    dateActionOpen, setDateActionOpen,
    parseBoxWodOpen, setParseBoxWodOpen, parseBoxWodMode, setParseBoxWodMode,
    weeklyPlannerOpen, setWeeklyPlannerOpen,
    logModalOpen, setLogModalOpen,
    logModalData,
    googleConnected, googleLoading,
    handleGoogleConnect, handleGoogleDisconnect,
    printWorkoutData,
    loading,
    calendar, customComponents,
    selectedEvent, setSelectedEvent,
    handleScheduleWorkout,
    handleMarkBoxDay,
    refetch,
  } = useCalendarPage()

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Calendrier</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Gérez votre planning d&apos;entraînement</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {googleConnected ? (
              <Button
                onClick={handleGoogleDisconnect}
                disabled={googleLoading}
                className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Déconnecter Google
              </Button>
            ) : (
              <Button
                onClick={handleGoogleConnect}
                disabled={googleLoading}
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {googleLoading ? 'Connexion...' : 'Sync Google Agenda'}
              </Button>
            )}
            <Button
              onClick={() => setWeeklyPlannerOpen(true)}
              className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Planifier ma semaine
            </Button>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div variants={fadeInUp} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
            </div>
          ) : (
            <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex flex-wrap gap-4">
              {[
                { color: 'blue', label: 'Programmé' },
                { color: 'green', label: 'Complété' },
                { color: 'gray', label: 'Sauté' },
                { color: 'orange', label: 'Replanifié' },
                { color: 'violet', label: 'Jour Box' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-3 h-3 rounded bg-${color}-500/20 border border-${color}-500/50`} />
                  <span className="text-slate-400">{label}</span>
                </div>
              ))}
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'CrossFit', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
                { label: 'HYROX', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
                { label: 'RUN', color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' },
                { label: 'ATHX', color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <DateActionDialog
        open={dateActionOpen}
        onOpenChange={setDateActionOpen}
        selectedDate={selectedDate}
        onScheduleWorkout={() => setModalOpen(true)}
        onParseBoxWod={() => { setParseBoxWodMode('instagram'); setParseBoxWodOpen(true) }}
        onLookupWod={() => { setParseBoxWodMode('search'); setParseBoxWodOpen(true) }}
        onMarkBoxDay={handleMarkBoxDay}
      />

      <ScheduleWorkoutModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedDate={selectedDate}
        onSchedule={handleScheduleWorkout}
        onActivityScheduled={refetch}
      />

      <ParseBoxWodModal
        open={parseBoxWodOpen}
        onOpenChange={setParseBoxWodOpen}
        selectedDate={selectedDate}
        initialMode={parseBoxWodMode}
        onSchedule={handleScheduleWorkout}
      />

      <WeeklyPlannerModal
        open={weeklyPlannerOpen}
        onOpenChange={setWeeklyPlannerOpen}
        weekStart={startOfWeek(new Date(), { weekStartsOn: 1 })}
        onPlanned={() => refetch()}
      />

      {logModalData && (
        <LogWorkoutModal
          open={logModalOpen}
          onOpenChange={setLogModalOpen}
          scheduleId={logModalData.scheduleId}
          workoutId={logModalData.workoutId}
          workoutName={logModalData.workoutName}
          workoutType={logModalData.workoutType}
          defaultLocation={logModalData.defaultLocation}
          onLogged={() => { refetch(); setLogModalOpen(false) }}
        />
      )}

      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null) }}>
        <DialogContent className="sm:max-w-[420px] bg-slate-900 border-white/10 text-white p-0 overflow-hidden">
          {selectedEvent && <CustomEventModal calendarEvent={selectedEvent} />}
        </DialogContent>
      </Dialog>

      {printWorkoutData && <WorkoutPrintView workout={printWorkoutData} />}
    </motion.div>
  )
}

export default function CalendarPage() {
  return <CalendarContent />
}
