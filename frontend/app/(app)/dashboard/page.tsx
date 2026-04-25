'use client'

import { useAuth } from '@/hooks/useAuth'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { DailyWorkoutCard } from './components/DailyWorkoutCard'
import { TrainingOverview } from './components/TrainingOverview'
import { QuickActions } from './components/QuickActions'
import { WeeklyCalendar } from './components/WeeklyCalendar'

function DashboardContent() {
  const user = useAuth()
  const dateNow = format(new Date(), 'dd-MM-yyyy')

  return (
    <motion.div
      className="min-h-screenbg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Header*/}
        <header className="mb-8">
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Salut, <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">{user?.user?.firstName || 'Champion'}</span>
              </h1>
              <p className="text-slate-400 text-lg">Prêt à t'entraîner aujourd'hui ?</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10 text-sm text-slate-300">
                {dateNow}
              </span>
            </div>
          </motion.div>
        </header>
        {/* Workout du jour */}
        <motion.div variants={fadeInUp}>
          <DailyWorkoutCard />
        </motion.div>

        {/* Training Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <TrainingOverview />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <QuickActions />
          </motion.div>
        </div>

        {/* Weekly Calendar */}
        <motion.div variants={fadeInUp}>
          <WeeklyCalendar />
        </motion.div>
      </div>
    </motion.div >
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
