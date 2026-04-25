interface Exercise {
  category?: string
  difficulty?: string
  bodyweight_only?: boolean
}

interface ExerciseBadgesProps {
  exercise: Exercise
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

const categoryLabels: Record<string, string> = {
  strength: 'Force',
  cardio: 'Cardio',
  gymnastics: 'Gymnastique',
  olympic_lifting: 'Haltérophilie',
  powerlifting: 'Force athlétique',
  endurance: 'Endurance',
  mobility: 'Mobilité',
}

export function ExerciseBadges({ exercise }: ExerciseBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {exercise.category && (
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {categoryLabels[exercise.category] || exercise.category}
        </span>
      )}
      {exercise.difficulty && (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            exercise.difficulty === 'beginner'
              ? 'bg-green-500/10 text-green-500'
              : exercise.difficulty === 'intermediate'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
          }`}
        >
          {difficultyLabels[exercise.difficulty]}
        </span>
      )}
      {exercise.bodyweight_only && (
        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
          Poids du corps uniquement
        </span>
      )}
    </div>
  )
}
