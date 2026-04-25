'use client'

import {
  formatTime,
  HyroxSession,
  HYROX_SESSION_TYPE_COLORS,
  HYROX_SESSION_TYPE_LABELS,
  HYROX_STATION_LABELS,
} from '@/services/hyrox'
import { Timer, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface HyroxSessionCardProps {
  session: HyroxSession
  onDelete: (id: string) => void
}

export function HyroxSessionCard({ session, onDelete }: HyroxSessionCardProps) {
  const [confirming, setConfirming] = useState(false)
  const typeColor = HYROX_SESSION_TYPE_COLORS[session.session_type]
  const typeLabel = HYROX_SESSION_TYPE_LABELS[session.session_type]
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
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                IA
              </span>
            )}
            <span className="text-xs text-slate-500">{date}</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {session.total_time_seconds && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Timer className="w-3.5 h-3.5 text-green-400" />
                <span className="font-mono font-bold text-green-400">
                  {formatTime(session.total_time_seconds)}
                </span>
              </div>
            )}
            {session.perceived_effort && (
              <span className="text-slate-400 text-xs">RPE {session.perceived_effort}/10</span>
            )}
          </div>

          {session.station_times && session.station_times.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {session.station_times.slice(0, 4).map((st) => (
                <span key={st.station} className="text-[10px] text-slate-500">
                  {HYROX_STATION_LABELS[st.station]}:{' '}
                  <span className="text-yellow-400 font-mono">{formatTime(st.time_seconds)}</span>
                </span>
              ))}
              {session.station_times.length > 4 && (
                <span className="text-[10px] text-slate-600">+{session.station_times.length - 4}…</span>
              )}
            </div>
          )}
        </div>

        {confirming ? (
          <div className="flex items-center gap-1 flex-shrink-0">
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
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-slate-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
            aria-label="Supprimer la séance"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
