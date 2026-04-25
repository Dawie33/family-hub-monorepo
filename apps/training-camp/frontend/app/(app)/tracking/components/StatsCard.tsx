'use client'

import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  emoji: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-500/20 to-cyan-500/20',
    emojiBg: 'bg-blue-500/20',
  },
  green: {
    gradient: 'from-emerald-500/20 to-teal-500/20',
    emojiBg: 'bg-emerald-500/20',
  },
  orange: {
    gradient: 'from-orange-500/20 to-amber-500/20',
    emojiBg: 'bg-orange-500/20',
  },
  purple: {
    gradient: 'from-violet-500/20 to-purple-500/20',
    emojiBg: 'bg-violet-500/20',
  },
  red: {
    gradient: 'from-red-500/20 to-rose-500/20',
    emojiBg: 'bg-red-500/20',
  }
}

export function StatsCard({ title, value, emoji, color, subtitle, trend }: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl bg-gradient-to-br backdrop-blur-xl border border-white/10 p-6 group hover:border-white/20 transition-all duration-300',
      colors.gradient
    )}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
          colors.emojiBg
        )}>
          {emoji}
        </div>
      </div>
      <p className="text-3xl font-bold">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
      )}
      {trend && (
        <p className={cn(
          'text-xs mt-2',
          trend.isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </p>
      )}
    </div>
  )
}
