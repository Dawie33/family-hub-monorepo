'use client'

import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LogSessionModal } from './_components/LogSessionModal'
import { SkillHeader } from './_components/SkillHeader'
import { SkillStepCard } from './_components/SkillStepCard'
import { useSkillDetail } from './_hooks/useSkillDetail'

function SkillDetailContent() {
  const router = useRouter()
  const {
    program,
    loading,
    expandedStep,
    stepLogs,
    chartDataByStep,
    logModal,
    setLogModal,
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
  } = useSkillDetail()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Programme non trouve</p>
      </div>
    )
  }

  const progress = getProgressPercent()

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <Button variant="ghost" onClick={() => router.push('/skills')} className="text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux progressions
        </Button>
        <SkillHeader
          program={program}
          progress={progress}
          onPauseResume={handlePauseResume}
          onAbandon={handleAbandon}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* Safety notes */}
      {program.safety_notes && (
        <motion.div variants={fadeInUp}>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-300 text-sm font-medium mb-1">Notes de securite</p>
            <p className="text-red-200/80 text-sm">{program.safety_notes}</p>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Etapes de progression</h2>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/10" />
          <div className="space-y-4">
            {program.steps?.map((step) => (
              <SkillStepCard
                key={step.id}
                step={step}
                isExpanded={expandedStep === step.id}
                isProgramActive={program.status === 'active'}
                logs={stepLogs[step.id] || []}
                chartData={chartDataByStep[step.id] ?? []}
                onToggle={() => handleToggleStep(step.id)}
                onLogSession={() => openLogModal(step.id)}
                onComplete={() => handleCompleteStep(step.id)}
                onSkip={() => handleSkipStep(step.id)}
                onDeleteLog={(logId) => handleDeleteLog(logId, step.id)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <LogSessionModal
        logModal={logModal}
        setLogModal={setLogModal}
        handleSaveLog={handleSaveLog}
        program={program}
      />
    </motion.div>
  )
}

export default function SkillDetailPage() {
  return <SkillDetailContent />
}
