'use client'

import { Exercise, WorkoutSection } from '@/domain/entities/workout-structure'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

interface SectionEditorProps {
  section: WorkoutSection
  sectionIdx: number
  onUpdateSection: (sectionIdx: number, field: string, value: string | number) => void
  onDeleteSection: (sectionIdx: number) => void
  onAddManualExercise: (sectionIdx: number) => void
  onAddExerciseFromLibrary: (sectionIdx: number) => void
  onUpdateExercise: (sectionIdx: number, exerciseIdx: number, field: string, value: string | number) => void
  onDeleteExercise: (sectionIdx: number, exerciseIdx: number) => void
}

export function SectionEditor({
  section,
  sectionIdx,
  onUpdateSection,
  onDeleteSection,
  onAddManualExercise,
  onAddExerciseFromLibrary,
  onUpdateExercise,
  onDeleteExercise,
}: SectionEditorProps) {
  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={section.title || `Section ${sectionIdx + 1}`}
            onChange={e => onUpdateSection(sectionIdx, 'title', e.target.value)}
            placeholder="Titre de la section"
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-gray-900 dark:text-foreground"
          />
          {section.description && (
            <textarea
              value={section.description}
              onChange={e => onUpdateSection(sectionIdx, 'description', e.target.value)}
              placeholder="Description de la section"
              rows={2}
              className="text-sm text-gray-600 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-full mt-1"
            />
          )}
        </div>
        <button
          className="p-2 hover:bg-red-50 dark:hover:bg-destructive/10 hover:text-red-600 dark:hover:text-destructive rounded-lg transition-colors"
          title="Supprimer la section"
          onClick={() => onDeleteSection(sectionIdx)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Section Config */}
      {(section.rounds || section.duration_min) && (
        <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-border">
          {section.rounds && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Rounds:</span>
              <input
                type="number"
                value={section.rounds}
                onChange={e => onUpdateSection(sectionIdx, 'rounds', parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-blue-50 dark:bg-accent/40 border border-blue-300 dark:border-primary/30 rounded text-sm text-gray-900 dark:text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-primary"
              />
            </div>
          )}
          {section.duration_min && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Durée:</span>
              <input
                type="number"
                value={section.duration_min}
                onChange={e => onUpdateSection(sectionIdx, 'duration_min', parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-blue-50 dark:bg-accent/40 border border-blue-300 dark:border-primary/30 rounded text-sm text-gray-900 dark:text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-primary"
              />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">min</span>
            </div>
          )}
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-2">
        {section.exercises?.map((exercise, exerciseIdx) => (
          <ExerciseEditor
            key={exerciseIdx}
            exercise={exercise}
            sectionIdx={sectionIdx}
            exerciseIdx={exerciseIdx}
            onUpdate={onUpdateExercise}
            onDelete={onDeleteExercise}
          />
        ))}
      </div>

      {/* Add Exercise Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onAddManualExercise(sectionIdx)}
          className="flex-1 py-2 border border-dashed border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent hover:border-blue-400 dark:hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          Créer exercice
        </button>
        <button
          onClick={() => onAddExerciseFromLibrary(sectionIdx)}
          className="flex-1 py-2 border border-dashed border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent hover:border-blue-400 dark:hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          Depuis bibliothèque
        </button>
      </div>
    </div>
  )
}

interface ExerciseEditorProps {
  exercise: Exercise
  sectionIdx: number
  exerciseIdx: number
  onUpdate: (sectionIdx: number, exerciseIdx: number, field: string, value: string | number) => void
  onDelete: (sectionIdx: number, exerciseIdx: number) => void
}

function ExerciseEditor({ exercise, sectionIdx, exerciseIdx, onUpdate, onDelete }: ExerciseEditorProps) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      {/* Drag Handle */}
      <button className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Exercise Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={exercise.name}
            onChange={e => onUpdate(sectionIdx, exerciseIdx, 'name', e.target.value)}
            placeholder="Nom de l'exercice"
            className="flex-1 font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-foreground"
          />
        </div>

        {/* Exercise Details */}
        <div className="flex gap-4 flex-wrap">
          {exercise.reps && (
            <ExerciseField
              label="Reps:"
              value={exercise.reps}
              onChange={v => onUpdate(sectionIdx, exerciseIdx, 'reps', v)}
            />
          )}
          {exercise.sets && (
            <ExerciseField
              label="Sets:"
              value={String(exercise.sets)}
              type="number"
              onChange={v => onUpdate(sectionIdx, exerciseIdx, 'sets', parseInt(v))}
            />
          )}
          {exercise.weight && (
            <ExerciseField
              label="Poids:"
              value={exercise.weight}
              onChange={v => onUpdate(sectionIdx, exerciseIdx, 'weight', v)}
            />
          )}
          {exercise.distance && (
            <ExerciseField
              label="Distance:"
              value={exercise.distance}
              onChange={v => onUpdate(sectionIdx, exerciseIdx, 'distance', v)}
            />
          )}
          {exercise.duration && (
            <ExerciseField
              label="Durée:"
              value={exercise.duration}
              onChange={v => onUpdate(sectionIdx, exerciseIdx, 'duration', v)}
            />
          )}
        </div>

        {/* Details */}
        {exercise.details && (
          <input
            type="text"
            value={exercise.details}
            onChange={e => onUpdate(sectionIdx, exerciseIdx, 'details', e.target.value)}
            placeholder="Détails"
            className="text-xs text-gray-600 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-full"
          />
        )}
      </div>

      {/* Delete Button */}
      <button
        className="mt-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
        title="Supprimer l'exercice"
        onClick={() => onDelete(sectionIdx, exerciseIdx)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ExerciseFieldProps {
  label: string
  value: string | number
  type?: string
  onChange: (value: string) => void
}

function ExerciseField({ label, value, type = 'text', onChange }: ExerciseFieldProps) {
  const widthClass = type === 'number' ? 'w-16' : 'w-20'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${widthClass} px-2 py-1 bg-blue-50 dark:bg-accent/40 border border-blue-300 dark:border-primary/30 rounded text-xs text-gray-900 dark:text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-primary`}
      />
    </div>
  )
}
