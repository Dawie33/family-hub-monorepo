'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exercisesApi } from '@/services/exercises'
import type { Exercise } from '@/domain/entities/exercise'
import { Search, X, Plus, Dumbbell } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ExercisesSidebarProps {
  isOpen: boolean
  onClose: () => void
  onAddExercise: (exercise: Exercise) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Force',
  cardio: 'Cardio',
  gymnastics: 'Gymnastique',
  olympic_lifting: 'Haltérophilie',
  powerlifting: 'Powerlifting',
  endurance: 'Endurance',
  mobility: 'Mobilité',
}

const CATEGORY_COLORS: Record<string, string> = {
  strength: 'bg-blue-100 text-blue-700 border-blue-200',
  cardio: 'bg-red-100 text-red-700 border-red-200',
  gymnastics: 'bg-purple-100 text-purple-700 border-purple-200',
  olympic_lifting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  powerlifting: 'bg-orange-100 text-orange-700 border-orange-200',
  endurance: 'bg-green-100 text-green-700 border-green-200',
  mobility: 'bg-teal-100 text-teal-700 border-teal-200',
}

export function ExercisesSidebar({ isOpen, onClose, onAddExercise }: ExercisesSidebarProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        const { rows } = await exercisesApi.getAll({ limit: 500 })
        setExercises(rows)
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchExercises()
    }
  }, [isOpen])

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group by category
  const categories = Array.from(new Set(exercises.map((e) => e.category)))

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Exercices
            </h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un exercice..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              Tous ({exercises.length})
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedCategory === category
                    ? CATEGORY_COLORS[category] || 'bg-primary text-primary-foreground'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {CATEGORY_LABELS[category] || category}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des exercices...
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun exercice trouvé
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="group p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => onAddExercise(exercise)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full border ${
                          CATEGORY_COLORS[exercise.category] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {CATEGORY_LABELS[exercise.category] || exercise.category}
                      </span>
                      {exercise.difficulty && (
                        <span className="text-xs text-muted-foreground">
                          {exercise.difficulty}
                        </span>
                      )}
                      {exercise.bodyweight_only && (
                        <span className="text-xs text-muted-foreground">
                          Sans équipement
                        </span>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddExercise(exercise)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="p-4 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Cliquez sur un exercice pour l'ajouter à la section active
          </p>
        </div>
      </div>
    </>
  )
}
