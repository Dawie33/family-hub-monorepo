'use client'

import { AthxSession, ATHX_SESSION_TYPE_COLORS, ATHX_SESSION_TYPE_LABELS } from '@/services/athx'
import { Clock, Eye, Trash2, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const ZONE_COLORS: Record<string, string> = {
  warmup: 'text-green-400',
  strength: 'text-red-400',
  endurance: 'text-blue-400',
  metcon: 'text-orange-400',
  cooldown: 'text-slate-400',
}

interface AthxSessionCardProps {
  session: AthxSession
  onDelete: (id: string) => void
}

export function AthxSessionCard({ session, onDelete }: AthxSessionCardProps) {
  const [confirming, setConfirming] = useState(false)
  const typeColor = ATHX_SESSION_TYPE_COLORS[session.session_type]
  const typeLabel = ATHX_SESSION_TYPE_LABELS[session.session_type]
  const date = new Date(session.session_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${typeColor}`}>
              {typeLabel}
            </span>
            {session.source === 'ai_generated' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                IA
              </span>
            )}
            <span className="text-xs text-slate-500">{date}</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {session.duration_minutes && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{session.duration_minutes} min</span>
              </div>
            )}
            {session.perceived_effort && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>RPE {session.perceived_effort}/10</span>
              </div>
            )}
          </div>

          {session.ai_plan && (
            <div className="mt-2 flex flex-wrap gap-1">
              {session.ai_plan.blocks
                .map((b) => (
                  <span key={b.zone} className={`text-[10px] ${ZONE_COLORS[b.zone] || 'text-slate-400'}`}>
                    {b.label}
                  </span>
                ))
                .reduce(
                  (acc, el, i) =>
                    i === 0
                      ? [el]
                      : [...acc, <span key={`sep-${i}`} className="text-slate-600 text-[10px]">·</span>, el],
                  [] as React.ReactNode[]
                )}
            </div>
          )}

          {session.notes && (
            <p className="text-xs text-slate-500 mt-1 truncate">{session.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {confirming ? (
            <>
              <button
                onClick={() => onDelete(session.id)}
                className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                aria-label="Annuler"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/athx/${session.id}`}
                className="text-slate-500 hover:text-purple-400 transition-colors p-1"
                aria-label="Voir la séance"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setConfirming(true)}
                className="text-slate-600 hover:text-red-400 transition-colors p-1"
                aria-label="Supprimer la séance"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
