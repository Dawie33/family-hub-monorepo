'use client'

import {
  BLOCK_TYPE_LABELS,
  MUSCLE_COLORS,
  MUSCLE_LABELS,
  SESSION_GOAL_COLORS,
  SESSION_GOAL_LABELS,
  StrengthSession,
} from '@/services/strength'
import { Calendar, Clock, RotateCcw, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'

interface Props {
  session: StrengthSession
  onDelete: (id: string) => void
}

export function StrengthSessionCard({ session, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const plan = session.ai_plan
  const muscles = session.target_muscles as (keyof typeof MUSCLE_LABELS)[]

  const rotationBlocks = plan?.blocks.filter((b) => b.block_type === 'rotation') ?? []

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return }
    onDelete(session.id)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${SESSION_GOAL_COLORS[session.session_goal]}`}>
              {SESSION_GOAL_LABELS[session.session_goal]}
            </span>
            {session.source === 'ai_generated' && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/30">IA</span>
            )}
          </div>

          <p className="font-semibold text-white text-sm truncate">
            {plan?.session_name ?? 'Séance de force'}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {muscles.map((m) => (
              <span key={m} className={`text-[11px] px-1.5 py-0.5 rounded border ${MUSCLE_COLORS[m] ?? 'bg-white/10 text-slate-400 border-white/10'}`}>
                {MUSCLE_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {new Date(session.session_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </div>
          {session.duration_minutes && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {session.duration_minutes} min
            </div>
          )}
          {session.perceived_effort && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Zap className="w-3 h-3" />
              RPE {session.perceived_effort}
            </div>
          )}
        </div>
      </button>

      {/* Contenu déroulé */}
      {expanded && plan && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {plan.coaching_notes && (
            <p className="text-xs text-slate-400 italic">{plan.coaching_notes}</p>
          )}

          {/* Blocs */}
          <div className="space-y-2">
            {plan.blocks.map((block, i) => (
              <div key={i} className={`border-l-4 pl-3 py-1 rounded-r-lg bg-white/3 ${
                block.block_type === 'rotation' ? 'border-l-cyan-500' : 'border-l-white/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {block.block_type === 'rotation' && <RotateCcw className="w-3 h-3 text-cyan-400 shrink-0" />}
                  <span className="text-xs font-semibold text-slate-300">{block.block_name}</span>
                  <span className="text-[10px] text-slate-500">— {BLOCK_TYPE_LABELS[block.block_type]}</span>
                </div>
                {block.exercises.map((ex, j) => (
                  <p key={j} className="text-xs text-slate-400 ml-1">
                    <span className="text-white">{ex.name}</span>
                    {' '}— {ex.sets}×{ex.reps}
                    {ex.rest && <span className="text-slate-500"> · repos {ex.rest}</span>}
                    {ex.intensity && <span className="text-violet-400"> · {ex.intensity}</span>}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {rotationBlocks.length === 0 && (
            <p className="text-[11px] text-slate-500">Aucun bloc de rotation dans cette séance.</p>
          )}

          {plan.cooldown && (
            <p className="text-[11px] text-slate-500">Retour au calme : {plan.cooldown}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleDelete}
              onBlur={() => setConfirming(false)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                confirming
                  ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                  : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-3 h-3" />
              {confirming ? 'Confirmer' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
