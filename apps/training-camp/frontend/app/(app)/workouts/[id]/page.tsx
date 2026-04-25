'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useWorkoutForm } from './_hooks/useWorkoutForm'
import { WorkoutAIGenerationModal } from './components/WorkoutAIGenerationModal'
import { WorkoutForm } from './components/WorkoutForm'

export default function WorkoutEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isNewMode = id === 'new'

  const {
    loading,
    saving,
    formData,
    setFormData,
    showAIModal,
    setShowAIModal,
    aiParams,
    setAiParams,
    handleSubmit,
    handleSubmitGenerateWorkout,
  } = useWorkoutForm(id, isNewMode)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-lg text-slate-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        className="max-w-4xl mx-auto p-6 space-y-6 pb-32"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">
              {isNewMode ? 'Nouveau' : 'Modifier'}{' '}
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Workout
              </span>
            </h1>
            {isNewMode && (
              <p className="text-sm text-slate-400 mt-1">
                Crée ton WOD rapidement
              </p>
            )}
          </div>

          {isNewMode && (
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              ✨ Générer avec IA
            </button>
          )}
        </motion.div>

        {/* AI Generation Modal */}
        <WorkoutAIGenerationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSubmit={handleSubmitGenerateWorkout}
          aiParams={aiParams}
          setAiParams={setAiParams}
          saving={saving}
        />

        {/* Workout Form */}
        <motion.div variants={fadeInUp}>
          <WorkoutForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            saving={saving}
            isNewMode={isNewMode}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
