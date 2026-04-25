'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { RUN_TYPE_LABELS, RunType } from '@/services/running'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { RunPlanPreview } from './_components/RunPlanPreview'
import { useGenerateRunning } from './_hooks/useGenerateRunning'

const RUN_TYPES: { value: RunType; description: string; color: string }[] = [
  { value: 'easy', description: 'Zone 1-2, conversation possible', color: 'border-green-500/40 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-500' },
  { value: 'tempo', description: 'Allure seuil, inconfortable mais tenu', color: 'border-orange-500/40 data-[active=true]:bg-orange-500/20 data-[active=true]:border-orange-500' },
  { value: 'intervals', description: 'Fractionné haute intensité zone 4-5', color: 'border-red-500/40 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500' },
  { value: 'long_run', description: 'Endurance fondamentale, zone 2', color: 'border-blue-500/40 data-[active=true]:bg-blue-500/20 data-[active=true]:border-blue-500' },
  { value: 'fartlek', description: 'Variations libres d\'allure, ludique', color: 'border-purple-500/40 data-[active=true]:bg-purple-500/20 data-[active=true]:border-purple-500' },
  { value: 'recovery', description: 'Zone 1, très facile, régénérateur', color: 'border-slate-500/40 data-[active=true]:bg-slate-500/20 data-[active=true]:border-slate-500' },
]

export default function GenerateRunningPage() {
  const {
    runType, setRunType,
    durationMinutes, setDurationMinutes,
    targetDistanceKm, setTargetDistanceKm,
    goal, setGoal,
    additionalInstructions, setAdditionalInstructions,
    loading,
    saving,
    generatedPlan,
    handleGenerate,
    handleSave,
  } = useGenerateRunning()

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Link href="/running" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Générer une séance running
              </span>
            </h1>
            <p className="text-sm text-slate-400">L'IA crée un plan adapté à ton niveau et tes objectifs</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <motion.div variants={fadeInUp} className="space-y-5">
            {/* Type de sortie */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Type de séance</label>
              <div className="grid grid-cols-2 gap-2">
                {RUN_TYPES.map(({ value, description, color }) => (
                  <button
                    key={value}
                    data-active={runType === value}
                    onClick={() => setRunType(value)}
                    className={`text-left p-3 rounded-xl border bg-white/5 transition-all ${color}`}
                  >
                    <p className="font-semibold text-sm text-white">{RUN_TYPE_LABELS[value]}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Durée cible — <span className="text-cyan-400">{durationMinutes} min</span>
              </label>
              <input
                type="range"
                min={15}
                max={180}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15 min</span><span>1h30</span><span>3h</span>
              </div>
            </div>

            {/* Distance optionnelle */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Distance cible (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={targetDistanceKm ?? ''}
                  onChange={(e) => setTargetDistanceKm(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="ex : 10"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 text-sm">km</span>
              </div>
            </div>

            {/* Objectif */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Objectif (optionnel)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="ex : préparer un 10K, améliorer endurance..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Instructions supplémentaires */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Instructions supplémentaires (optionnel)
              </label>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={3}
                placeholder="ex : j'ai couru 15km dimanche, séance légère aujourd'hui..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Générer la séance</>
              )}
            </button>
          </motion.div>

          {/* Résultat */}
          <motion.div variants={fadeInUp}>
            {generatedPlan ? (
              <RunPlanPreview plan={generatedPlan} onSave={handleSave} saving={saving} />
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">
                  Remplis le formulaire et clique sur<br />
                  <span className="text-cyan-400">"Générer la séance"</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
