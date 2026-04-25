'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface AIParams {
  date: string
  duration_min: number
  intensity: string
  difficulty: string
  workout_type: string
  tags: string
}

interface WorkoutAIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  aiParams: AIParams
  setAiParams: (params: AIParams) => void
  saving: boolean
}

export function WorkoutAIGenerationModal({
  isOpen,
  onClose,
  onSubmit,
  aiParams,
  setAiParams,
  saving,
}: WorkoutAIGenerationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <CardTitle>Generation IA de Workout</CardTitle>
          <CardDescription>
            Configurez les parametres pour generer un workout personnalise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={aiParams.date}
                onChange={(e) => setAiParams({ ...aiParams, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duree (min)</label>
                <Input
                  type="number"
                  value={aiParams.duration_min}
                  onChange={(e) => setAiParams({ ...aiParams, duration_min: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type de Workout</label>
                <Input
                  value={aiParams.workout_type}
                  onChange={(e) => setAiParams({ ...aiParams, workout_type: e.target.value })}
                  placeholder="AMRAP, For Time, EMOM..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Intensite</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={aiParams.intensity}
                  onChange={(e) => setAiParams({ ...aiParams, intensity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulte</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={aiParams.difficulty}
                  onChange={(e) => setAiParams({ ...aiParams, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tags (separes par des virgules)</label>
              <Input
                value={aiParams.tags}
                onChange={(e) => setAiParams({ ...aiParams, tags: e.target.value })}
                placeholder="cardio, strength, endurance"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving || !aiParams.date}
                className="flex-1"
              >
                {saving ? 'Generation...' : 'Generer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
