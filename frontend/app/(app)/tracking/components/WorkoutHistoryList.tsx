'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { WorkoutSession } from '@/domain/entities/workout'
import { sessionService, type WodAnalysis } from '@/services/sessions'
import { PostWodAnalysisModal } from '@/components/workout/PostWodAnalysisModal'
import { Brain } from 'lucide-react'

interface WorkoutHistoryListProps {
  limit?: number
}

export function WorkoutHistoryList({ limit = 10 }: WorkoutHistoryListProps) {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysis, setAnalysis] = useState<WodAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisWorkoutName, setAnalysisWorkoutName] = useState('')
  const [analysisSessionId, setAnalysisSessionId] = useState<string | null>(null)

  const totalPages = Math.ceil(totalCount / limit)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true)
        const result = await sessionService.getAll({ limit, offset: page * limit })
        setWorkoutSessions(result.rows)
        setTotalCount(result.count)
      } catch (error) {
        toast.error('Erreur lors du chargement des sessions')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [page, limit])

  const filteredSessions = workoutSessions

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return

    try {
      setDeletingId(id)
      await sessionService.deleteSession(id)
      toast.success('Session supprimée')
      setWorkoutSessions(workoutSessions.filter(s => s.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAnalyze = async (session: WorkoutSession) => {
    setAnalysisWorkoutName(session.workout_name ?? 'WOD')
    setAnalysisSessionId(session.id)
    setAnalysis(null)
    setAnalysisOpen(true)
    setAnalysisLoading(true)
    try {
      const result = await sessionService.analyzeSession(session.id)
      setAnalysis(result)
    } catch {
      toast.error("Impossible de générer l'analyse")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!analysisSessionId) return
    setAnalysis(null)
    setAnalysisLoading(true)
    try {
      const result = await sessionService.analyzeSession(analysisSessionId, true)
      setAnalysis(result)
    } catch {
      toast.error("Impossible de régénérer l'analyse")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === yesterday.toDateString()) return 'Hier'

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={cn(
              'text-sm',
              i < rating ? 'text-yellow-500' : 'text-slate-600'
            )}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Vue Desktop - Table */}
      <div className="hidden md:block rounded-xl overflow-hidden border border-slate-700/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/30">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Statut</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Durée</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Blocs</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Note</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 animate-pulse" />
                    <p className="text-sm text-slate-400">Chargement...</p>
                  </div>
                </td>
              </tr>
            ) : filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl opacity-50">🏋️</span>
                    <p className="text-sm text-slate-400">Aucune session trouvée</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const isCompleted = !!session.completed_at
                const duration = isCompleted
                  ? Math.floor((new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000)
                  : 0
                const rating = session.results?.rating || 0
                const blockProgress = session.results?.block_progress || {}
                const completedBlocks = Object.values(blockProgress).filter(Boolean).length
                const totalBlocks = Object.keys(blockProgress).length

                return (
                  <tr key={session.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{session.workout_name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{formatDate(session.started_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                      )}>
                        {isCompleted ? 'Complété' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {isCompleted ? formatDuration(duration) : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {totalBlocks > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300">{completedBlocks}/{totalBlocks}</span>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all"
                              style={{ width: `${(completedBlocks / totalBlocks) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isCompleted && rating > 0 ? renderStars(rating) : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                          onClick={() => setSelectedSession(session)}
                        >
                          Voir
                        </button>
                        {isCompleted && (
                          <button
                            className="px-2 py-1 rounded-lg text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center gap-1"
                            onClick={() => handleAnalyze(session)}
                          >
                            <Brain className="w-3 h-3" />
                            IA
                          </button>
                        )}
                        <button
                          className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => handleDelete(session.id)}
                          disabled={deletingId === session.id}
                        >
                          {deletingId === session.id ? '...' : 'Suppr.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vue Mobile - Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 animate-pulse" />
            <p className="text-sm text-slate-400">Chargement...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <span className="text-2xl opacity-50">🏋️</span>
            <p className="text-sm text-slate-400">Aucune session trouvée</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isCompleted = !!session.completed_at
            const duration = isCompleted
              ? Math.floor((new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000)
              : 0
            const rating = session.results?.rating || 0
            const blockProgress = session.results?.block_progress || {}
            const completedBlocks = Object.values(blockProgress).filter(Boolean).length
            const totalBlocks = Object.keys(blockProgress).length

            return (
              <div
                key={session.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                      )}>
                        {isCompleted ? 'Complété' : 'En cours'}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 text-white">
                      {session.workout_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(session.started_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                      onClick={() => setSelectedSession(session)}
                    >
                      Voir
                    </button>
                    {isCompleted && (
                      <button
                        className="px-2 py-1 rounded-lg text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center gap-1"
                        onClick={() => handleAnalyze(session)}
                      >
                        <Brain className="w-3 h-3" />
                        IA
                      </button>
                    )}
                    <button
                      className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={() => handleDelete(session.id)}
                      disabled={deletingId === session.id}
                    >
                      {deletingId === session.id ? '...' : 'Suppr.'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-slate-500">⏱</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  )}
                  {totalBlocks > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-slate-500">📋</span>
                      <span>{completedBlocks}/{totalBlocks}</span>
                    </div>
                  )}
                </div>

                {totalBlocks > 0 && (
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${(completedBlocks / totalBlocks) * 100}%` }}
                    />
                  </div>
                )}

                {isCompleted && rating > 0 && renderStars(rating)}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-500">
          {totalCount > 0 ? (
            <>Affichage de {page * limit + 1} à {Math.min((page + 1) * limit, totalCount)} sur {totalCount} sessions</>
          ) : (
            <>Aucune session</>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Précédent
            </button>
            <div className="text-sm text-slate-400 px-2">
              Page {page + 1} / {totalPages}
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      <PostWodAnalysisModal
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        analysis={analysis}
        loading={analysisLoading}
        workoutName={analysisWorkoutName}
        onRegenerate={handleRegenerate}
      />

      {/* Dialog détails */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
          <div
            className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white">Détails de la session</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white transition-colors text-xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Date de début</h4>
                  <p className="text-sm text-white">{new Date(selectedSession.started_at).toLocaleString('fr-FR')}</p>
                </div>
                {selectedSession.completed_at && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Date de fin</h4>
                    <p className="text-sm text-white">{new Date(selectedSession.completed_at).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Notes</h4>
                  <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg">
                    {selectedSession.notes}
                  </p>
                </div>
              )}

              {selectedSession.results?.metrics && Object.keys(selectedSession.results.metrics).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Métriques</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSession.results.metrics.calories && (
                      <div className="text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <span className="text-slate-400">Calories:</span>{' '}
                        <span className="font-medium text-white">{selectedSession.results.metrics.calories}</span>
                      </div>
                    )}
                    {selectedSession.results.metrics.avg_heart_rate && (
                      <div className="text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <span className="text-slate-400">FC Moy:</span>{' '}
                        <span className="font-medium text-white">{selectedSession.results.metrics.avg_heart_rate} bpm</span>
                      </div>
                    )}
                    {selectedSession.results.metrics.max_heart_rate && (
                      <div className="text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <span className="text-slate-400">FC Max:</span>{' '}
                        <span className="font-medium text-white">{selectedSession.results.metrics.max_heart_rate} bpm</span>
                      </div>
                    )}
                    {selectedSession.results.metrics.perceived_effort && (
                      <div className="text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <span className="text-slate-400">Effort perçu:</span>{' '}
                        <span className="font-medium text-white">{selectedSession.results.metrics.perceived_effort}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedSession.results?.rating && selectedSession.results.rating > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Note</h4>
                    {renderStars(selectedSession.results.rating)}
                  </div>
                )}
                {selectedSession.results?.block_progress && Object.keys(selectedSession.results.block_progress).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Progression</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{
                            width: `${(Object.values(selectedSession.results.block_progress).filter(Boolean).length /
                              Object.keys(selectedSession.results.block_progress).length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">
                        {Object.values(selectedSession.results.block_progress).filter(Boolean).length}/
                        {Object.keys(selectedSession.results.block_progress).length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
