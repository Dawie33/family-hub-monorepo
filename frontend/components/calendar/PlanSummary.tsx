'use client'

import { DayConfig } from './DayConfigGrid'

interface PlanSummaryProps {
  dayConfigs: DayConfig[]
}

export function PlanSummary({ dayConfigs }: PlanSummaryProps) {
  const boxCount = dayConfigs.filter(d => d.isBox).length
  const crossfitCount = dayConfigs.filter(d => d.sports.includes('crossfit')).length
  const runningCount = dayConfigs.filter(d => d.sports.includes('running')).length
  const hyroxCount = dayConfigs.filter(d => d.sports.includes('hyrox')).length
  const athxCount = dayConfigs.filter(d => d.sports.includes('athx')).length
  const total = boxCount + crossfitCount + runningCount + hyroxCount + athxCount

  return (
    <div className="p-3 rounded-xl bg-slate-800/50 border border-white/10 text-sm text-slate-400">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {crossfitCount > 0 && <span className="text-orange-400 font-medium">{crossfitCount} CrossFit IA</span>}
        {boxCount > 0 && <span className="text-blue-400 font-medium">{boxCount} jour{boxCount > 1 ? 's' : ''} Box</span>}
        {runningCount > 0 && <span className="text-green-400 font-medium">{runningCount} Running</span>}
        {hyroxCount > 0 && <span className="text-yellow-400 font-medium">{hyroxCount} HYROX</span>}
        {athxCount > 0 && <span className="text-purple-400 font-medium">{athxCount} ATHX</span>}
        {total === 0 && <span>Sélectionne des jours pour commencer</span>}
      </div>
    </div>
  )
}
