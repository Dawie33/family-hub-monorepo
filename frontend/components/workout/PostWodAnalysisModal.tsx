'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type WodAnalysis } from '@/services/sessions'
import { ArrowRight, Brain, CheckCircle, Loader2, RefreshCw, TrendingDown, TrendingUp, XCircle } from 'lucide-react'

interface PostWodAnalysisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysis: WodAnalysis | null
  loading: boolean
  workoutName: string
  onRegenerate?: () => void
}

const performanceBadge: Record<WodAnalysis['performance_level'], { label: string; className: string }> = {
  pr: { label: 'Record personnel', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  above_average: { label: 'Au-dessus de la moyenne', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  average: { label: 'Dans la moyenne', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  below_average: { label: 'En dessous de la moyenne', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  first_time: { label: 'Première fois', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
}

export function PostWodAnalysisModal({ open, onOpenChange, analysis, loading, workoutName, onRegenerate }: PostWodAnalysisModalProps) {
  const badge = analysis ? performanceBadge[analysis.performance_level] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-purple-400" />
              Analyse IA — {workoutName}
            </DialogTitle>
            {onRegenerate && !loading && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border border-white/5"
                title="Régénérer l'analyse"
              >
                <RefreshCw className="w-3 h-3" />
                Régénérer
              </button>
            )}
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            <p className="text-slate-400 text-sm">Analyse en cours...</p>
          </div>
        )}

        {!loading && analysis && (
          <div className="space-y-5 pt-1">
            {/* Badge performance */}
            {badge && (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            )}

            {/* Résumé */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Comparaison avec le passé */}
            {analysis.comparison && (
              <div className="flex items-start gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-blue-200 text-sm leading-relaxed">{analysis.comparison}</p>
              </div>
            )}

            {/* Points forts */}
            {analysis.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Points forts</h4>
                <div className="space-y-1.5">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-slate-200 text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Axes d'amélioration */}
            {analysis.improvements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-400">À travailler</h4>
                <div className="space-y-1.5">
                  {analysis.improvements.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <p className="text-slate-200 text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prochaine étape */}
            <div className="flex items-start gap-3 bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-400 mb-1">Prochaine étape</p>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.next_steps}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !analysis && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <XCircle className="w-10 h-10 text-slate-600" />
            <p className="text-slate-400 text-sm">Impossible de générer l&apos;analyse.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
