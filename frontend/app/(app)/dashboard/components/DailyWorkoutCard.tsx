'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Clock, Dumbbell, Flame } from 'lucide-react'
import Link from 'next/link'
import { useDailyWorkout } from '../_hooks/useDailyWorkout'

export function DailyWorkoutCard() {
  const { dailyWorkout, workoutLoading } = useDailyWorkout()

  if (workoutLoading) {
    return (
      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Workout du jour</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!dailyWorkout) {
    return (
      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Workout du jour</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Aucun workout disponible pour aujourd'hui
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/30 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm font-medium border border-orange-500/30">
            🔥 Workout du jour
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-sm">
            Aujourd'hui
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-3">{dailyWorkout.name}</h2>
        {dailyWorkout.description && (
          <p className="text-slate-400 max-w-2xl mb-6">
            {dailyWorkout.description}
          </p>
        )}

        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Durée</p>
              <p className="text-xl font-bold">{dailyWorkout.estimated_duration || 'N/A'} min</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 backdrop-blur flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Intensité</p>
              <p className="text-xl font-bold text-orange-400 capitalize">
                {dailyWorkout.intensity || 'Modérée'}
              </p>
            </div>
          </div>
          {dailyWorkout.blocks?.sections && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Blocs</p>
                <p className="text-xl font-bold">
                  {dailyWorkout.blocks.sections.length} bloc{dailyWorkout.blocks.sections.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Workout blocks preview */}
        {dailyWorkout.blocks?.sections && dailyWorkout.blocks.sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {dailyWorkout.blocks.sections.map((section, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
                {section.title || `Bloc ${i + 1}`}
              </span>
            ))}
          </div>
        )}

        <Button asChild className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]">
          <Link href={`/workout/${dailyWorkout.id}`}>
            <span className="relative z-10 flex items-center gap-2">
              Commencer le workout
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
