'use client'

import { WorkoutSession } from '@/domain/entities/workout'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ProgressChartProps {
  sessions: WorkoutSession[]
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const completed = useMemo(() => sessions.filter(s => s.completed_at), [sessions])

  // === 1. HEATMAP (12 semaines, lundi → dimanche) ===
  const heatmapWeeks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dow = today.getDay()
    const toMonday = dow === 0 ? 6 : dow - 1
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - toMonday)
    const startMonday = new Date(thisMonday)
    startMonday.setDate(thisMonday.getDate() - 11 * 7)

    const map: Record<string, number> = {}
    for (const s of completed) {
      const d = new Date(s.started_at)
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      map[k] = (map[k] || 0) + 1
    }

    const weeks: { date: Date; count: number }[][] = Array.from({ length: 12 }, () => [])
    for (let i = 0; i < 84; i++) {
      const d = new Date(startMonday)
      d.setDate(startMonday.getDate() + i)
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      weeks[Math.floor(i / 7)].push({ date: new Date(d), count: map[k] || 0 })
    }
    return weeks
  }, [completed])

  // === 2. RÉPARTITION PAR JOUR DE SEMAINE ===
  const dowData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0] // Lun=0 … Dim=6
    for (const s of completed) {
      const dow = new Date(s.started_at).getDay()
      counts[dow === 0 ? 6 : dow - 1]++
    }
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((label, i) => ({
      label,
      count: counts[i],
    }))
  }, [completed])

  // === 3. VOLUME HEBDOMADAIRE (8 semaines) ===
  const weeklyVolume = useMemo(() => {
    const now = new Date()
    const dow = now.getDay()
    const toMonday = dow === 0 ? 6 : dow - 1
    const thisMonday = new Date(now)
    thisMonday.setDate(now.getDate() - toMonday)
    thisMonday.setHours(0, 0, 0, 0)

    return Array.from({ length: 8 }, (_, i) => {
      const offset = 7 - i
      const wStart = new Date(thisMonday)
      wStart.setDate(thisMonday.getDate() - offset * 7)
      const wEnd = new Date(wStart)
      wEnd.setDate(wStart.getDate() + 6)
      wEnd.setHours(23, 59, 59, 999)

      const wSessions = completed.filter(s => {
        const d = new Date(s.started_at)
        return d >= wStart && d <= wEnd
      })

      const secs = wSessions.reduce((acc, s) => {
        if (!s.completed_at) return acc
        return acc + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 1000
      }, 0)

      const day = wStart.getDate()
      const month = wStart.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
      const label = offset === 0 ? 'Actuelle' : `${day} ${month}`

      return { label, minutes: Math.round(secs / 60), count: wSessions.length }
    })
  }, [completed])

  const maxDow = Math.max(...dowData.map(d => d.count), 1)
  const maxWeekly = Math.max(...weeklyVolume.map(w => w.minutes), 1)

  const cellColor = (n: number) => {
    if (n === 0) return 'bg-slate-800/80 border-slate-700/40'
    if (n === 1) return 'bg-orange-900/80 border-orange-700/60'
    if (n === 2) return 'bg-orange-600 border-orange-500'
    return 'bg-orange-400 border-orange-300'
  }

  return (
    <div className="space-y-8">
      {/* HEATMAP */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-400">Consistance des entraînements (12 semaines)</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Moins</span>
            {(['bg-slate-800/80', 'bg-orange-900/80', 'bg-orange-600', 'bg-orange-400'] as const).map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>Plus</span>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {/* Étiquettes jours */}
          <div className="flex flex-col gap-1 mr-1 shrink-0">
            {['Lun', '', 'Mer', '', 'Ven', '', 'Dim'].map((label, i) => (
              <div key={i} className="h-4 flex items-center text-xs text-slate-500 w-7">
                {label}
              </div>
            ))}
          </div>
          {/* Grille */}
          <div className="flex gap-1">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-4 h-4 rounded-sm border transition-transform hover:scale-125 cursor-default ${cellColor(day.count)}`}
                    title={`${day.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} : ${day.count} session${day.count > 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIGNE DU BAS : Jours de semaine + Volume hebdomadaire */}
      <div className="grid grid-cols-2 gap-8">
        {/* Répartition par jour */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Sessions par jour de semaine</h3>
          <div className="space-y-2.5">
            {dowData.map(({ label, count }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-8 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxDow) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-5 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volume hebdomadaire */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Volume par semaine (minutes)</h3>
          <div className="flex items-end gap-1.5 h-28">
            {weeklyVolume.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full">
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    className="w-full bg-gradient-to-t from-orange-500 to-rose-500 rounded-t-sm hover:opacity-80 cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${(week.minutes / maxWeekly) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    style={{ minHeight: week.minutes > 0 ? '3px' : '0' }}
                  />
                </div>
                {week.minutes > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs whitespace-nowrap">
                      <p className="font-semibold text-white">{week.minutes} min</p>
                      <p className="text-slate-400">{week.count} session{week.count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}
                <div className="text-center leading-tight" style={{ fontSize: '8px', color: '#64748b' }}>
                  {week.label.split(' ').map((part, pi) => (
                    <span key={pi} className="block">{part}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
