import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SkillProgressLog, SkillStep } from '@/domain/entities/skill'
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FastForward,
  Lock,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const statusIcons: Record<string, React.ReactNode> = {
  locked: <Lock className="w-5 h-5 text-slate-500" />,
  in_progress: <Play className="w-5 h-5 text-orange-400" />,
  completed: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  skipped: <FastForward className="w-5 h-5 text-yellow-400" />,
}

const statusLabels: Record<string, string> = {
  locked: 'Verrouille',
  in_progress: 'En cours',
  completed: 'Termine',
  skipped: 'Passe',
}

interface SkillStepCardProps {
  step: SkillStep
  isExpanded: boolean
  isProgramActive: boolean
  logs: SkillProgressLog[]
  chartData: { date: string; value: number }[]
  onToggle: () => void
  onLogSession: () => void
  onComplete: () => void
  onSkip: () => void
  onDeleteLog: (logId: string) => void
}

export function SkillStepCard({
  step,
  isExpanded,
  isProgramActive,
  logs,
  chartData,
  onToggle,
  onLogSession,
  onComplete,
  onSkip,
  onDeleteLog,
}: SkillStepCardProps) {
  const isActive = step.status === 'in_progress'

  return (
    <div className="relative pl-12">
      {/* Status icon on timeline */}
      <div className={`absolute left-0 top-3 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
        isActive ? 'bg-orange-500/20 ring-2 ring-orange-500/50' :
        step.status === 'completed' ? 'bg-emerald-500/20' :
        step.status === 'skipped' ? 'bg-yellow-500/20' :
        'bg-white/5'
      }`}>
        {statusIcons[step.status]}
      </div>

      <Card className={`bg-white/5 border-white/10 ${isActive ? 'ring-1 ring-orange-500/30' : ''}`}>
        {/* Header - clickable */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">#{step.step_number}</span>
            <span className="font-medium text-white">{step.title}</span>
            <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-slate-400">
              {statusLabels[step.status]}
            </Badge>
            {step.manually_overridden && (
              <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-400">Manuel</Badge>
            )}
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
            <p className="text-slate-400 text-sm">{step.description}</p>

            {/* Validation criteria */}
            {step.validation_criteria && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Critere de validation</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">{step.validation_criteria.description}</span>
                </div>
              </div>
            )}

            {/* Recommended exercises */}
            {step.recommended_exercises && step.recommended_exercises.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Exercices recommandes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.recommended_exercises.map((ex, i) => (
                    <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
                      <p className="text-sm text-white font-medium">{ex.name}</p>
                      <p className="text-xs text-slate-400">
                        {[
                          ex.sets && `${ex.sets} series`,
                          ex.reps && `${ex.reps} reps`,
                          ex.rest && `repos ${ex.rest}`,
                        ].filter(Boolean).join(' - ')}
                      </p>
                      {ex.notes && <p className="text-xs text-slate-500 mt-1">{ex.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programming info */}
            {(step.frequency || step.when_to_train || step.warmup) && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-1">
                <p className="text-xs text-orange-300 font-medium mb-1">Programmation</p>
                {step.frequency && (
                  <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Frequence :</span> {step.frequency}</p>
                )}
                {step.when_to_train && (
                  <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Quand :</span> {step.when_to_train}</p>
                )}
                {step.warmup && (
                  <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Echauffement :</span> {step.warmup}</p>
                )}
              </div>
            )}

            {/* Coaching tips */}
            {step.coaching_tips && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-300 font-medium mb-1">Conseils</p>
                <p className="text-sm text-blue-200/80">{step.coaching_tips}</p>
              </div>
            )}

            {/* Actions for active step */}
            {isActive && isProgramActive && (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="sm" onClick={onLogSession} className="bg-gradient-to-r from-orange-500 to-rose-500">
                  <Plus className="w-3 h-3 mr-1" />
                  Logger session
                </Button>
                <Button size="sm" variant="outline" onClick={onComplete} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Marquer complete
                </Button>
                <Button size="sm" variant="outline" onClick={onSkip} className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  <FastForward className="w-3 h-3 mr-1" />
                  Passer
                </Button>
              </div>
            )}

            {/* Progress chart */}
            {chartData.length > 1 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Progression</p>
                <div className="bg-white/5 rounded-lg p-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Session logs */}
            {logs.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Historique sessions</p>
                <div className="space-y-2">
                  {logs.map((log) => {
                    const pd = (log.performance_data || {}) as Record<string, unknown>
                    return (
                      <div key={log.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-400">
                            {new Date(log.session_date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-sm text-white">
                            {Object.entries(pd).map(([k, v]) => {
                              if (k === 'reps_achieved') return `${v} reps`
                              if (k === 'time_seconds') return `${v}s`
                              if (k === 'weight_used') return `${v} kg`
                              if (k === 'quality_score') return `${v}/10`
                              return `${v}`
                            }).join(', ')}
                          </span>
                          {log.session_notes && (
                            <span className="text-xs text-slate-500">- {log.session_notes}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteLog(log.id)}
                          className="text-slate-500 hover:text-red-400 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
