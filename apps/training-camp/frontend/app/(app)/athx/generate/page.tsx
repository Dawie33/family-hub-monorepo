'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { athxService, ATHX_SESSION_TYPE_LABELS, AthxSessionType, GeneratedAthxPlan } from '@/services/athx'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, CheckCircle, Dumbbell, Loader2, Sparkles, Timer } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Durées de référence de la compétition ATHX par zone
const ZONE_DURATIONS: Record<AthxSessionType, number> = {
  strength_prep: 20,
  endurance_prep: 30,
  metcon_prep: 30,
  full_competition: 150,
  mixed: 60,
}
const WARMUP_COOLDOWN_MINUTES = 15 // toujours inclus

function calcSuggestedDuration(zones: AthxSessionType[], isFullComp: boolean): number {
  if (isFullComp) return 150
  const zoneTime = zones.reduce((sum, z) => sum + (ZONE_DURATIONS[z] ?? 30), 0)
  return Math.min(WARMUP_COOLDOWN_MINUTES + zoneTime, 150)
}

// Zones combinables (la compétition complète est exclusive)
const COMBINABLE_ZONES: { value: AthxSessionType; description: string; color: string; activeColor: string }[] = [
  {
    value: 'strength_prep',
    description: 'Force, haltérophilie, charges lourdes',
    color: 'border-red-500/30 text-slate-300 hover:border-red-500/50',
    activeColor: 'border-red-500 bg-red-500/20 text-white',
  },
  {
    value: 'endurance_prep',
    description: 'Cardio soutenu, lactique, zone 4',
    color: 'border-blue-500/30 text-slate-300 hover:border-blue-500/50',
    activeColor: 'border-blue-500 bg-blue-500/20 text-white',
  },
  {
    value: 'metcon_prep',
    description: 'Fitness fonctionnel, mouvements variés',
    color: 'border-orange-500/30 text-slate-300 hover:border-orange-500/50',
    activeColor: 'border-orange-500 bg-orange-500/20 text-white',
  },
]

const EQUIPMENT_PRESETS: { label: string; description: string; items: string[] | null }[] = [
  { label: 'Pas de filtre', description: 'L\'IA adapte librement', items: null },
  {
    label: 'Maison',
    description: 'Poids du corps, haltères, kettlebell, barre de traction',
    items: ['bodyweight', 'dumbbell', 'kettlebell', 'pull-up-bar', 'jump-rope', 'mat'],
  },
  {
    label: 'Box ATHX',
    description: 'Barre, disques, rack, cardio complet, anneaux',
    items: ['barbell', 'plates', 'rack', 'bench', 'dumbbell', 'kettlebell', 'pull-up-bar', 'jump-rope', 'rings', 'wall-ball', 'rower', 'assault-bike', 'ski-erg', 'box'],
  },
]

const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  warmup: { bg: 'bg-green-500/5', text: 'text-green-400', border: 'border-l-green-500' },
  strength: { bg: 'bg-red-500/5', text: 'text-red-400', border: 'border-l-red-500' },
  endurance: { bg: 'bg-blue-500/5', text: 'text-blue-400', border: 'border-l-blue-500' },
  metcon: { bg: 'bg-orange-500/5', text: 'text-orange-400', border: 'border-l-orange-500' },
  cooldown: { bg: 'bg-slate-500/5', text: 'text-slate-400', border: 'border-l-slate-500' },
}

export default function GenerateAthxPage() {
  const router = useRouter()
  const [selectedZones, setSelectedZones] = useState<AthxSessionType[]>(['metcon_prep'])
  const [fullCompetition, setFullCompetition] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(() => calcSuggestedDuration(['metcon_prep'], false))
  const [durationManuallyChanged, setDurationManuallyChanged] = useState(false)
  const [competitionDate, setCompetitionDate] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [equipmentPreset, setEquipmentPreset] = useState<number>(0) // index dans EQUIPMENT_PRESETS
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<GeneratedAthxPlan | null>(null)

  const toggleZone = (zone: AthxSessionType) => {
    if (fullCompetition) {
      setFullCompetition(false)
      setSelectedZones([zone])
      setDurationManuallyChanged(false)
      return
    }
    setSelectedZones((prev) => {
      const next = prev.includes(zone)
        ? prev.length > 1 ? prev.filter((z) => z !== zone) : prev
        : [...prev, zone]
      if (!durationManuallyChanged) setDurationMinutes(calcSuggestedDuration(next, false))
      return next
    })
  }

  const toggleFullCompetition = () => {
    setFullCompetition(true)
    setSelectedZones([])
    if (!durationManuallyChanged) setDurationMinutes(150)
  }

  // Recalcule la suggestion si la durée n'a pas été changée manuellement
  useEffect(() => {
    if (!durationManuallyChanged) {
      setDurationMinutes(calcSuggestedDuration(selectedZones, fullCompetition))
    }
  }, [selectedZones, fullCompetition, durationManuallyChanged])

  // Dériver session_type et target_zones depuis la sélection
  const sessionType: AthxSessionType = fullCompetition
    ? 'full_competition'
    : selectedZones.length === 1
      ? selectedZones[0]
      : 'mixed'

  const targetZones = selectedZones.length > 1
    ? selectedZones.map((z) => ATHX_SESSION_TYPE_LABELS[z]).join(', ')
    : undefined

  const selectedEquipment = EQUIPMENT_PRESETS[equipmentPreset].items

  const buildParams = () => ({
    session_type: sessionType,
    duration_minutes: durationMinutes,
    target_zones: targetZones,
    competition_date: competitionDate || undefined,
    additional_instructions: additionalInstructions || undefined,
    equipment_available: selectedEquipment ?? undefined,
  })

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const result = await athxService.generatePreview(buildParams())
      setPlan(result)
    } catch { toast.error('Erreur lors de la génération') } finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await athxService.generateAndSave(buildParams())
      toast.success('Séance sauvegardée !')
      router.push('/athx')
    } catch { toast.error('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Link href="/athx" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold"><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Générer une séance ATHX</span></h1>
            <p className="text-sm text-slate-400">Sélectionne une ou plusieurs zones à travailler</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <motion.div variants={fadeInUp} className="space-y-5">

            {/* Zones combinables */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Zones à travailler
                {selectedZones.length > 1 && (
                  <span className="ml-2 text-xs font-normal text-purple-400">— Multi-zones</span>
                )}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {COMBINABLE_ZONES.map(({ value, description, color, activeColor }) => {
                  const isActive = !fullCompetition && selectedZones.includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => toggleZone(value)}
                      className={`text-left p-3 rounded-xl border bg-white/5 transition-all ${isActive ? activeColor : color}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{ATHX_SESSION_TYPE_LABELS[value]}</p>
                        {isActive && <span className="w-2 h-2 rounded-full bg-current opacity-80" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Compétition complète — exclusive */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Ou</label>
              <button
                onClick={toggleFullCompetition}
                className={`w-full text-left p-3 rounded-xl border bg-white/5 transition-all ${
                  fullCompetition
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-purple-500/30 text-slate-300 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{ATHX_SESSION_TYPE_LABELS['full_competition']}</p>
                  {fullCompetition && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Simulation 2h30 toutes zones enchaînées</p>
              </button>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                Durée —{' '}
                <span className="text-purple-400">{durationMinutes} min</span>
                {!durationManuallyChanged && (
                  <span className="text-xs font-normal text-slate-500">(suggérée selon les zones)</span>
                )}
                {durationManuallyChanged && (
                  <button
                    onClick={() => {
                      setDurationManuallyChanged(false)
                      setDurationMinutes(calcSuggestedDuration(selectedZones, fullCompetition))
                    }}
                    className="text-xs font-normal text-purple-400 hover:text-purple-300 underline"
                  >
                    Réinitialiser
                  </button>
                )}
              </label>
              <input
                type="range" min={20} max={150} step={5} value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value))
                  setDurationManuallyChanged(true)
                }}
                className="w-full accent-purple-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>20 min</span><span>1h15</span><span>2h30</span></div>
            </div>

            {/* Date compétition */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Date de compétition (optionnel)</label>
              <input type="text" value={competitionDate} onChange={(e) => setCompetitionDate(e.target.value)}
                placeholder="ex : dans 6 semaines"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500" />
            </div>

            {/* Équipement */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Lieu d'entraînement</label>
              <div className="grid grid-cols-1 gap-2">
                {EQUIPMENT_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setEquipmentPreset(i)}
                    className={`text-left p-3 rounded-xl border bg-white/5 transition-all ${
                      equipmentPreset === i
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-purple-500/20 text-slate-300 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{preset.label}</p>
                      {equipmentPreset === i && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Instructions (optionnel)</label>
              <textarea value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={2} placeholder="ex : je veux travailler les faiblesses en endurance..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none" />
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all font-semibold disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Sparkles className="w-4 h-4" /> Générer la séance</>}
            </button>
          </motion.div>

          {/* Résultat */}
          <motion.div variants={fadeInUp}>
            {plan ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{plan.description}</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-300"><Timer className="w-4 h-4 text-purple-400" /><span>{plan.duration_minutes} min</span></div>
                    <div className="flex items-center gap-1.5 text-slate-300"><Dumbbell className="w-4 h-4 text-red-400" /><span className="capitalize">{plan.difficulty}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.blocks.map((block, i) => {
                    const colors = ZONE_COLORS[block.zone] || ZONE_COLORS.cooldown
                    return (
                      <div key={i} className={`border-l-4 rounded-r-xl p-3 ${colors.border} ${colors.bg}`}>
                        <div className="flex justify-between mb-1">
                          <span className={`font-semibold text-sm ${colors.text}`}>{block.label}</span>
                          <span className="text-xs text-slate-400">{block.duration_minutes} min</span>
                        </div>
                        <div className="space-y-1">
                          {block.exercises.slice(0, 3).map((ex, j) => (
                            <p key={j} className="text-xs text-slate-400">
                              <span className="text-white">{ex.name}</span>
                              {ex.sets && ex.reps && ` — ${ex.sets}×${ex.reps}`}
                              {ex.duration && ` — ${ex.duration}`}
                            </p>
                          ))}
                          {block.exercises.length > 3 && <p className="text-xs text-slate-500">+{block.exercises.length - 3} exercices...</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1"><BookOpen className="w-3.5 h-3.5 text-yellow-400" /><span className="text-xs font-semibold text-slate-300">Conseils</span></div>
                    <p className="text-xs text-slate-400">{plan.coaching_tips}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1"><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-xs font-semibold text-slate-300">Compétition</span></div>
                    <p className="text-xs text-slate-400">{plan.competition_notes}</p>
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors font-semibold disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder cette séance'}
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Sélectionne tes zones et clique sur<br /><span className="text-purple-400">"Générer la séance"</span></p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
