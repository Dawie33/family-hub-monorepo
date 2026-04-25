'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { AthxBlock, AthxSession, ATHX_SESSION_TYPE_LABELS, athxService } from '@/services/athx'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Dumbbell, Loader2, Save, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  warmup: { bg: 'bg-green-500/5', text: 'text-green-400', border: 'border-l-green-500' },
  strength: { bg: 'bg-red-500/5', text: 'text-red-400', border: 'border-l-red-500' },
  endurance: { bg: 'bg-blue-500/5', text: 'text-blue-400', border: 'border-l-blue-500' },
  metcon: { bg: 'bg-orange-500/5', text: 'text-orange-400', border: 'border-l-orange-500' },
  cooldown: { bg: 'bg-slate-500/5', text: 'text-slate-400', border: 'border-l-slate-500' },
}

function BlockCard({ block }: { block: AthxBlock }) {
  const colors = ZONE_COLORS[block.zone] || ZONE_COLORS.cooldown
  return (
    <div className={`border-l-4 rounded-r-xl p-4 ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`font-bold text-sm ${colors.text}`}>{block.label}</span>
        <span className="text-xs text-slate-400">{block.duration_minutes} min</span>
      </div>
      <div className="space-y-2">
        {block.exercises.map((ex, i) => {
          // Déterminer si reps est une durée (ex: "10min") ou un nombre de répétitions
          const repsIsTime = typeof ex.reps === 'string' && /min|sec|s$/.test(ex.reps)
          return (
            <div key={i} className="bg-white/5 rounded-lg p-2.5">
              <p className="text-sm font-semibold text-white mb-1">{ex.name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                {ex.sets && ex.reps && !repsIsTime && <span>{ex.sets}×{ex.reps}</span>}
                {ex.sets && repsIsTime && <span>{ex.sets} série{ex.sets > 1 ? 's' : ''} de {ex.reps}</span>}
                {!ex.sets && ex.reps && <span>{ex.reps}</span>}
                {ex.duration && <span>{ex.duration}</span>}
                {ex.rest && <span>Repos : {ex.rest}</span>}
                {ex.intensity && <span className="text-purple-400">{ex.intensity}</span>}
              </div>
              {ex.notes && (
                <p className="text-xs text-slate-300 mt-2 bg-white/5 rounded px-2 py-1.5 leading-relaxed">
                  {ex.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
      {block.notes && (
        <p className="text-xs text-slate-500 mt-2 italic">{block.notes}</p>
      )}
    </div>
  )
}

export default function AthxSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [session, setSession] = useState<AthxSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Formulaire de log
  const [effort, setEffort] = useState<number>(7)
  const [actualDuration, setActualDuration] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    athxService.getById(id)
      .then((data) => {
        setSession(data)
        if (data.perceived_effort) {
          setEffort(data.perceived_effort)
          setLogged(true)
        }
        if (data.duration_minutes) setActualDuration(data.duration_minutes)
        if (data.notes) setNotes(data.notes)
      })
      .catch(() => toast.error('Impossible de charger la séance'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLog = async () => {
    try {
      setSaving(true)
      await athxService.update(id, {
        perceived_effort: effort,
        duration_minutes: actualDuration !== '' ? actualDuration : undefined,
        notes: notes || undefined,
      })
      toast.success('Séance enregistrée !')
      setLogged(true)
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-slate-400">
        Séance introuvable.{' '}
        <Link href="/athx" className="text-purple-400 ml-1 underline">Retour</Link>
      </div>
    )
  }

  const plan = session.ai_plan
  const date = new Date(session.session_date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden" animate="visible" variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Link href="/athx" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              {plan?.name ?? ATHX_SESSION_TYPE_LABELS[session.session_type]}
            </h1>
            <p className="text-sm text-slate-400 capitalize">{date}</p>
          </div>
        </motion.div>

        {/* Infos rapides */}
        {plan && (
          <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-3">{plan.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{plan.duration_minutes} min prévues</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Dumbbell className="w-4 h-4 text-red-400" />
                <span className="capitalize">{plan.difficulty}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plan complet */}
        {plan && (
          <motion.div variants={fadeInUp} className="space-y-3">
            <h2 className="text-base font-semibold text-slate-200">Plan de séance</h2>
            {plan.blocks.map((block, i) => (
              <BlockCard key={i} block={block} />
            ))}
          </motion.div>
        )}

        {/* Conseils + compétition */}
        {plan && (
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-slate-300">Conseils coach</span>
              </div>
              <p className="text-xs text-slate-400">{plan.coaching_tips}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-slate-300">Prépa compétition</span>
              </div>
              <p className="text-xs text-slate-400">{plan.competition_notes}</p>
            </div>
          </motion.div>
        )}

        {/* Logger les résultats */}
        <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            {logged ? 'Résultats enregistrés' : 'Logger cette séance'}
          </h2>

          {/* RPE */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Effort perçu (RPE) — <span className="text-purple-400 font-semibold">{effort}/10</span>
            </label>
            <input
              type="range" min={1} max={10} step={1} value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              className="w-full accent-purple-400"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 Très facile</span><span>5 Modéré</span><span>10 Max</span>
            </div>
          </div>

          {/* Durée réelle */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Durée réelle (min)</label>
            <input
              type="number" min={5} max={300}
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value ? Number(e.target.value) : '')}
              placeholder={plan ? String(plan.duration_minutes) : '60'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ressenti, points à améliorer..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLog}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Enregistrement...' : logged ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button
              onClick={() => router.push('/athx')}
              className="px-4 py-3 text-slate-400 border border-white/10 rounded-xl hover:border-white/20 hover:text-white transition-colors text-sm"
            >
              Retour
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
