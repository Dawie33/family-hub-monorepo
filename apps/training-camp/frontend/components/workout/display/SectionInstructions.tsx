interface SectionInstructionsProps {
  rounds?: number
  rest_between_rounds?: number
}

export function SectionInstructions({ rounds, rest_between_rounds }: SectionInstructionsProps) {
  if (!rounds && !rest_between_rounds) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm">
      <div className="font-medium text-amber-400 mb-1">Instructions</div>
      <div className="text-amber-300">
        {rounds === 1 ? (
          <>Réalise 1 tour complet des exercices ci-dessous</>
        ) : rounds ? (
          <>Répète {rounds} fois la série d'exercices ci-dessous</>
        ) : null}
        {rest_between_rounds && rounds && rounds > 1 && <> avec {rest_between_rounds}s de repos entre chaque tour</>}.
      </div>
    </div>
  )
}
