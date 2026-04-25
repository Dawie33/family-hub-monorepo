import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RichSectionDisplay } from '@/components/workout/display/RichSectionDisplay'
import type { Equipment } from '@/domain/entities/equipment'
import type { SkillProgram } from '@/domain/entities/skill'
import { CheckCircle, Dumbbell, Loader2, Save } from 'lucide-react'
import type { WodModalState } from '../_hooks/useSkillDetail'

interface WodGenerationModalProps {
  wodModal: WodModalState
  setWodModal: (state: WodModalState) => void
  program: SkillProgram | null
  wodIncludeWarmup: boolean
  setWodIncludeWarmup: (v: boolean) => void
  boxMode: boolean
  setBoxMode: (v: boolean) => void
  allEquipments: Equipment[]
  wodSelectedEquipment: string[]
  setWodSelectedEquipment: (v: string[]) => void
  userProfileEquipment: string[]
  onGenerate: () => void
  onSave: () => void
}

export function WodGenerationModal({
  wodModal,
  setWodModal,
  program,
  wodIncludeWarmup,
  setWodIncludeWarmup,
  boxMode,
  setBoxMode,
  allEquipments,
  setWodSelectedEquipment,
  userProfileEquipment,
  onGenerate,
  onSave,
}: WodGenerationModalProps) {
  return (
    <Dialog open={wodModal.isOpen} onOpenChange={(open) => !open && setWodModal({ isOpen: false })}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-400" />
            Séance Progression + WOD
          </DialogTitle>
        </DialogHeader>

        {/* Skill context banner */}
        {program && wodModal.isOpen && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-300 font-medium">{program.skill_name}</span>
              <span className="text-slate-500">—</span>
              <span className="text-orange-200/80">{wodModal.stepContext.title}</span>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Progression : {wodModal.stepContext.recommended_exercises?.length ?? 0} exercice(s)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                WOD de mise en pratique
              </span>
            </div>
          </div>
        )}

        {/* Generating state */}
        {wodModal.isOpen && wodModal.generating ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-slate-400 text-sm">Génération de la séance en cours...</p>
            <p className="text-slate-500 text-xs">Progression + WOD de mise en pratique</p>
          </div>

          /* Generated preview */
        ) : wodModal.isOpen && wodModal.generated ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">{wodModal.generated.name}</h3>
              {wodModal.generated.description && (
                <p className="text-slate-400 text-sm mt-1">{wodModal.generated.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-orange-500/20 text-orange-300">
                {wodModal.generated.workout_type?.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-slate-500/20 text-slate-300">{wodModal.generated.difficulty}</Badge>
              <Badge className="bg-slate-500/20 text-slate-300">{wodModal.generated.estimated_duration} min</Badge>
              <Badge className="bg-slate-500/20 text-slate-300">{wodModal.generated.intensity}</Badge>
            </div>

            {wodModal.generated.blocks?.sections && (
              <div className="space-y-4">
                {wodModal.generated.blocks.sections.map((section, idx) => (
                  <RichSectionDisplay key={idx} section={section} />
                ))}
              </div>
            )}

            {wodModal.generated.coach_notes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-300 font-medium mb-1">Notes du coach</p>
                <p className="text-sm text-blue-200/80">{wodModal.generated.coach_notes}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setWodModal(wodModal.isOpen ? { ...wodModal, generated: null } : wodModal)}
                variant="outline"
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
              >
                Regenerer
              </Button>
              <Button
                onClick={onSave}
                disabled={wodModal.isOpen && wodModal.saving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {wodModal.isOpen && wodModal.saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Sauvegarder</>
                )}
              </Button>
            </div>
          </div>

          /* Config phase */
        ) : (
          <div className="space-y-4">
            {/* Structure info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-slate-300">Structure générée</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="font-medium text-blue-300">Progression</span>
                  <span>— exercices de l&apos;étape, 20-25 min, sets/reps/repos détaillés</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="font-medium text-orange-300">WOD</span>
                  <span>— mise en pratique du skill, 12-20 min, haute intensité</span>
                </div>
              </div>
            </div>

            {/* Warmup toggle */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setWodIncludeWarmup(!wodIncludeWarmup)}
                className={`w-full text-left rounded-lg p-3 border transition-all ${wodIncludeWarmup ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Inclure l&apos;échauffement</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(wodModal.isOpen ? wodModal.stepContext.warmup : null) || `Échauffement spécifique ${program?.skill_name || 'skill'}`}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${wodIncludeWarmup ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                    }`}>
                    {wodIncludeWarmup && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Equipment selection */}
            <div className="space-y-2">
              <Label className="text-white">Lieu d&apos;entrainement</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setBoxMode(false); setWodSelectedEquipment(userProfileEquipment) }}
                  className={`text-left rounded-lg p-3 border transition-all ${!boxMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Mon equipement</p>
                      <p className="text-xs text-slate-400 mt-0.5">{userProfileEquipment.length} piece(s)</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${!boxMode ? 'bg-orange-500 border-orange-500' : 'border-slate-500'}`} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setBoxMode(true); setWodSelectedEquipment(allEquipments.map(e => e.slug)) }}
                  className={`text-left rounded-lg p-3 border transition-all ${boxMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Box CrossFit</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tout l&apos;equipement</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${boxMode ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`} />
                  </div>
                </button>
              </div>
            </div>

            <Button
              onClick={onGenerate}
              disabled={wodModal.isOpen && wodModal.generating}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Générer la séance
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
