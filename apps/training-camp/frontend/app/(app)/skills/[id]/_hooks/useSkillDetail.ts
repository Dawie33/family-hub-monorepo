'use client'

import type { SkillProgram, SkillProgressLog } from '@/domain/entities/skill'
import { skillsService } from '@/services/skills'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

export type LogModalState =
  | { isOpen: false }
  | { isOpen: true; stepId: string; data: { value: string; notes: string; date: string }; saving: boolean }


export function useSkillDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [program, setProgram] = useState<SkillProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [stepLogs, setStepLogs] = useState<Record<string, SkillProgressLog[]>>({})

  const [logModal, setLogModal] = useState<LogModalState>({ isOpen: false })

  const [, startTransition] = useTransition()

  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true)
      const data = await skillsService.getOne(id)
      setProgram(data)
      const activeStep = data.steps?.find(s => s.status === 'in_progress')
      if (activeStep) setExpandedStep(activeStep.id)
    } catch {
      toast.error('Erreur lors du chargement du programme')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProgram()
  }, [fetchProgram])

  const fetchStepLogs = async (stepId: string) => {
    if (stepLogs[stepId]) return
    try {
      const logs = await skillsService.getStepLogs(stepId)
      setStepLogs(prev => ({ ...prev, [stepId]: logs }))
    } catch {
      // silently fail
    }
  }

  const handleToggleStep = (stepId: string) => {
    if (expandedStep === stepId) {
      setExpandedStep(null)
    } else {
      setExpandedStep(stepId)
      fetchStepLogs(stepId)
    }
  }

  const handleCompleteStep = (stepId: string) => {
    startTransition(async () => {
      try {
        await skillsService.updateStep(id, stepId, { status: 'completed' })
        toast.success('Etape marquee comme terminee')
        fetchProgram()
      } catch {
        toast.error('Erreur')
      }
    })
  }

  const handleSkipStep = (stepId: string) => {
    startTransition(async () => {
      try {
        await skillsService.updateStep(id, stepId, { status: 'skipped', manually_overridden: true })
        toast.success('Etape passee')
        fetchProgram()
      } catch {
        toast.error('Erreur')
      }
    })
  }

  const handlePauseResume = async () => {
    if (!program) return
    const newStatus = program.status === 'paused' ? 'active' : 'paused'
    try {
      await skillsService.updateProgram(id, { status: newStatus })
      toast.success(newStatus === 'paused' ? 'Programme mis en pause' : 'Programme repris')
      fetchProgram()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleAbandon = async () => {
    try {
      await skillsService.updateProgram(id, { status: 'abandoned' })
      toast.success('Programme abandonne')
      fetchProgram()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce programme ? Cette action est irreversible.')) return
    try {
      await skillsService.deleteProgram(id)
      toast.success('Programme supprime')
      router.push('/skills')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openLogModal = (stepId: string) => {
    setLogModal({ isOpen: true, stepId, data: { value: '', notes: '', date: new Date().toISOString().split('T')[0] }, saving: false })
  }

  const handleSaveLog = async () => {
    if (!logModal.isOpen) return
    const { stepId, data } = logModal
    try {
      setLogModal(prev => prev.isOpen ? { ...prev, saving: true } : prev)
      const step = program?.steps?.find(s => s.id === stepId)
      const performanceData: Record<string, unknown> = {}
      if (data.value) {
        const numValue = Number(data.value)
        if (step?.validation_criteria?.type === 'reps') {
          performanceData.reps_achieved = numValue
        } else if (step?.validation_criteria?.type === 'time') {
          performanceData.time_seconds = numValue
        } else if (step?.validation_criteria?.type === 'weight') {
          performanceData.weight_used = numValue
        } else {
          performanceData.quality_score = numValue
        }
      }
      await skillsService.logProgress({
        step_id: stepId,
        session_date: data.date,
        performance_data: performanceData,
        session_notes: data.notes || undefined,
      })
      toast.success('Session enregistree')
      setLogModal({ isOpen: false })
      const logs = await skillsService.getStepLogs(stepId)
      setStepLogs(prev => ({ ...prev, [stepId]: logs }))
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLogModal(prev => prev.isOpen ? { ...prev, saving: false } : prev)
    }
  }

  const handleDeleteLog = async (logId: string, stepId: string) => {
    try {
      await skillsService.deleteLog(logId)
      toast.success('Log supprime')
      const logs = await skillsService.getStepLogs(stepId)
      setStepLogs(prev => ({ ...prev, [stepId]: logs }))
    } catch {
      toast.error('Erreur')
    }
  }

  const getProgressPercent = () => {
    if (!program?.steps || program.steps.length === 0) return 0
    const completed = program.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length
    return Math.round((completed / program.steps.length) * 100)
  }

  const chartDataByStep = useMemo(() => {
    const result: Record<string, { date: string; value: number }[]> = {}
    Object.entries(stepLogs).forEach(([stepId, logs]) => {
      result[stepId] = logs
        .slice()
        .reverse()
        .map(log => {
          const pd = (log.performance_data || {}) as Record<string, unknown>
          const value = pd.reps_achieved || pd.time_seconds || pd.weight_used || pd.quality_score || 0
          return {
            date: new Date(log.session_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            value: Number(value),
          }
        })
    })
    return result
  }, [stepLogs])

  return {
    program,
    loading,
    expandedStep,
    stepLogs,
    logModal,
    setLogModal,
    chartDataByStep,
    handleToggleStep,
    handleCompleteStep,
    handleSkipStep,
    handlePauseResume,
    handleAbandon,
    handleDelete,
    openLogModal,
    handleSaveLog,
    handleDeleteLog,
    getProgressPercent,
  }
}
