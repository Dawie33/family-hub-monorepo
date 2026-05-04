'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import {
  BLOCK_TYPE_COLORS,
  BLOCK_TYPE_LABELS,
  GeneratedStrengthSession,
  GenerateStrengthDto,
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  MuscleGroup,
  SESSION_GOAL_LABELS,
  SessionGoal,
  strengthService,
} from '@/services/strength'
import { usersService } from '@/services/users'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, Dumbbell, Home, Loader2, RotateCcw, Save, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const GOALS: { value: SessionGoal; description: string; reps: string }[] = [
  { value: 'strength', description: 'Charges lourdes, faibles reps', reps: '3-6 reps · RPE 8-9' },
  { value: 'hypertrophy', description: 'Volume et tension', reps: '8-12 reps · RPE 7-8' },
  { value: 'endurance', description: 'Résistance musculaire', reps: '15-20+ reps · RPE 6-7' },
  { value: 'power', description: 'Mouvements explosifs', reps: '3-5 reps · RPE 7-8' },
]

const GOAL_COLORS: Record<SessionGoal, string> = {
  strength: 'border-red-500/40 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500',
  hypertrophy: 'border-purple-500/40 data-[active=true]:bg-purple-500/20 data-[active=true]:border-purple-500',
  endurance: 'border-green-500/40 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-500',
  power: 'border-yellow-500/40 data-[active=true]:bg-yellow-500/20 data-[active=true]:border-yellow-500',
}

export default function GenerateStrengthPage() {
  const router = useRouter()
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([])
  const [sessionGoal, setSessionGoal] = useState<SessionGoal>('hypertrophy')
  const [equipmentMode, setEquipmentMode] = useState<'saved' | 'bodyweight'>('saved')
  const [savedEquipment, setSavedEquipment] = useState<string[]>([])
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [additionalContext, setAdditionalContext] = useState('')
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<GeneratedStrengthSession | null>(null)
  const [lastParams, setLastParams] = useState<GenerateStrengthDto | null>(null)

  useEffect(() => {
    setLoadingProfile(true)
    usersService.getUserProfile()
      .then((user) => setSavedEquipment(user.equipment_available ?? []))
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [])

  const toggleMuscle = (m: MuscleGroup) =>
    setSelectedMuscles((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])

  const buildParams = (): GenerateStrengthDto => ({
    targetMuscles: selectedMuscles,
    sessionGoal,
    availableEquipment: equipmentMode === 'bodyweight' ? [] : savedEquipment,
    additionalContext: additionalContext || undefined,
    targetDurationMinutes,
  })

  const handleGenerate = async () => {
    if (selectedMuscles.length === 0) {
      toast.error('Sélectionne au moins un groupe musculaire')
      return
    }
    const params = buildParams()
    try {
      setLoading(true)
      setPlan(null)
      setLastParams(params)
      const generatedPlan = await strengthService.generatePreview(params)
      setPlan(generatedPlan)
    } catch { toast.error('Erreur lors de la génération') } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!plan || !lastParams) return
    try {
      setSaving(true)
      await strengthService.generateAndSave({ ...lastParams, existingPlan: plan })
      toast.success('Séance sauvegardée !')
      router.push('/strength')
    } catch { toast.error('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Link href="/strength" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Générer une séance Force
              </span>
            </h1>
            <p className="text-sm text-slate-400">L'IA adapte la séance à ton matériel et inclut des mouvements de rotation</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <motion.div variants={fadeInUp} className="space-y-5">
            {/* Groupes musculaires */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Groupes musculaires ciblés
                {selectedMuscles.length > 0 && (
                  <span className="ml-2 text-violet-400 font-normal">({selectedMuscles.length} sélectionnés)</span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MUSCLE_GROUPS.map((muscle) => (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(muscle)}
                    data-active={selectedMuscles.includes(muscle)}
                    className="text-left p-3 rounded-xl border bg-white/5 border-white/10 transition-all data-[active=true]:bg-violet-500/20 data-[active=true]:border-violet-500 hover:border-white/20"
                  >
                    <p className="font-semibold text-sm text-white">{MUSCLE_LABELS[muscle]}</p>
                    {selectedMuscles.includes(muscle) && (
                      <CheckCircle2 className="w-3 h-3 text-violet-400 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Objectif */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Objectif</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(({ value, description, reps }) => (
                  <button
                    key={value}
                    data-active={sessionGoal === value}
                    onClick={() => setSessionGoal(value)}
                    className={`text-left p-3 rounded-xl border bg-white/5 transition-all ${GOAL_COLORS[value]}`}
                  >
                    <p className="font-semibold text-sm text-white">{SESSION_GOAL_LABELS[value]}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{reps}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Durée cible */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />Durée cible
                {targetDurationMinutes === undefined && (
                  <span className="ml-1 text-slate-500 font-normal text-xs">(libre)</span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[undefined, 30, 45, 60, 75, 90].map((duration) => (
                  <button
                    key={duration ?? 'libre'}
                    onClick={() => setTargetDurationMinutes(duration)}
                    data-active={targetDurationMinutes === duration}
                    className="text-center p-2.5 rounded-xl border bg-white/5 border-white/10 transition-all data-[active=true]:bg-violet-500/20 data-[active=true]:border-violet-500 hover:border-white/20"
                  >
                    <p className="font-semibold text-sm text-white">
                      {duration === undefined ? 'Libre' : `${duration} min`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Équipement */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-slate-400" />Équipement disponible
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setEquipmentMode('saved')}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    equipmentMode === 'saved'
                      ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Home className="w-3.5 h-3.5" />
                    <p className="font-semibold text-sm">Mon équipement</p>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-70">Profil utilisateur</p>
                </button>
                <button
                  onClick={() => setEquipmentMode('bodyweight')}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    equipmentMode === 'bodyweight'
                      ? 'bg-slate-500/20 border-slate-400 text-slate-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    <p className="font-semibold text-sm">Poids du corps</p>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-70">Aucun équipement</p>
                </button>
              </div>

              {equipmentMode === 'saved' && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  {loadingProfile ? (
                    <p className="text-xs text-slate-500">Chargement...</p>
                  ) : savedEquipment.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {savedEquipment.map((e) => (
                        <span key={e} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          <CheckCircle2 className="w-3 h-3" />{e}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400">Aucun équipement enregistré → poids du corps.</p>
                      <Link href="/profile" className="text-xs text-violet-400 hover:underline mt-1 inline-block">
                        Configurer mon équipement →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Contexte */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Contexte / instructions (optionnel)
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={2}
                placeholder="ex : j'ai mal au coude gauche, éviter les extensions triceps..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selectedMuscles.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 rounded-xl hover:from-violet-500/30 hover:to-purple-500/30 transition-all font-semibold disabled:opacity-50"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
                : <><Sparkles className="w-4 h-4" /> Générer la séance</>
              }
            </button>
          </motion.div>

          {/* Résultat */}
          <motion.div variants={fadeInUp}>
            {plan ? (
              <div className="space-y-4">
                {/* Infos générales */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.session_name}</h3>
                  {plan.coaching_notes && (
                    <p className="text-sm text-slate-400 mb-3 italic">{plan.coaching_notes}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span>~{plan.estimated_duration_minutes} min</span>
                  </div>
                </div>

                {/* Échauffement */}
                <div className="bg-white/5 border border-green-500/20 border-l-4 border-l-green-500 rounded-r-xl p-3">
                  <p className="text-xs font-semibold text-green-400 mb-1">Échauffement — {plan.warmup.duration}</p>
                  {plan.warmup.exercises.map((ex, i) => (
                    <p key={i} className="text-xs text-slate-400">
                      <span className="text-white">{ex.name}</span> — {ex.duration_or_reps}
                      {ex.notes && <span className="text-slate-500"> · {ex.notes}</span>}
                    </p>
                  ))}
                </div>

                {/* Blocs */}
                <div className="space-y-2">
                  {plan.blocks.map((block, i) => (
                    <div
                      key={i}
                      className={`border-l-4 pl-3 py-2 rounded-r-xl bg-white/5 ${BLOCK_TYPE_COLORS[block.block_type] ?? 'border-l-white/20'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {block.block_type === 'rotation' && <RotateCcw className="w-3 h-3 text-cyan-400 shrink-0" />}
                        <span className="font-semibold text-sm text-white">{block.block_name}</span>
                        <span className="text-[10px] text-slate-500">— {BLOCK_TYPE_LABELS[block.block_type]}</span>
                      </div>
                      {block.exercises.map((ex, j) => (
                        <div key={j} className="mb-1">
                          <p className="text-xs text-slate-400">
                            <span className="text-white">{ex.name}</span>
                            {ex.equipment && <span className="text-slate-500"> ({ex.equipment})</span>}
                            {' '}— {ex.sets}×{ex.reps}
                            {ex.rest && <span className="text-slate-500"> · repos {ex.rest}</span>}
                            {ex.intensity && <span className="text-violet-400"> · {ex.intensity}</span>}
                          </p>
                          {ex.coaching_notes && (
                            <p className="text-[11px] text-slate-500 ml-2">{ex.coaching_notes}</p>
                          )}
                          {ex.alternatives && ex.alternatives.length > 0 && (
                            <p className="text-[10px] text-slate-600 ml-2">
                              Alt : {ex.alternatives.join(' / ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {plan.cooldown && (
                  <div className="bg-white/5 border border-slate-500/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-400 mb-0.5">Retour au calme</p>
                    <p className="text-xs text-slate-500">{plan.cooldown}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 transition-colors font-semibold text-sm disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</>
                      : <><Save className="w-4 h-4" />Sauvegarder cette séance</>
                    }
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || saving}
                    className="flex items-center gap-1.5 px-4 py-3 text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />Regénérer
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">
                  Sélectionne tes muscles et clique sur<br />
                  <span className="text-violet-400">"Générer la séance"</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-3 max-w-xs">
                  L'IA inclut automatiquement des mouvements de rotation (Pallof press, landmine, bandes…)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
