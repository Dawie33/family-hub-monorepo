'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Equipment } from '@/domain/entities/equipment'
import type { GeneratedSkillProgram } from '@/domain/entities/skill'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { getEquipments } from '@/services/equipments'
import { skillsService } from '@/services/skills'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Save, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function NewSkillContent() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedSkillProgram | null>(null)

  // Equipment
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])

  // Form state
  const [skillName, setSkillName] = useState('')
  const [skillCategory, setSkillCategory] = useState('')
  const [currentCapabilities, setCurrentCapabilities] = useState('')
  const [constraints, setConstraints] = useState('')
  const [userLevel, setUserLevel] = useState('')

  useEffect(() => {
    getEquipments({ limit: 100 }).then(res => setAllEquipments(res.rows)).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!skillName || !skillCategory) {
      toast.error('Veuillez remplir le nom du skill et la categorie')
      return
    }

    try {
      setLoading(true)
      const result = await skillsService.generateWithAI({
        skillName,
        skillCategory,
        currentCapabilities: currentCapabilities || undefined,
        constraints: constraints || undefined,
        userLevel: userLevel || undefined,
        availableEquipment: selectedEquipment.length > 0 ? selectedEquipment : undefined,
      })
      setGeneratedProgram(result)
      setStep(2)
      toast.success('Programme genere avec succes')
    } catch {
      toast.error('Erreur lors de la generation du programme')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedProgram) return

    try {
      setSaving(true)
      await skillsService.create({
        skill_name: generatedProgram.skill_name,
        skill_category: generatedProgram.skill_category,
        description: generatedProgram.description,
        estimated_weeks: generatedProgram.estimated_weeks,
        progression_notes: generatedProgram.progression_notes,
        safety_notes: generatedProgram.safety_notes,
        ai_parameters: { skillName, skillCategory, currentCapabilities, constraints, userLevel },
        steps: generatedProgram.steps.map(s => ({
          step_number: s.step_number,
          title: s.title,
          description: s.description,
          validation_criteria: s.validation_criteria,
          recommended_exercises: s.recommended_exercises,
          coaching_tips: s.coaching_tips,
          estimated_duration_weeks: s.estimated_duration_weeks,
        })),
      })
      toast.success('Programme sauvegarde')
      router.push('/skills')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/skills')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Nouveau programme de progression</h1>
          <p className="text-slate-400 text-sm">Etape {step} sur 2</p>
        </div>
      </motion.div>

      {/* Step indicator */}
      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 1 ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-slate-400'}`}>
          <span className="font-medium">1.</span> Configuration
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 2 ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-slate-400'}`}>
          <span className="font-medium">2.</span> Preview & Sauvegarder
        </div>
      </motion.div>

      {/* Step 1: Form */}
      {step === 1 && (
        <motion.div variants={fadeInUp}>
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Nom du skill *</Label>
              <Input
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Ex: Muscle-Up, Handstand Walk, Pistol Squat..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Categorie *</Label>
              <Select value={skillCategory} onValueChange={setSkillCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choisir une categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gymnastics">Gymnastique</SelectItem>
                  <SelectItem value="olympic_lifting">Halterophilie</SelectItem>
                  <SelectItem value="strength">Force</SelectItem>
                  <SelectItem value="mobility">Mobilite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Niveau actuel</Label>
              <Select value={userLevel} onValueChange={setUserLevel}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Debutant</SelectItem>
                  <SelectItem value="intermediate">Intermediaire</SelectItem>
                  <SelectItem value="advanced">Avance</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Capacites actuelles</Label>
              <Textarea
                value={currentCapabilities}
                onChange={(e) => setCurrentCapabilities(e.target.value)}
                placeholder="Ex: Je peux faire 8 strict pull-ups, je tiens 15s en L-sit..."
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Equipement disponible</Label>
              <p className="text-xs text-slate-500">Selectionnez l&apos;equipement auquel vous avez acces. L&apos;IA n&apos;utilisera que celui-ci.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {allEquipments.map((eq) => {
                  const isSelected = selectedEquipment.includes(eq.label)
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => {
                        setSelectedEquipment(prev =>
                          isSelected ? prev.filter(e => e !== eq.label) : [...prev, eq.label]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        isSelected
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {eq.label}
                    </button>
                  )
                })}
              </div>
              {selectedEquipment.length > 0 && (
                <p className="text-xs text-orange-400 mt-1">{selectedEquipment.length} equipement(s) selectionne(s)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Contraintes / Limitations</Label>
              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Ex: Douleur epaule gauche, pas d'anneaux disponibles..."
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !skillName || !skillCategory}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generation en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generer avec l&apos;IA
                </>
              )}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && generatedProgram && (
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{generatedProgram.skill_name}</h2>
                <p className="text-slate-400 mt-1">{generatedProgram.description}</p>
              </div>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                {generatedProgram.estimated_weeks} semaines
              </Badge>
            </div>

            {generatedProgram.safety_notes && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-300 text-sm font-medium mb-1">Notes de securite</p>
                <p className="text-red-200/80 text-sm">{generatedProgram.safety_notes}</p>
              </div>
            )}

            {generatedProgram.progression_notes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm font-medium mb-1">Notes de progression</p>
                <p className="text-blue-200/80 text-sm">{generatedProgram.progression_notes}</p>
              </div>
            )}
          </Card>

          {/* Steps preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Etapes de progression ({generatedProgram.steps.length})</h3>
            {generatedProgram.steps.map((s) => (
              <Card key={s.step_number} className="bg-white/5 border-white/10 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">{s.step_number}</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-white">{s.title}</h4>
                    <p className="text-slate-400 text-sm">{s.description}</p>

                    {/* Validation criteria */}
                    {s.validation_criteria && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Critere de validation</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-300">{s.validation_criteria.description}</span>
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    {s.recommended_exercises && s.recommended_exercises.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Exercices recommandes</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {s.recommended_exercises.map((ex, i) => (
                            <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
                              <p className="text-sm text-white font-medium">{ex.name}</p>
                              <p className="text-xs text-slate-400">
                                {[
                                  ex.sets && `${ex.sets} series`,
                                  ex.reps && `${ex.reps} reps`,
                                  ex.rest && `repos ${ex.rest}`,
                                ].filter(Boolean).join(' - ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Programming info */}
                    {(s.frequency || s.when_to_train || s.warmup) && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 space-y-1">
                        <p className="text-xs text-orange-300 font-medium mb-1">Programmation</p>
                        {s.frequency && (
                          <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Frequence :</span> {s.frequency}</p>
                        )}
                        {s.when_to_train && (
                          <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Quand :</span> {s.when_to_train}</p>
                        )}
                        {s.warmup && (
                          <p className="text-sm text-orange-200/80"><span className="text-orange-300 font-medium">Echauffement :</span> {s.warmup}</p>
                        )}
                      </div>
                    )}

                    {s.coaching_tips && (
                      <p className="text-xs text-slate-500 italic">{s.coaching_tips}</p>
                    )}

                    {s.estimated_duration_weeks && (
                      <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-slate-400">
                        ~{s.estimated_duration_weeks} semaines
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 text-slate-300 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder le programme
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function NewSkillPage() {
  return     <NewSkillContent />
}
