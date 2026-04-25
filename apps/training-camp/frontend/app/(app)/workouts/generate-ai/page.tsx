'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GenerateForm } from './_components/GenerateForm'
import { GeneratedWorkoutResult } from './_components/GeneratedWorkoutResult'
import { useGenerateWorkout } from './_hooks/useGenerateWorkout'

export default function GenerateWorkoutAIPage() {
  const router = useRouter()
  const {
    workoutType, setWorkoutType,
    difficulty, setDifficulty,
    duration, setDuration,
    equipment, setEquipment, toggleEquipment,
    additionalInstructions, setAdditionalInstructions,
    personalized, setPersonalized,
    loading, error,
    generatedWorkout,
    isEditing, setIsEditing,
    editedName, setEditedName,
    editedDescription, setEditedDescription,
    editedDifficulty, setEditedDifficulty,
    editedDuration, setEditedDuration,
    editedIntensity, setEditedIntensity,
    editedBlocks, setEditedBlocks,
    handleGenerate,
    handleSave,
  } = useGenerateWorkout()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-1.5 lg:w-2 h-8 lg:h-12 bg-orange-500 rounded-full" />
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Générer un Workout</h1>
            <p className="text-slate-400 text-sm lg:text-base mt-0.5">Laissez l'IA créer un workout personnalisé</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          <GenerateForm
            workoutType={workoutType} setWorkoutType={setWorkoutType}
            difficulty={difficulty} setDifficulty={setDifficulty}
            duration={duration} setDuration={setDuration}
            equipment={equipment} setEquipment={setEquipment} toggleEquipment={toggleEquipment}
            additionalInstructions={additionalInstructions} setAdditionalInstructions={setAdditionalInstructions}
            personalized={personalized} setPersonalized={setPersonalized}
            loading={loading} error={error}
            onGenerate={handleGenerate}
          />

          <GeneratedWorkoutResult
            generatedWorkout={generatedWorkout}
            personalized={personalized}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            editedName={editedName} setEditedName={setEditedName}
            editedDescription={editedDescription} setEditedDescription={setEditedDescription}
            editedDifficulty={editedDifficulty} setEditedDifficulty={setEditedDifficulty}
            editedDuration={editedDuration} setEditedDuration={setEditedDuration}
            editedIntensity={editedIntensity} setEditedIntensity={setEditedIntensity}
            editedBlocks={editedBlocks} setEditedBlocks={setEditedBlocks}
            loading={loading}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}
