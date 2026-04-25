import type { UserAIContext } from 'src/workouts/services/user-context.service'

export interface ProgramGenerationParams {
  program_type: string
  duration_weeks: number
  sessions_per_week: number
  target_level: string
  focus?: string
  box_days_per_week?: number
}

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  strength_building: 'Développement de la force',
  endurance_base: "Base d'endurance",
  competition_prep: 'Préparation compétition',
  off_season: 'Intersaison / récupération active',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant (moins de 1 an de CrossFit)',
  intermediate: 'Intermédiaire (1-3 ans de CrossFit)',
  advanced: 'Avancé (3+ ans, maîtrise des mouvements)',
}

function buildAthleteContextSection(context: UserAIContext): string {
  const lines: string[] = ['## Contexte athlète']

  lines.push(`- Niveau sport : ${context.sport_level}`)

  if (context.height) lines.push(`- Taille : ${context.height} cm`)
  if (context.weight) lines.push(`- Poids : ${context.weight} kg`)

  if (context.oneRepMaxes.length > 0) {
    lines.push('- 1RM :')
    context.oneRepMaxes.forEach((orm) => lines.push(`  - ${orm.lift} : ${orm.value} kg`))
  }

  if (Object.keys(context.benchmarkResults).length > 0) {
    lines.push('- Benchmarks :')
    Object.entries(context.benchmarkResults).forEach(([name, data]) => {
      const resultStr = Object.entries(data.result)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      lines.push(`  - ${name} : ${resultStr} (${data.date})`)
    })
  }

  if (context.equipment_available.length > 0) {
    lines.push(`- Équipement disponible : ${context.equipment_available.join(', ')}`)
  }

  if (Object.keys(context.global_goals).some((k) => context.global_goals[k])) {
    const goals = Object.entries(context.global_goals)
      .filter(([, v]) => v)
      .map(([k]) => k)
    lines.push(`- Objectifs déclarés : ${goals.join(', ')}`)
  }

  if (context.recentSessions.length > 0) {
    lines.push(`- Séances récentes (${context.recentSessions.length} dernières) :`)
    context.recentSessions.slice(0, 5).forEach((s) => {
      lines.push(
        `  - ${s.date} : ${s.workout_type || 'inconnu'}, ${s.duration_minutes} min, effort perçu ${s.perceived_effort ?? 'N/A'}/10`,
      )
    })
  }

  if (context.recentAnalyses.length > 0) {
    const levelLabel: Record<string, string> = {
      pr: 'PR', above_average: 'au-dessus de la moyenne', average: 'dans la moyenne',
      below_average: 'en dessous de la moyenne', first_time: 'première fois',
    }
    lines.push('- Analyses IA récentes (performances + feedback coach) :')
    context.recentAnalyses.forEach((a) => {
      lines.push(`  - ${a.date} — ${a.workout_name} (${levelLabel[a.performance_level] ?? a.performance_level})`)
      if (a.improvements.length > 0) lines.push(`    → À travailler : ${a.improvements.join(', ')}`)
      if (a.next_steps) lines.push(`    → Prochaine étape : ${a.next_steps}`)
    })
  }

  return lines.join('\n')
}

export function buildProgramGeneratorSystemPrompt(): string {
  return `Tu es un coach CrossFit certifie Level 3+ specialise dans la programmation periodisee et le developpement de la performance.

Ta mission est de generer des programmes d'entrainement structures et progressifs en format JSON strict.

# STRUCTURE JSON REQUISE

Tu dois TOUJOURS retourner UNIQUEMENT ce JSON, sans texte avant ni apres :

\`\`\`json
{
  "name": "Nom du programme",
  "description": "Description courte du programme (2-3 phrases)",
  "objectives": "Objectifs specifiques et mesurables du programme",
  "phases": [
    {
      "phase_number": 1,
      "name": "Nom de la phase (ex: Accumulation, Build, Peak)",
      "weeks": [1, 2, 3, 4],
      "description": "Description de cette phase et son objectif",
      "sessions": [
        {
          "session_in_week": 1,
          "title": "Titre de la seance (ex: Force Lower Body)",
          "focus": "strength|conditioning|skill|mixed|recovery",
          "estimated_duration": 60,
          "strength_work": {
            "movements": [
              {
                "name": "Back Squat",
                "sets": 5,
                "reps": "5",
                "intensity": "75% 1RM",
                "rest": "3min",
                "notes": "Pause de 2s en bas"
              }
            ]
          },
          "conditioning": {
            "type": "amrap|for_time|emom|tabata|rounds_for_time|chipper",
            "duration_minutes": 12,
            "rounds": null,
            "movements": [
              { "name": "Wall Ball Shots", "reps": 15, "weight": "9kg" },
              { "name": "Box Jumps", "reps": 10 },
              { "name": "KB Swings", "reps": 12, "weight": "24kg" }
            ],
            "score_type": "rounds_and_reps|time|weight|calories|reps",
            "scaling_notes": "Reduire charge ou reps si necessaire"
          },
          "skill_work": null,
          "coach_notes": "Focus sur la technique avant la charge"
        }
      ]
    }
  ],
  "progression_notes": "Comment progresser au fil du programme",
  "coach_notes": "Notes generales du coach"
}
\`\`\`

# REGLES STRICTES

1. Le nombre de sessions dans chaque phase doit correspondre EXACTEMENT au parametre sessions_per_week demande.
2. session_in_week va de 1 a sessions_per_week.
3. Toutes les semaines du programme doivent apparaitre dans les tableaux "weeks" des phases.
4. La somme de toutes les semaines dans toutes les phases = duration_weeks.
5. strength_work et conditioning peuvent etre null si non applicable (ex: seance recovery).
6. Les champs "reps" peuvent etre un nombre (10) ou une chaine ("8-12", "max").
7. JAMAIS de texte hors JSON.

# METHODOLOGIE

- Phase 1 (Accumulation) : volume eleve, intensite moderee, technique prioritaire
- Phase 2 (Build) : volume reduit, intensite augmentee
- Phase 3 (Peak/Realisation) : volume bas, intensite maximale, expression de la forme
- Toujours inclure un stimulus complementaire (force + condo ou skill + condo)
- Progression semaine par semaine dans chaque phase (intensite ou volume)
- Adapter au niveau de l'athlete et a son contexte CrossFit box`
}

export function buildProgramGeneratorUserPrompt(params: ProgramGenerationParams, context: UserAIContext): string {
  const programTypeLabel = PROGRAM_TYPE_LABELS[params.program_type] || params.program_type
  const levelLabel = LEVEL_LABELS[params.target_level] || params.target_level

  const phases = computePhaseCount(params.duration_weeks)

  const athleteSection = buildAthleteContextSection(context)

  const boxNote =
    params.box_days_per_week && params.box_days_per_week > 0
      ? `\n**Important** : L'athlete s'entraine aussi en box CrossFit ~${params.box_days_per_week} jours/semaine (WODs imprévisibles). Ton programme couvre UNIQUEMENT les ${params.sessions_per_week} seances personnelles. Evite de surcharger les jours de repos.`
      : ''

  const focusNote = params.focus ? `\n**Focus particulier** : ${params.focus}` : ''

  return `Genere un programme d'entrainement CrossFit avec ces parametres :

**Type** : ${programTypeLabel}
**Durée** : ${params.duration_weeks} semaines
**Séances par semaine** : ${params.sessions_per_week} seances personnelles${boxNote}
**Niveau** : ${levelLabel}${focusNote}

**Structure de phases suggérée** : ${phases}

${athleteSection}

Cree un programme periodise, progressif et adapte au profil de l'athlete.
Chaque phase doit avoir une logique claire (accumulation → construction → realisation).
Les seances doivent etre complementaires dans une meme semaine (pas deux seances identiques consécutives).

Retourne UNIQUEMENT le JSON, sans texte avant ou apres.`
}

function computePhaseCount(durationWeeks: number): string {
  if (durationWeeks <= 4) return '1 phase (4 semaines)'
  if (durationWeeks <= 6) return '2 phases (3+3 semaines ou 4+2)'
  if (durationWeeks <= 8) return '2-3 phases (3+3+2 ou 4+4 semaines)'
  return '3-4 phases (accumulation + build + peak + deload)'
}
