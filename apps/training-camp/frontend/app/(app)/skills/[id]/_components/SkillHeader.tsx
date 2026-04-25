import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SkillProgram } from '@/domain/entities/skill'
import { Pause, Play, Trash2, XCircle } from 'lucide-react'

const programStatusLabels: Record<string, string> = {
  active: 'Actif',
  completed: 'Termine',
  paused: 'En pause',
  abandoned: 'Abandonne',
}

interface SkillHeaderProps {
  program: SkillProgram
  progress: number
  onPauseResume: () => void
  onAbandon: () => void
  onDelete: () => void
}

export function SkillHeader({ program, progress, onPauseResume, onAbandon, onDelete }: SkillHeaderProps) {
  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{program.skill_name}</h1>
          <p className="text-slate-400 mt-1">{program.description}</p>
        </div>
        <Badge className={program.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
          {programStatusLabels[program.status]}
        </Badge>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">
            {program.steps?.filter(s => s.status === 'completed' || s.status === 'skipped').length || 0} / {program.steps?.length || 0} etapes
          </span>
          <span className="text-orange-400 font-medium">{progress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        {program.status !== 'completed' && program.status !== 'abandoned' && (
          <>
            <Button variant="outline" onClick={onPauseResume} className="border-white/10 text-slate-300 hover:bg-white/5">
              {program.status === 'paused' ? (
                <><Play className="w-4 h-4 mr-2" /> Reprendre</>
              ) : (
                <><Pause className="w-4 h-4 mr-2" /> Pause</>
              )}
            </Button>
            <Button variant="outline" onClick={onAbandon} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <XCircle className="w-4 h-4 mr-2" /> Abandonner
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onDelete} className="ml-auto border-red-500/30 text-red-400 hover:bg-red-500/10">
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
        </Button>
      </div>
    </Card>
  )
}
