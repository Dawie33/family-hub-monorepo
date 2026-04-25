'use client'

import type { Exercise as ExerciseType } from '@/domain/entities/exercise'
import type { Exercise, WorkoutBlocks, WorkoutSection } from '@/domain/entities/workout-structure'
import { useState } from 'react'
import { ExercisesSidebar } from './ExercisesSidebar'

interface BlocksEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

const SECTION_TYPES = [
  { value: 'skill_work', label: 'Skill Work' },
  { value: 'strength', label: 'Strength' },
  { value: 'metcon', label: 'MetCon' },
  { value: 'amrap', label: 'AMRAP' },
  { value: 'emom', label: 'EMOM' },
  { value: 'for_time', label: 'For Time' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'circuit', label: 'Circuit' },
  { value: 'tabata', label: 'Tabata' },
  { value: 'finisher', label: 'Finisher' },
  { value: 'core', label: 'Core' },
  { value: 'accessory', label: 'Accessory' },
]

const TIMECAP_TYPES = ['for_time', 'amrap', 'emom']

export function BlocksEditor({ value, onChange, label }: BlocksEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)

  const parseBlocks = (): WorkoutBlocks => {
    if (!value.trim()) {
      return { sections: [] }
    }
    try {
      return JSON.parse(value) as WorkoutBlocks
    } catch {
      return { sections: [] }
    }
  }

  const blocks = parseBlocks()

  const updateBlocks = (newBlocks: WorkoutBlocks) => {
    onChange(JSON.stringify(newBlocks, null, 2))
  }

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const addSection = () => {
    const newSection: WorkoutSection = {
      type: 'metcon',
      title: 'Nouvelle Section',
      exercises: [],
    }
    updateBlocks({
      ...blocks,
      sections: [...blocks.sections, newSection],
    })
    setExpandedSections(new Set([...expandedSections, blocks.sections.length]))
  }

  const removeSection = (index: number) => {
    const newSections = blocks.sections.filter((_, i) => i !== index)
    updateBlocks({ ...blocks, sections: newSections })
  }

  const updateSection = (index: number, updatedSection: Partial<WorkoutSection>) => {
    const newSections = [...blocks.sections]
    newSections[index] = { ...newSections[index], ...updatedSection }
    updateBlocks({ ...blocks, sections: newSections })
  }

  const addExercise = (sectionIndex: number) => {
    const section = blocks.sections[sectionIndex]
    const newExercise: Exercise = {
      name: '',
      reps: '',
      sets: 1,
    }
    updateSection(sectionIndex, {
      exercises: [...(section.exercises || []), newExercise],
    })
  }

  const removeExercise = (sectionIndex: number, exerciseIndex: number) => {
    const section = blocks.sections[sectionIndex]
    const newExercises = (section.exercises || []).filter((_, i) => i !== exerciseIndex)
    updateSection(sectionIndex, { exercises: newExercises })
  }

  const updateExercise = (sectionIndex: number, exerciseIndex: number, updatedExercise: Partial<Exercise>) => {
    const section = blocks.sections[sectionIndex]
    const newExercises = [...(section.exercises || [])]
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], ...updatedExercise }
    updateSection(sectionIndex, { exercises: newExercises })
  }

  const addExerciseFromLibrary = (exercise: ExerciseType) => {
    if (activeSectionIndex === null) return

    const newExercise: Exercise = {
      name: exercise.name,
      reps: exercise.measurement_type === 'reps' ? '10' : '',
      sets: 3,
      details: exercise.description || '',
    }

    const section = blocks.sections[activeSectionIndex]
    updateSection(activeSectionIndex, {
      exercises: [...(section.exercises || []), newExercise],
    })
  }

  const openExerciseLibrary = (sectionIndex: number) => {
    setActiveSectionIndex(sectionIndex)
    setSidebarOpen(true)
  }

  return (
    <div className="space-y-4">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}

      {/* Stimulus / Objectif */}
      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1">Stimulus / Objectif du WOD</label>
        <textarea
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none text-sm"
          value={blocks.stimulus || ''}
          onChange={(e) => updateBlocks({ ...blocks, stimulus: e.target.value || undefined })}
          placeholder="High intensity metabolic conditioning..."
          rows={2}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {blocks.sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(sectionIndex)
          const hasTimecap = TIMECAP_TYPES.includes(section.type)
          const hasTimeAttack = section.type === 'for_time'

          return (
            <div key={sectionIndex} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              {/* Section header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-slate-500 cursor-move">≡</span>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {section.title || `Section ${sectionIndex + 1}`}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {section.type} {section.exercises && `· ${section.exercises.length} exercices`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSection(sectionIndex) }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                  <span className="text-slate-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50 pt-4">
                  {/* Section metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Type</label>
                      <select
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.type}
                        onChange={(e) => updateSection(sectionIndex, { type: e.target.value as WorkoutSection['type'] })}
                      >
                        {SECTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Titre</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                        placeholder="Ex: MetCon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">
                        {hasTimecap ? 'TimeCap (min)' : 'Durée (min)'}
                      </label>

                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.duration_min || ''}
                        onChange={(e) => updateSection(sectionIndex, { duration_min: Number(e.target.value) || undefined })}
                        placeholder='ex: 20min'
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">
                        {hasTimeAttack ? 'TimeAttack (max)' : 'Durée max)'}
                      </label>

                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.duration_max || ''}
                        onChange={(e) => updateSection(sectionIndex, { duration_max: Number(e.target.value) || undefined })}
                        placeholder='ex: 20min'
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Rounds</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.rounds || ''}
                        onChange={(e) => updateSection(sectionIndex, { rounds: Number(e.target.value) || undefined })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Repos (sec)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        value={section.rest_between_rounds || ''}
                        onChange={(e) => updateSection(sectionIndex, { rest_between_rounds: Number(e.target.value) || undefined })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                      value={section.description || ''}
                      onChange={(e) => updateSection(sectionIndex, { description: e.target.value || undefined })}
                      rows={2}
                      placeholder="Description de la section..."
                    />
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-400">Exercices</label>
                    </div>

                    {(section.exercises || []).map((exercise, exerciseIndex) => (

                      <div key={exerciseIndex} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-600 mt-2 cursor-move text-sm">≡</span>
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="text-xs font-medium text-slate-500">Nom</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                value={exercise.name}
                                onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { name: e.target.value })}
                                placeholder="Ex: Push-ups, Squats..."
                              />
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              <div>
                                <label className="text-xs font-medium text-slate-500">Reps</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                  value={exercise.reps || ''}
                                  onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { reps: e.target.value })}
                                  placeholder="10, 10-12..."
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500">Séries</label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                  value={exercise.sets || ''}
                                  onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { sets: Number(e.target.value) || undefined })}
                                  placeholder="3"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500">Poids</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                  value={exercise.weight || ''}
                                  onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { weight: e.target.value })}
                                  placeholder="20kg, BW..."
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500">Distance</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                  value={exercise.distance || ''}
                                  onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { distance: e.target.value })}
                                  placeholder="50m, 400m..."
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500">Durée</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                  value={exercise.duration || ''}
                                  onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { duration: e.target.value })}
                                  placeholder="30s, 1min..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500">Détails</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                value={exercise.details || ''}
                                onChange={(e) => updateExercise(sectionIndex, exerciseIndex, { details: e.target.value })}
                                placeholder="Notes, tempo, consignes..."
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExercise(sectionIndex, exerciseIndex)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors mt-1"
                          >
                            ×
                          </button>
                        </div>

                      </div>

                    ))}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openExerciseLibrary(sectionIndex)}
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
                      >
                        📚 Bibliothèque
                      </button>
                      <button
                        type="button"
                        onClick={() => addExercise(sectionIndex)}
                        className="px-3 py-1.5 text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-all"
                      >
                        + Ajouter
                      </button>
                    </div>
                    {(!section.exercises || section.exercises.length === 0) && (
                      <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-700/50 rounded-xl">
                        Aucun exercice. Clique sur &quot;+ Ajouter&quot; pour commencer.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add section button */}
      <button
        type="button"
        onClick={addSection}
        className="w-full py-3 px-4 bg-white/5 border border-dashed border-slate-700/50 text-slate-400 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all"
      >
        + Ajouter une section
      </button>

      {blocks.sections.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-700/50 rounded-xl">
          Aucune section. Clique sur &quot;+ Ajouter une section&quot; pour construire ton WOD.
        </p>
      )}

      {/* Exercises Sidebar */}
      <ExercisesSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddExercise={addExerciseFromLibrary}
      />
    </div>
  )
}
