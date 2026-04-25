'use client'

import { useWorkoutStats } from '@/app/(app)/tracking/_hooks/useWorkoutStats'
import { SkillProgram } from '@/domain/entities/skill'
import apiClient from '@/services/apiClient'
import { BarChart2, ChevronLeft, ChevronRight, Dumbbell, Flame, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const TYPE_LABELS: Record<string, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  STRENGTH: 'Force',
}

const TYPE_COLORS: Record<string, string> = {
  FOR_TIME: 'bg-orange-500',
  AMRAP: 'bg-blue-500',
  EMOM: 'bg-violet-500',
  TABATA: 'bg-pink-500',
  STRENGTH: 'bg-amber-500',
}

export function TrainingOverview() {
  const { workoutStats, formatDuration } = useWorkoutStats()
  const [activeSkills, setActiveSkills] = useState<SkillProgram[]>([])
  const [skillIndex, setSkillIndex] = useState(0)

  useEffect(() => {
    apiClient.get<SkillProgram[]>('/skills?status=active')
      .then((skills) => setActiveSkills(skills ?? []))
      .catch(() => setActiveSkills([]))
  }, [])

  const weekStats = useMemo(() => {
    if (!workoutStats?.workoutsByDay) {
      return { current: 0, previous: 0, currentDuration: 0, previousDuration: 0 }
    }
    const days = workoutStats.workoutsByDay
    const currentWeek = days.slice(-7)
    const previousWeek = days.slice(-14, -7)
    return {
      current: currentWeek.reduce((s, d) => s + d.count, 0),
      previous: previousWeek.reduce((s, d) => s + d.count, 0),
      currentDuration: currentWeek.reduce((s, d) => s + d.duration, 0),
      previousDuration: previousWeek.reduce((s, d) => s + d.duration, 0),
    }
  }, [workoutStats])

  const typeDistribution = useMemo(() => {
    if (!workoutStats?.workoutsByType) return []
    const entries = Object.entries(workoutStats.workoutsByType).filter(([, v]) => v > 0)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    if (total === 0) return []
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }))
  }, [workoutStats])

  const trend = (current: number, previous: number) => {
    if (previous === 0) return null
    const delta = current - previous
    if (delta > 0) return { Icon: TrendingUp, text: `+${delta}`, color: 'text-emerald-400' }
    if (delta < 0) return { Icon: TrendingDown, text: `${delta}`, color: 'text-rose-400' }
    return { Icon: Minus, text: '=', color: 'text-slate-400' }
  }

  const workoutTrend = trend(weekStats.current, weekStats.previous)
  const durationTrend = trend(weekStats.currentDuration, weekStats.previousDuration)

  return (
    <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-5">
      <h3 className="text-lg font-semibold">Vue d'ensemble</h3>

      {/* Stats hebdo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-400 mb-1">Cette semaine</p>
          <p className="text-3xl font-bold">{weekStats.current}</p>
          <p className="text-xs text-slate-500 mt-0.5">workout{weekStats.current > 1 ? 's' : ''}</p>
          {workoutTrend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${workoutTrend.color}`}>
              <workoutTrend.Icon className="h-3 w-3" />
              <span>{workoutTrend.text} vs S-1</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-400 mb-1">Durée semaine</p>
          <p className="text-3xl font-bold">{formatDuration(weekStats.currentDuration)}</p>
          <p className="text-xs text-slate-500 mt-0.5">temps actif</p>
          {durationTrend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${durationTrend.color}`}>
              <durationTrend.Icon className="h-3 w-3" />
              <span>vs S-1</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-400 mb-1">Streak</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{workoutStats?.currentStreak ?? 0}</p>
            <Flame className={`h-5 w-5 ${(workoutStats?.currentStreak ?? 0) > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">jours consécutifs</p>
        </div>
      </div>

      {/* Distribution des types */}
      {typeDistribution.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-400">Répartition des types</p>
          </div>
          <div className="space-y-2">
            {typeDistribution.slice(0, 4).map(({ type, count, pct }) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28 shrink-0 truncate">{TYPE_LABELS[type] ?? type}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${TYPE_COLORS[type] ?? 'bg-slate-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills actifs — carrousel */}
      <div className="mt-auto">
        {activeSkills.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-medium text-slate-300">Progressions actives</p>
              </div>
              <Link href="/skills" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSkillIndex((i) => (i - 1 + activeSkills.length) % activeSkills.length)}
                  disabled={activeSkills.length <= 1}
                  className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors shrink-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-semibold truncate">{activeSkills[skillIndex].skill_name}</p>
                    <span className="text-sm font-bold text-orange-400 shrink-0 ml-2">
                      {activeSkills[skillIndex].total_steps
                        ? Math.round(((activeSkills[skillIndex].completed_steps ?? 0) / activeSkills[skillIndex].total_steps) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-700"
                      style={{
                        width: `${activeSkills[skillIndex].total_steps
                          ? Math.round(((activeSkills[skillIndex].completed_steps ?? 0) / activeSkills[skillIndex].total_steps) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {activeSkills[skillIndex].completed_steps ?? 0} / {activeSkills[skillIndex].total_steps ?? 0} étapes complétées
                  </p>
                </div>
                <button
                  onClick={() => setSkillIndex((i) => (i + 1) % activeSkills.length)}
                  disabled={activeSkills.length <= 1}
                  className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors shrink-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              {activeSkills.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {activeSkills.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSkillIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === skillIndex ? 'w-5 bg-orange-400' : 'w-2 bg-white/20'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 border border-dashed border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-slate-500" />
              <p className="text-sm text-slate-500">Aucune progression active</p>
            </div>
            <Link href="/skills/new" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Créer →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
