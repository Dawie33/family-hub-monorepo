'use client'

import { GeneratedRunningPlan, RUN_TYPE_LABELS } from '@/services/running'
import { BookOpen, CheckCircle, MapPin, Timer } from 'lucide-react'

const PHASE_LABELS: Record<string, string> = {
  warmup: 'Échauffement',
  main: 'Bloc principal',
  cooldown: 'Retour au calme',
  recovery: 'Récupération',
}

const PHASE_COLORS: Record<string, string> = {
  warmup: 'border-l-green-500 bg-green-500/5',
  main: 'border-l-cyan-500 bg-cyan-500/5',
  cooldown: 'border-l-blue-500 bg-blue-500/5',
  recovery: 'border-l-slate-500 bg-slate-500/5',
}

const ZONE_COLORS: Record<string, string> = {
  zone_1: 'text-green-400',
  zone_1_2: 'text-green-400',
  zone_2: 'text-teal-400',
  zone_3: 'text-yellow-400',
  zone_4: 'text-orange-400',
  zone_5: 'text-red-400',
}

interface Props {
  plan: GeneratedRunningPlan
  onSave: () => void
  saving: boolean
}

export function RunPlanPreview({ plan, onSave, saving }: Props) {
  return (
    <div className="space-y-5">
      {/* En-tête du plan */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded flex-shrink-0">
            {RUN_TYPE_LABELS[plan.run_type]}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-4">{plan.description}</p>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{plan.total_distance_km} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Timer className="w-4 h-4 text-blue-400" />
            <span>{plan.estimated_duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-xs text-slate-500">Niveau</span>
            <span className="capitalize">{plan.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Structure de la séance */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Structure</h4>
        {plan.structure.map((phase, i) => (
          <div
            key={i}
            className={`border-l-4 rounded-r-xl p-4 ${PHASE_COLORS[phase.phase] || PHASE_COLORS.main}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white text-sm">{phase.label || PHASE_LABELS[phase.phase]}</span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {phase.distance_km && <span>{phase.distance_km} km</span>}
                <span>{phase.duration_minutes} min</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-1">{phase.pace_description}</p>
            <p className={`text-xs font-medium ${ZONE_COLORS[phase.target_zone] || 'text-slate-400'}`}>
              {phase.target_zone.replace(/_/g, ' ')}
            </p>

            {/* Intervalles */}
            {phase.intervals && phase.intervals.length > 0 && (
              <div className="mt-3 space-y-1">
                {phase.intervals.map((interval, j) => (
                  <div key={j} className="text-xs text-slate-400 bg-white/5 rounded px-2 py-1.5">
                    <span className="text-white font-medium">{interval.repetitions}×</span>{' '}
                    {interval.effort_duration} à{' '}
                    <span className="text-orange-400">{interval.pace_description}</span>
                    {' '}— récup. {interval.recovery_duration}
                  </div>
                ))}
              </div>
            )}

            {phase.notes && (
              <p className="text-xs text-slate-500 mt-2 italic">{phase.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Conseils */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-slate-300">Conseils coach</h4>
          </div>
          <p className="text-sm text-slate-400">{plan.coaching_tips}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-slate-300">Récupération</h4>
          </div>
          <p className="text-sm text-slate-400">{plan.recovery_notes}</p>
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors font-semibold disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder cette séance'}
      </button>
    </div>
  )
}
