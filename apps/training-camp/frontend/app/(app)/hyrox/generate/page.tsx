'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { GeneratedHyroxPlan, GenerateHyroxDto, hyroxService, HYROX_SESSION_TYPE_LABELS, HYROX_STATION_LABELS, HYROX_STATIONS, HyroxSessionType, HyroxStation } from '@/services/hyrox'
import { usersService } from '@/services/users'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, Target, Timer, Trophy, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const SESSION_TYPES: { value: HyroxSessionType; description: string; color: string }[] = [
  { value: 'full_simulation', description: '8× (1km + station), volumes réduits', color: 'border-yellow-500/40 data-[active=true]:bg-yellow-500/20 data-[active=true]:border-yellow-500' },
  { value: 'station_prep', description: 'Travail ciblé sur les stations', color: 'border-red-500/40 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500' },
  { value: 'run_prep', description: 'Course entre stations, pacing', color: 'border-cyan-500/40 data-[active=true]:bg-cyan-500/20 data-[active=true]:border-cyan-500' },
  { value: 'mixed', description: 'Mix run + stations', color: 'border-orange-500/40 data-[active=true]:bg-orange-500/20 data-[active=true]:border-orange-500' },
]

const BLOCK_COLORS: Record<string, string> = {
  warmup: 'border-l-green-500', run_work: 'border-l-cyan-500',
  station_work: 'border-l-yellow-500', mixed: 'border-l-orange-500', cooldown: 'border-l-slate-500',
}

export default function GenerateHyroxPage() {
  const router = useRouter()
  const [sessionType, setSessionType] = useState<HyroxSessionType>('station_prep')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [equipmentMode, setEquipmentMode] = useState<'official' | 'saved'>('official')
  const [savedEquipment, setSavedEquipment] = useState<string[]>([])
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [selectedStations, setSelectedStations] = useState<HyroxStation[]>([])
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<GeneratedHyroxPlan | null>(null)

  useEffect(() => {
    setLoadingProfile(true)
    usersService.getUserProfile()
      .then((user) => setSavedEquipment(user.equipment_available ?? []))
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [])

  const toggleStation = (s: HyroxStation) =>
    setSelectedStations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const buildParams = (): GenerateHyroxDto => ({
    session_type: sessionType,
    duration_minutes: durationMinutes,
    equipment_mode: equipmentMode,
    stations_to_work: selectedStations.length ? selectedStations : undefined,
    additional_instructions: additionalInstructions || undefined,
  })

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setPlan(await hyroxService.generatePreview(buildParams()))
    } catch { toast.error('Erreur lors de la génération') } finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await hyroxService.generateAndSave(buildParams())
      toast.success('Séance sauvegardée !')
      router.push('/hyrox')
    } catch { toast.error('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Link href="/hyrox" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold"><span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Générer une séance HYROX</span></h1>
            <p className="text-sm text-slate-400">L'IA adapte la séance à ton équipement et propose des alternatives</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={fadeInUp} className="space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Type de séance</label>
              <div className="grid grid-cols-2 gap-2">
                {SESSION_TYPES.map(({ value, description, color }) => (
                  <button key={value} data-active={sessionType === value} onClick={() => setSessionType(value)}
                    className={`text-left p-3 rounded-xl border bg-white/5 transition-all ${color}`}>
                    <p className="font-semibold text-sm text-white">{HYROX_SESSION_TYPE_LABELS[value]}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Durée — <span className="text-yellow-400">{durationMinutes} min</span>
              </label>
              <input type="range" min={20} max={120} step={5} value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full accent-yellow-400" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>20 min</span><span>1h</span><span>2h</span></div>
            </div>

            {/* Équipement */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-slate-400" />Source d'équipement
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setEquipmentMode('official')}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    equipmentMode === 'official'
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}>
                  <p className="font-semibold text-sm">HYROX officiel</p>
                  <p className="text-[11px] mt-0.5 opacity-70">Tout l'équipement dispo</p>
                </button>
                <button
                  onClick={() => setEquipmentMode('saved')}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    equipmentMode === 'saved'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}>
                  <p className="font-semibold text-sm">Mon équipement</p>
                  <p className="text-[11px] mt-0.5 opacity-70">Alternatives auto</p>
                </button>
              </div>

              {equipmentMode === 'official' && (
                <p className="text-xs text-slate-500">Séance avec tout le matériel HYROX — aucune alternative proposée.</p>
              )}

              {equipmentMode === 'saved' && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  {loadingProfile ? (
                    <p className="text-xs text-slate-500">Chargement...</p>
                  ) : savedEquipment.length > 0 ? (
                    <>
                      <p className="text-xs text-slate-400 mb-2">Équipement enregistré dans ton profil :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {savedEquipment.map((e) => (
                          <span key={e} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            <CheckCircle2 className="w-3 h-3" />{e}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Stations sans équipement → alternatives automatiques proposées.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400">Aucun équipement enregistré dans ton profil.</p>
                      <Link href="/profile" className="text-xs text-yellow-400 hover:underline mt-1 inline-block">Configurer mon équipement →</Link>
                      <p className="text-[11px] text-slate-500 mt-1">En attendant, des alternatives seront proposées pour toutes les stations.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Stations ciblées (pour station_prep) */}
            {sessionType === 'station_prep' && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-400" />Stations à travailler
                </label>
                <div className="flex flex-wrap gap-2">
                  {HYROX_STATIONS.map((station) => (
                    <button key={station} onClick={() => toggleStation(station)}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${selectedStations.includes(station) ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                      {HYROX_STATION_LABELS[station]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Instructions (optionnel)</label>
              <textarea value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={2} placeholder="ex : je veux améliorer mon SkiErg et Wall Balls..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 resize-none" />
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all font-semibold disabled:opacity-50">
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
                    <div className="flex items-center gap-1.5 text-slate-300"><Timer className="w-4 h-4 text-yellow-400" /><span>{plan.duration_minutes} min</span></div>
                    <div className="flex items-center gap-1.5 text-slate-300"><Trophy className="w-4 h-4 text-orange-400" /><span className="capitalize">{plan.difficulty}</span></div>
                  </div>
                </div>

                {/* Blocs */}
                <div className="space-y-2">
                  {plan.blocks.map((block, i) => (
                    <div key={i} className={`border-l-4 rounded-r-xl p-3 bg-white/5 ${BLOCK_COLORS[block.type] || 'border-l-white/20'}`}>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-sm text-white">{block.label}</span>
                        <span className="text-xs text-slate-400">{block.duration_minutes} min</span>
                      </div>
                      {block.target_stations && block.target_stations.length > 0 && (
                        <div className="flex gap-1 mb-1 flex-wrap">
                          {block.target_stations.map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">{HYROX_STATION_LABELS[s as HyroxStation] || s}</span>
                          ))}
                        </div>
                      )}
                      {block.exercises.map((ex, j) => (
                        <div key={j} className="flex items-baseline justify-between gap-2">
                          <p className="text-xs text-slate-400 min-w-0">
                            <span className="text-white">{ex.name}</span>
                            {ex.distance && <span className="text-yellow-400"> {ex.distance}</span>}
                            {ex.sets && ex.reps && ` — ${ex.sets}×${ex.reps}`}
                            {ex.alternative && <span className="text-slate-500"> (alt: {ex.alternative})</span>}
                          </p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">{ex.estimated_minutes} min</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Notes équipement */}
                {plan.equipment_notes && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1"><Wrench className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-semibold text-slate-300">Équipement & alternatives</span></div>
                    <p className="text-xs text-slate-400">{plan.equipment_notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-300 mb-1">Conseils</p>
                    <p className="text-xs text-slate-400">{plan.coaching_tips}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-1"><Trophy className="w-3 h-3 text-yellow-400" /><p className="text-xs font-semibold text-slate-300">Stratégie course</p></div>
                    <p className="text-xs text-slate-400">{plan.race_strategy}</p>
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-colors font-semibold disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder cette séance'}
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Remplis le formulaire et clique sur<br /><span className="text-yellow-400">"Générer la séance"</span></p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
