'use client'

import { OneRepMaxHistoryEntry, CROSSFIT_LIFTS } from '@/services/one-rep-maxes'
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface OneRepMaxChartProps {
  liftsWithHistory: [string, OneRepMaxHistoryEntry[]][]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getLiftLabel(liftValue: string) {
  return CROSSFIT_LIFTS.find((l) => l.value === liftValue)?.label ?? liftValue.replace(/_/g, ' ')
}

interface TooltipPayload {
  value: number
  payload: { source: string }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">{entry.value} kg</p>
      <p className="text-slate-500 text-xs">{entry.payload.source === 'real' ? 'Mesuré' : 'Estimé'}</p>
    </div>
  )
}

export function OneRepMaxChart({ liftsWithHistory }: OneRepMaxChartProps) {
  const [selectedLift, setSelectedLift] = useState<string>(liftsWithHistory[0]?.[0] ?? '')

  const currentLiftData = liftsWithHistory.find(([lift]) => lift === selectedLift)
  const entries = currentLiftData?.[1] ?? []

  const chartData = entries.map((e) => ({
    date: formatDate(e.measured_at),
    value: e.value,
    source: e.source,
  }))

  const maxValue = Math.max(...entries.map((e) => e.value))
  const firstValue = entries[0]?.value ?? 0
  const lastValue = entries[entries.length - 1]?.value ?? 0
  const progression = firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Sélecteur de lift */}
      <div className="flex gap-2 flex-wrap">
        {liftsWithHistory.map(([lift]) => (
          <button
            key={lift}
            onClick={() => setSelectedLift(lift)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              selectedLift === lift
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {getLiftLabel(lift)}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-400 text-sm">Aucune donnée pour ce mouvement</p>
        </div>
      ) : (
        <>
          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Actuel</p>
              <p className="text-lg font-bold text-white">{lastValue} kg</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Record (PR)</p>
              <p className="text-lg font-bold text-orange-400">{maxValue} kg</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Progression</p>
              <p className={`text-lg font-bold ${progression >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {progression >= 0 ? '+' : ''}{progression}%
              </p>
            </div>
          </div>

          {/* Graphique */}
          {entries.length >= 2 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v}kg`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {maxValue !== lastValue && (
                    <ReferenceLine
                      y={maxValue}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      label={{ value: 'PR', fill: '#f97316', fontSize: 10, position: 'right' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#orangeGradient)"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#fb923c' }}
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-slate-500 text-xs py-4">
              Enregistre au moins 2 mesures pour voir la courbe d&apos;évolution
            </p>
          )}
        </>
      )}
    </div>
  )
}
