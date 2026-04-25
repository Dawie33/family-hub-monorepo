'use client'

import { useWorkoutStats } from '@/app/(app)/tracking/_hooks/useWorkoutStats'
import { useMemo, useState } from 'react'
import { MetricType, PeriodType } from './types'



export function PerformanceChart() {
  const { workoutStats, formatDuration } = useWorkoutStats()
  const [period, setPeriod] = useState<PeriodType>('month')
  const [metric, setMetric] = useState<MetricType>('count')

  // Calculer les données selon la période sélectionnée
  const { labels, data, durations } = useMemo(() => {
    if (!workoutStats?.workoutsByDay) {
      return { labels: [], data: [], durations: [] }
    }

    const now = new Date()

    if (period === 'week') {
      // 7 derniers jours
      const weekData = workoutStats.workoutsByDay.slice(-7)
      return {
        labels: weekData.map(d => {
          const date = new Date(d.date)
          return date.toLocaleDateString('fr-FR', { weekday: 'short' })
        }),
        data: weekData.map(d => d.count),
        durations: weekData.map(d => d.duration)
      }
    } else if (period === 'month') {
      // 30 derniers jours groupés par semaine (environ 4-5 semaines)
      const weeklyData: { label: string; count: number; duration: number }[] = []
      const monthData = workoutStats.workoutsByDay.slice(-30)

      for (let i = 0; i < monthData.length; i += 7) {
        const weekSlice = monthData.slice(i, i + 7)
        const totalCount = weekSlice.reduce((sum, d) => sum + d.count, 0)
        const totalDuration = weekSlice.reduce((sum, d) => sum + d.duration, 0)
        const startDate = new Date(weekSlice[0].date)
        const endDate = new Date(weekSlice[weekSlice.length - 1].date)

        weeklyData.push({
          label: `${startDate.getDate()}-${endDate.getDate()}`,
          count: totalCount,
          duration: totalDuration
        })
      }

      return {
        labels: weeklyData.map(w => w.label),
        data: weeklyData.map(w => w.count),
        durations: weeklyData.map(w => w.duration)
      }
    } else {
      // Derniers 12 mois (simulé pour l'instant avec les 30 derniers jours)
      // TODO: Améliorer pour gérer de vraies données mensuelles
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      const currentMonth = now.getMonth()
      const last12Months = []

      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12
        last12Months.push(months[monthIndex])
      }

      // Pour l'instant, on simule avec des 0 et le mois actuel avec les vraies données
      const yearData = new Array(12).fill(0)
      const yearDurations = new Array(12).fill(0)
      yearData[11] = workoutStats.totalWorkouts
      yearDurations[11] = workoutStats.totalDuration

      return {
        labels: last12Months,
        data: yearData,
        durations: yearDurations
      }
    }
  }, [workoutStats, period])

  const displayData = metric === 'count' ? data : durations
  const maxValue = Math.max(...displayData, 1)

  return (
    <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Performance au fil du temps</h3>
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
          {[
            { key: 'week' as PeriodType, label: 'Semaine' },
            { key: 'month' as PeriodType, label: 'Mois' },
            { key: 'year' as PeriodType, label: 'Année' }
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                ${period === p.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={() => setMetric('count')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className={`text-sm ${metric === 'count' ? 'text-white font-medium' : 'text-slate-400'}`}>Workouts</span>
        </button>
        <button
          onClick={() => setMetric('duration')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className={`text-sm ${metric === 'duration' ? 'text-white font-medium' : 'text-slate-400'}`}>Durée</span>
        </button>
      </div>

      {/* Graphique simplifié */}
      <div className="h-48 flex items-end gap-4">
        {displayData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        ) : (
          displayData.map((value, index) => {
            const height = (value / maxValue) * 100
            const countValue = data[index]
            const durationValue = durations[index]
            const barColor = metric === 'count'
              ? 'from-orange-500 to-orange-400'
              : 'from-emerald-500 to-emerald-400'
            const hoverColor = metric === 'count'
              ? 'hover:from-orange-400 hover:to-orange-300'
              : 'hover:from-emerald-400 hover:to-emerald-300'

            return (
              <div key={`${labels[index]}-${index}`} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <div
                    className={`w-full bg-gradient-to-t ${barColor} rounded-t-lg transition-all duration-500 ${hoverColor} relative group cursor-pointer`}
                    style={{ height: `${Math.max(height, 0)}%`, minHeight: value > 0 ? '20px' : '0px' }}
                  >
                    {value > 0 && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-slate-800/90 backdrop-blur border border-white/10 rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                          <p className="font-medium text-white">{countValue} workout{countValue > 1 ? 's' : ''}</p>
                          <p className="text-slate-400">
                            {formatDuration(durationValue)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="flex justify-between mt-4 text-sm text-slate-500">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  )
}
