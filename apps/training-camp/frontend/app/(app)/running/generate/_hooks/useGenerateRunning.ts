'use client'

import { GeneratedRunningPlan, GenerateRunningDto, runningService, RunType } from '@/services/running'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function useGenerateRunning() {
  const router = useRouter()

  const [runType, setRunType] = useState<RunType>('easy')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [targetDistanceKm, setTargetDistanceKm] = useState<number | undefined>()
  const [goal, setGoal] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedRunningPlan | null>(null)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const params: GenerateRunningDto = {
        run_type: runType,
        duration_minutes: durationMinutes,
        target_distance_km: targetDistanceKm,
        goal: goal || undefined,
        additional_instructions: additionalInstructions || undefined,
      }
      const plan = await runningService.generatePreview(params)
      setGeneratedPlan(plan)
    } catch {
      toast.error('Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedPlan) return
    try {
      setSaving(true)
      const params: GenerateRunningDto = {
        run_type: runType,
        duration_minutes: durationMinutes,
        target_distance_km: targetDistanceKm,
        goal: goal || undefined,
        additional_instructions: additionalInstructions || undefined,
      }
      await runningService.generateAndSave(params)
      toast.success('Séance sauvegardée !')
      router.push('/running')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return {
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
  }
}
