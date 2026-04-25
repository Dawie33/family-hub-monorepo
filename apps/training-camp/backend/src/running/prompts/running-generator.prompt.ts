import { GenerateRunningSessionDto } from '../dto/running.dto'

const RUN_TYPE_DESCRIPTIONS: Record<string, string> = {
  easy: 'Sortie facile (zone 1-2, conversation possible, récupération active)',
  tempo: 'Allure seuil (zone 3-4, inconfortable mais maintenu, améliore le seuil lactique)',
  intervals: 'Fractionné (répétitions courtes à haute intensité zone 4-5, longues récupérations)',
  long_run: 'Sortie longue (zone 2, endurance fondamentale, base aérobie)',
  fartlek: 'Fartlek (variations libres d\'allure, mélange zones 2-4, ludique)',
  recovery: 'Récupération (zone 1, très facile, 20-30min maximum)',
  race: 'Simulation de course (pacing stratégique, effort progressif)',
}

export function buildRunningSystemPrompt(): string {
  return `Tu es un coach running certifié, spécialiste en préparation aux courses sur route et trail.

Ta mission est de générer des plans de séance de course à pied personnalisés et détaillés, en JSON.

# STRUCTURE JSON REQUISE

\`\`\`json
{
  "name": "Nom court et descriptif de la séance",
  "run_type": "easy|tempo|intervals|long_run|fartlek|recovery|race",
  "total_distance_km": 8.5,
  "estimated_duration_minutes": 50,
  "difficulty": "beginner|intermediate|advanced|elite",
  "description": "Objectif de la séance et bénéfices attendus (2-3 phrases)",
  "structure": [
    {
      "phase": "warmup|main|cooldown|recovery",
      "label": "Échauffement",
      "distance_km": 1.5,
      "duration_minutes": 10,
      "pace_description": "Très facile, allure conversation",
      "target_zone": "zone_1_2",
      "notes": "Conseils spécifiques pour cette phase"
    },
    {
      "phase": "main",
      "label": "Bloc principal",
      "distance_km": 5.0,
      "duration_minutes": 30,
      "pace_description": "Allure seuil, légèrement inconfortable",
      "target_zone": "zone_4",
      "intervals": [
        {
          "effort_duration": "1000m",
          "recovery_duration": "400m footing",
          "pace_description": "Allure 10K",
          "repetitions": 4
        }
      ],
      "notes": "Le champ intervals est UNIQUEMENT pour les séances de type intervals/fartlek"
    }
  ],
  "coaching_tips": "Conseils techniques importants pour cette séance",
  "recovery_notes": "Nutrition post-séance, récupération, prochaine séance recommandée"
}
\`\`\`

# RÈGLES IMPORTANTES
- Le champ \`intervals\` n'est présent que pour \`run_type: intervals\` ou \`fartlek\`
- Pour \`easy\`, \`long_run\`, \`recovery\` : pas d'intervals, allures conversationnelles
- Pour \`tempo\` : bloc principal continu à allure seuil, sans intervals
- La somme des \`distance_km\` des phases doit égaler \`total_distance_km\`
- La somme des \`duration_minutes\` des phases doit égaler \`estimated_duration_minutes\`. Calcule chaque phase depuis les exercices réels : répétitions × (durée effort + récupération). Ne pas inventer une durée arbitraire.
- Les zones cardio : zone_1 (<60%), zone_1_2 (60-70%), zone_2 (65-75%), zone_3 (75-82%), zone_4 (82-89%), zone_5 (>90% FCmax)
- Adapter l'allure au niveau de l'athlète (débutant = plus lent, plus de récupération)
- Retourner UNIQUEMENT le JSON, sans texte avant ou après`
}

interface RunningUserPromptParams extends GenerateRunningSessionDto {
  userLevel?: string
  recentSessions?: { distance_km: number; run_type: string }[]
  injuries?: Record<string, unknown>
  physicalLimitations?: Record<string, unknown>
  trainingPreferences?: { preferred_duration?: number; sessions_per_week?: number }
}

export function buildRunningUserPrompt(params: RunningUserPromptParams): string {
  const runTypeDesc = RUN_TYPE_DESCRIPTIONS[params.run_type] || params.run_type
  const level = params.level || params.userLevel || 'intermediate'

  let prompt = `Génère une séance de course à pied avec ces paramètres :

- Type de séance : ${params.run_type} — ${runTypeDesc}
- Durée cible : ${params.duration_minutes} minutes
- Niveau athlète : ${level}`

  if (params.target_distance_km) {
    prompt += `\n- Distance cible : ${params.target_distance_km} km`
  }

  if (params.goal) {
    prompt += `\n- Objectif : ${params.goal}`
  }

  if (params.recentSessions && params.recentSessions.length > 0) {
    const recent = params.recentSessions.slice(0, 3)
    prompt += `\n- Séances récentes : ${recent.map((s) => `${s.run_type} ${s.distance_km}km`).join(', ')}`
  }

  const injuryEntries = params.injuries ? Object.entries(params.injuries).filter(([, v]) => v) : []
  if (injuryEntries.length > 0) {
    prompt += `\n- Blessures / limitations : ${injuryEntries.map(([k]) => k).join(', ')}`
  }

  const limitationEntries = params.physicalLimitations ? Object.entries(params.physicalLimitations).filter(([, v]) => v) : []
  if (limitationEntries.length > 0) {
    prompt += `\n- Limitations physiques : ${limitationEntries.map(([k]) => k).join(', ')}`
  }

  if (params.trainingPreferences?.sessions_per_week) {
    prompt += `\n- Fréquence d'entraînement : ${params.trainingPreferences.sessions_per_week} séances/semaine`
  }

  if (params.additional_instructions) {
    prompt += `\n- Instructions supplémentaires : ${params.additional_instructions}`
  }

  return prompt
}
