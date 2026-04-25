'use client'

import { WORKOUT_TYPES } from '@/domain/entities/workout-structure'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import type { WorkoutFormProps } from '../types'
import { BlocksEditor } from './BlocksEditor'
import { TagInput } from './TagInput'

export function WorkoutForm({ formData, setFormData, onSubmit, saving, isNewMode }: WorkoutFormProps) {
  const router = useRouter()

  const availableWorkoutTypes = useMemo(() => {
    return WORKOUT_TYPES.crossfit
  }, [])

  const isStrengthType = formData.workout_type === 'strength_max' || formData.workout_type === 'strength_accessory'

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Type de workout */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3">
          Type de WOD
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Catégorie</label>
            <select
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              value={formData.workout_type}
              onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
            >
              <option value="">Sélectionner...</option>
              {availableWorkoutTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Format du WOD</label>
            <select
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              value={formData.wod_format}
              onChange={(e) => setFormData({ ...formData, wod_format: e.target.value })}
            >
              <option value="">Sélectionner...</option>
              <option value="for_time">For Time</option>
              <option value="amrap">AMRAP</option>
              <option value="emom">EMOM</option>
              <option value="tabata">Tabata</option>
              <option value="circuit">Circuit / Rounds</option>
              <option value="intervals">Intervals</option>
              <option value="strength">Strength (séries/reps)</option>
            </select>
          </div>
        </div>

        <TagInput
          label="Etiquettes (tags)"
          value={formData.tags}
          onChange={(value) => setFormData({ ...formData, tags: value })}
          placeholder="cardio, strength, endurance..."
        />
      </div>

      {/* Bloc RM - visible uniquement pour les types Force */}
      {isStrengthType && (
        <div className="bg-slate-800/50 border border-orange-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3">
            🏋️ Objectif Force
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Type RM</label>
              <select
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                value={formData.rm_type}
                onChange={(e) => setFormData({ ...formData, rm_type: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                <option value="1RM">1RM</option>
                <option value="3RM">3RM</option>
                <option value="5RM">5RM</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Exercice</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                value={formData.rm_exercise}
                onChange={(e) => setFormData({ ...formData, rm_exercise: e.target.value })}
                placeholder="ex: Back Squat"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Poids cible</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                value={formData.rm_weight}
                onChange={(e) => setFormData({ ...formData, rm_weight: e.target.value })}
                placeholder="ex: 120kg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Structure du workout */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3">
          Structure du WOD
        </h3>

        <BlocksEditor
          value={formData.blocks}
          onChange={(value) => setFormData({ ...formData, blocks: value })}
        />
      </div>

      {/* Notes personnelles */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3">
          Notes
        </h3>

        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">Notes personnelles</label>
          <textarea
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
            value={formData.personal_notes}
            onChange={(e) => setFormData({ ...formData, personal_notes: e.target.value })}
            rows={3}
            placeholder="Remarques, objectifs, consignes..."
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : isNewMode ? 'Créer le Workout' : 'Sauvegarder'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="py-3 px-6 bg-white/5 border border-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/10 transition-all"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
