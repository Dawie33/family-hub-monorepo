'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { trainingProgramsApi, GenerateProgramDto, GeneratedProgram } from '@/services/training-programs'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ChevronUp, Loader2, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

// --- Config ---

const PROGRAM_TYPES = [
  { value: 'strength_building', label: 'Force', description: 'Développer la force et les maxes' },
  { value: 'endurance_base', label: 'Endurance', description: 'Construire la base cardio et aérobie' },
  { value: 'competition_prep', label: 'Compétition', description: 'Préparer une compétition CrossFit' },
  { value: 'off_season', label: 'Off-season', description: 'Développement général hors saison' },
] as const

const DURATIONS = [4, 6, 8, 12] as const
const SESSIONS = [2, 3, 4, 5] as const
const LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
] as const

const FOCUS_COLOR: Record<string, string> = {
  strength: 'bg-red-500/20 text-red-400 border-red-500/30',
  conditioning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  skill: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mixed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  recovery: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const FOCUS_LABEL: Record<string, string> = {
  strength: 'Force', conditioning: 'Cardio', skill: 'Technique', mixed: 'Mixte', recovery: 'Récup',
}

// --- Composant preview d'une session ---

function SessionCard({ session }: { session: GeneratedProgram['phases'][0]['sessions'][0] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${FOCUS_COLOR[session.focus] ?? 'bg-slate-500/20 text-slate-400'}`}>
            {FOCUS_LABEL[session.focus] ?? session.focus}
          </span>
          <span className="text-sm font-medium text-white">{session.title}</span>
          <span className="text-xs text-slate-500">{session.estimated_duration} min</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          {session.strength_work && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Force</p>
              <div className="space-y-1">
                {session.strength_work.movements.map((m, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-sm">
                    <span className="text-white font-medium">{m.name}</span>
                    <span className="text-slate-400">{m.sets}×{m.reps}</span>
                    {m.intensity && <span className="text-slate-500 text-xs">@ {m.intensity}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {session.conditioning && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
                Conditioning — {session.conditioning.type.toUpperCase()}
                {session.conditioning.duration_minutes && ` ${session.conditioning.duration_minutes}min`}
                {session.conditioning.rounds && ` ${session.conditioning.rounds} rounds`}
              </p>
              <div className="space-y-1">
                {session.conditioning.movements.map((m, i) => (
                  <div key={i} className="text-sm text-slate-300">
                    {m.reps && <span>{m.reps} </span>}
                    {m.distance && <span>{m.distance} </span>}
                    <span className="text-white">{m.name}</span>
                    {m.weight && <span className="text-slate-400"> @ {m.weight}</span>}
                  </div>
                ))}
              </div>
              {session.conditioning.scaling_notes && (
                <p className="text-xs text-slate-500 mt-2 italic">{session.conditioning.scaling_notes}</p>
              )}
            </div>
          )}
          {session.skill_work && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Technique</p>
              <p className="text-sm font-medium text-white">{session.skill_work.name}</p>
              <p className="text-xs text-slate-400">{session.skill_work.description}</p>
            </div>
          )}
          {session.coach_notes && (
            <p className="text-xs text-slate-500 italic border-t border-white/10 pt-2">{session.coach_notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// --- Page principale ---

export default function GenerateProgramPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'preview'>('form')

  // Form state
  const [programType, setProgramType] = useState<GenerateProgramDto['program_type']>('strength_building')
  const [duration, setDuration] = useState<GenerateProgramDto['duration_weeks']>(8)
  const [sessions, setSessions] = useState<GenerateProgramDto['sessions_per_week']>(3)
  const [level, setLevel] = useState<GenerateProgramDto['target_level']>('intermediate')
  const [focus, setFocus] = useState('')

  // Preview state
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<GeneratedProgram | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<number>(0)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await trainingProgramsApi.generatePreview({
        program_type: programType,
        duration_weeks: duration,
        sessions_per_week: sessions,
        target_level: level,
        focus: focus || undefined,
      })
      setPreview(result)
      setStep('preview')
    } catch {
      toast.error('Erreur lors de la génération du programme')
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirm = async () => {
    if (!preview) return
    setSaving(true)
    try {
      await trainingProgramsApi.createAndEnroll({
        ...preview,
        program_type: programType,
        duration_weeks: duration,
        sessions_per_week: sessions,
        target_level: level,
      })
      toast.success('Programme créé !')
      router.push('/training-programs')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('actif')) {
        toast.error('Tu as déjà un programme actif. Abandonne-le avant d\'en créer un nouveau.')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <button
            onClick={() => step === 'preview' ? setStep('form') : router.push('/training-programs')}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                {step === 'form' ? 'Créer un programme' : 'Aperçu du programme'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {step === 'form' ? 'Généré par IA, adapté à ton niveau' : 'Vérifie les détails avant de confirmer'}
            </p>
          </div>
        </motion.div>

        {/* Étape 1 : Formulaire */}
        {step === 'form' && (
          <motion.div variants={fadeInUp} className="space-y-6">

            {/* Type de programme */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Objectif</h2>
              <div className="grid grid-cols-2 gap-3">
                {PROGRAM_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setProgramType(pt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      programType === pt.value
                        ? 'bg-orange-500/20 border-orange-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold text-sm">{pt.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{pt.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <label className="text-xs text-slate-400 mb-1 block">Objectif spécifique (optionnel)</label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="ex: 10km dans 6 mois, améliorer mon deadlift..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            {/* Durée + Séances */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Durée</h2>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        duration === d
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {d} sem.
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Séances/sem.</h2>
                <div className="grid grid-cols-2 gap-2">
                  {SESSIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSessions(s)}
                      className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        sessions === s
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Niveau */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Niveau</h2>
              <div className="flex gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      level === l.value
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé + CTA */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
              <div className="text-sm text-slate-400">
                <span className="text-white font-semibold">{duration} semaines</span> · <span className="text-white font-semibold">{sessions}×/sem.</span> · {duration * sessions} séances au total
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Génération...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Générer</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 2 : Preview */}
        {step === 'preview' && preview && (
          <motion.div variants={fadeInUp} className="space-y-5">

            {/* Résumé programme */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{preview.name}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{preview.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">{duration} semaines</span>
                <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">{sessions}×/semaine</span>
                <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">{LEVELS.find(l => l.value === level)?.label}</span>
              </div>
              {preview.objectives && (
                <p className="text-sm text-slate-300 italic">"{preview.objectives}"</p>
              )}
            </div>

            {/* Phases */}
            <div className="space-y-3">
              {preview.phases.map((phase, pi) => (
                <div key={pi} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-white">Phase {phase.phase_number} — {phase.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Semaines {phase.weeks.join(', ')} · {phase.sessions.length} séances/sem.
                      </p>
                    </div>
                    {expandedPhase === pi
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {expandedPhase === pi && (
                    <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
                      <p className="text-sm text-slate-400">{phase.description}</p>
                      {phase.sessions.map((session, si) => (
                        <SessionCard key={si} session={session} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Régénérer ou confirmer */}
            <div className="flex gap-3 pb-8">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3.5 border border-slate-700/50 bg-slate-800/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 transition-colors"
              >
                Modifier les paramètres
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" />Démarrer ce programme</>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}
