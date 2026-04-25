'use client'

import { TimerType } from '@/hooks/useWorkoutTimer'
import { motion } from 'framer-motion'
import { Activity, Clock, Dumbbell, Zap } from 'lucide-react'

interface MenuViewProps {
  onSelectType: (type: TimerType) => void
}

export function MenuView({ onSelectType }: MenuViewProps) {
  const timerTypes = [
    {
      type: 'TABATA' as TimerType,
      label: 'Tabata',
      icon: Zap,
      gradient: 'from-purple-600 to-purple-800',
      description: 'Intervalles 20s/10s haute intensité'
    },
    {
      type: 'AMRAP' as TimerType,
      label: 'AMRAP',
      icon: Activity,
      gradient: 'from-orange-500 to-orange-700',
      description: 'Maximum de rounds possible'
    },
    {
      type: 'EMOM' as TimerType,
      label: 'EMOM',
      icon: Dumbbell,
      gradient: 'from-pink-600 to-pink-800',
      description: 'Chaque minute sur la minute'
    },
    {
      type: 'FOR_TIME' as TimerType,
      label: 'For Time',
      icon: Clock,
      gradient: 'from-green-600 to-green-800',
      description: 'Contre la montre'
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {timerTypes.map((timer, index) => {
          const Icon = timer.icon
          return (
            <motion.button
              key={timer.type}
              onClick={() => onSelectType(timer.type)}
              className={`group relative overflow-hidden bg-gradient-to-br ${timer.gradient} rounded-lg sm:rounded-xl p-3 sm:p-5 text-white transition-all hover:shadow-2xl`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-2 sm:space-y-3">
                {/* Icon */}
                <motion.div
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.div>

                {/* Title */}
                <div>
                  <h3 className="text-base sm:text-xl font-black mb-0.5 sm:mb-1">{timer.label}</h3>
                  <p className="text-[10px] sm:text-xs text-white/90 leading-tight">{timer.description}</p>
                </div>

                {/* Arrow indicator - hidden on mobile */}
                <motion.div
                  className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-sm">→</span>
                </motion.div>
              </div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
