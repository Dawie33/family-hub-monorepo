import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SkillProgram } from '@/domain/entities/skill'
import { Loader2 } from 'lucide-react'
import type { LogModalState } from '../_hooks/useSkillDetail'

interface LogSessionModalProps {
  logModal: LogModalState
  setLogModal: (state: LogModalState) => void
  handleSaveLog: () => void
  program: SkillProgram | null
}

export function LogSessionModal({ logModal, setLogModal, handleSaveLog, program }: LogSessionModalProps) {
  const step = logModal.isOpen ? program?.steps?.find(s => s.id === logModal.stepId) : null
  const vc = step?.validation_criteria

  const valueLabel = vc?.description || (() => {
    if (vc?.type === 'reps') return 'Repetitions realisees'
    if (vc?.type === 'time') return 'Duree (secondes)'
    if (vc?.type === 'weight') return 'Charge (kg)'
    return 'Score qualite (1-10)'
  })()
  const valuePlaceholder = vc?.target ? `Objectif : ${vc.target} ${vc.unit || ''}`.trim() : 'Entrez la valeur'

  return (
    <Dialog open={logModal.isOpen} onOpenChange={(open) => !open && setLogModal({ isOpen: false })}>
      <DialogContent className="bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Logger une session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Date</Label>
            <Input
              type="date"
              value={logModal.isOpen ? logModal.data.date : ''}
              onChange={(e) => setLogModal(logModal.isOpen ? { ...logModal, data: { ...logModal.data, date: e.target.value } } : logModal)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">{valueLabel}</Label>
            <Input
              type="number"
              value={logModal.isOpen ? logModal.data.value : ''}
              onChange={(e) => setLogModal(logModal.isOpen ? { ...logModal, data: { ...logModal.data, value: e.target.value } } : logModal)}
              placeholder={valuePlaceholder}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Notes (optionnel)</Label>
            <Textarea
              value={logModal.isOpen ? logModal.data.notes : ''}
              onChange={(e) => setLogModal(logModal.isOpen ? { ...logModal, data: { ...logModal.data, notes: e.target.value } } : logModal)}
              placeholder="Comment s'est passee la session..."
              className="bg-white/5 border-white/10 text-white min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSaveLog}
            disabled={!logModal.isOpen || logModal.saving || !logModal.data.value}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500"
          >
            {logModal.isOpen && logModal.saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
