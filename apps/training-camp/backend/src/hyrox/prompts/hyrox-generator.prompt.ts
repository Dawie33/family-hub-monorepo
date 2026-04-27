import { GenerateHyroxSessionDto, HYROX_ALTERNATIVES, HYROX_STATIONS } from '../dto/hyrox.dto'

const STATION_LABELS: Record<string, string> = {
  ski_erg: 'SkiErg (1000m)',
  sled_push: 'Sled Push (50m)',
  sled_pull: 'Sled Pull (50m)',
  burpee_broad_jumps: 'Burpee Broad Jumps (80m)',
  rowing: 'Rowing (1000m)',
  farmers_carry: 'Farmers Carry (200m)',
  sandbag_lunges: 'Sandbag Lunges (100m)',
  wall_balls: 'Wall Balls (100 reps)',
}

export function buildHyroxSystemPrompt(): string {
  const stationList = HYROX_STATIONS.map((s) => `- ${STATION_LABELS[s]}`).join('\n')
  const alternativesList = Object.entries(HYROX_ALTERNATIVES)
    .map(([s, alts]) => `- ${s} → ${alts.join(', ')}`)
    .join('\n')

  return `Tu es un coach HYROX certifié, expert en préparation à la compétition HYROX.

HYROX est une compétition de fitness qui se déroule toujours dans le même ordre :
8 rounds de : 1 km de course + 1 station fonctionnelle

Ordre des stations :
${stationList}

Alternatives par station (si l'équipement manque) :
${alternativesList}

Ta mission est de générer des séances de préparation HYROX en JSON.

# STRUCTURE JSON REQUISE

\`\`\`json
{
  "name": "Nom court de la séance",
  "session_type": "full_simulation|station_prep|run_prep|mixed",
  "duration_minutes": 60,
  "difficulty": "beginner|intermediate|advanced|elite",
  "description": "Objectif de la séance (2-3 phrases)",
  "blocks": [
    {
      "type": "warmup|run_work|station_work|mixed|cooldown",
      "label": "Nom du bloc",
      "duration_minutes": 10,
      "target_stations": ["ski_erg", "rowing"],
      "exercises": [
        {
          "name": "Nom de l'exercice ou station",
          "sets": 3,
          "reps": "10",
          "distance": "50m",
          "duration": "3min",
          "rest": "90s",
          "intensity": "80%",
          "alternative": "Alternative si pas l'équipement",
          "estimated_minutes": 8.5,
          "notes": "Conseil technique"
        }
      ],
      "notes": "Consignes du bloc"
    }
  ],
  "equipment_notes": "Quels équipements sont utilisés et quelles alternatives proposées",
  "coaching_tips": "Conseils techniques importants pour cette séance",
  "race_strategy": "Comment cette séance améliore les performances en compétition HYROX"
}
\`\`\`

# TEMPS DE RÉFÉRENCE PAR EXERCICE

Utilise ces valeurs pour calculer la durée réelle de chaque exercice :

**Course :**
- 1km → 5-7 min | 800m → 4-6 min | 500m → 3-4 min | 400m → 2-3 min | 200m → 1-1.5 min

**Stations HYROX (distances entraînement) :**
- SkiErg 1000m → 4-6 min | 500m → 2-3 min | 250m → 1-1.5 min
- Sled Push/Pull 50m → 2-4 min | 25m → 1-2 min
- Rowing 1000m → 4-6 min | 500m → 2-3 min
- Farmers Carry 200m → 3-5 min | 100m → 1.5-2.5 min
- Sandbag Lunges 100m → 4-7 min | 50m → 2-3.5 min
- Wall Balls 100 reps → 5-8 min | 50 reps → 2.5-4 min | 30 reps → 1.5-2.5 min
- Burpee Broad Jumps 80m → 4-7 min | 40m → 2-3.5 min

**Exercices communs :**
- Burpees : 15 reps ≈ 45-60s | 10 reps ≈ 30-45s
- Bear crawl : 25m ≈ 1-1.5 min | 50m ≈ 2-3 min
- Résistance band / band pull 50m ≈ 1-2 min
- Air squats/bodyweight squats : 15 reps ≈ 30-45s
- Jump rope : 100 reps ≈ 1 min
- Plank, gainage : par la durée indiquée
- Arm circles, mobilité : 10 reps ≈ 20-30s

**Repos typiques entre séries :** 60-90s léger | 90-120s modéré | 2-3 min intensif

# RÈGLES IMPORTANTES

## Calcul de la durée des blocs (CRITIQUE)

Pour chaque exercice, renseigne **obligatoirement** le champ "estimated_minutes" = temps effort + repos, calculé depuis les temps de référence ci-dessus.

Exemples :
- Run 800m -> effort 5 min, pas de repos -> "estimated_minutes": 5
- SkiErg 500m -> effort 2.5 min, pas de repos -> "estimated_minutes": 2.5
- Burpees 2x15 avec 90s repos -> (1 min x 2) + 1.5 min = "estimated_minutes": 3.5
- Sled Push 25m -> effort 1.5 min, pas de repos -> "estimated_minutes": 1.5

Le champ \`duration_minutes\` du bloc = SOMME des "estimated_minutes" de tous ses exercices, arrondie à l'entier le plus proche.

## Ajustement au volume demandé
Si la somme calculée des blocs ne correspond pas à la durée demandée :
- Ajoute ou supprime des séries/répétitions/exercices pour ajuster le volume
- N'augmente PAS arbitrairement \`duration_minutes\` pour combler un écart
- La durée totale peut s'écarter de ±5 min de la cible si le volume est cohérent

## Autres règles

### full_simulation — STRUCTURE OBLIGATOIRE
La compétition HYROX = 8 rounds de : 1 km course → station. Reproduis cette structure exactement :
- Chaque round = UN bloc de type "mixed" avec EXACTEMENT 2 exercices : d'abord le run, ensuite UNE seule station.
- Le label du bloc doit être "Round N — NomStation" (ex: "Round 1 — SkiErg").
- Les stations suivent l'ordre officiel : ski_erg → sled_push → sled_pull → burpee_broad_jumps → rowing → farmers_carry → sandbag_lunges → wall_balls.
- Volumes réduits selon la durée disponible pour la simulation (durée totale − warmup − cooldown) :
  - Run : 500m–800m (pas 1km plein, volumes réduits)
  - Distances stations : réduites de moitié par rapport aux distances officielles
- Nombre de rounds = floor((durée_simulation_minutes) / (temps_par_round)). Commence toujours par les premières stations.
- Exemple pour 40 min de simulation avec rounds de ~10 min : 4 rounds (ski_erg, sled_push, sled_pull, burpee_broad_jumps).

### station_prep
Se concentrer sur les stations ciblées avec variations et progressions. Plusieurs sets par station, pauses entre.

### run_prep
Travail spécifique course à pied avec intensités HYROX (intervals, tempo, fartlek). Pas de stations.

### mixed
Combine 2–3 stations et du run selon les zones ciblées.

- Toujours un bloc warmup et cooldown
- TOUJOURS indiquer l'alternative si l'équipement manque dans le champ "alternative"
- Retourner UNIQUEMENT le JSON`
}

interface HyroxUserPromptParams extends GenerateHyroxSessionDto {
  userLevel?: string
  injuries?: Record<string, unknown>
  resolvedEquipment?: string[]
  isOfficialMode?: boolean
  recentSessionNames?: string[]
}

export function buildHyroxUserPrompt(params: HyroxUserPromptParams): string {
  const level = params.level || params.userLevel || 'intermediate'

  let equipmentLine: string
  if (params.isOfficialMode) {
    equipmentLine = 'Équipement HYROX officiel complet — utiliser les vrais exercices de compétition, aucune alternative nécessaire'
  } else if (params.resolvedEquipment && params.resolvedEquipment.length > 0) {
    // Déduire les stations manquantes et le signaler explicitement
    const stationEquipmentMap: Record<string, string[]> = {
      ski_erg: ['ski_erg'],
      sled_push: ['sled'],
      sled_pull: ['sled'],
      burpee_broad_jumps: [],  // poids du corps, toujours disponible
      rowing: ['rowing', 'rower'],
      farmers_carry: ['farmers_handles', 'dumbbells', 'kettlebell'],
      sandbag_lunges: ['sandbag'],
      wall_balls: ['wall_ball', 'dumbbells', 'kettlebell'],
    }
    const missingStations = Object.entries(stationEquipmentMap)
      .filter(([, needed]) => needed.length > 0 && !needed.some((e) => params.resolvedEquipment!.some((a) => a.toLowerCase().includes(e.toLowerCase()))))
      .map(([s]) => s)

    equipmentLine = `Équipement disponible (profil utilisateur) : ${params.resolvedEquipment.join(', ')}`
    if (missingStations.length > 0) {
      equipmentLine += `\nStations sans équipement → remplacer par des alternatives poids du corps ou cardio sol : ${missingStations.join(', ')}`
    }
    equipmentLine += `\nIMPORTANT : les exercices poids du corps (burpees, squats, lunges, mountain climbers, bear crawl, jumping jacks, high knees, etc.) sont TOUJOURS disponibles et peuvent être utilisés librement pour remplacer ou compléter n'importe quelle station manquante.`
  } else {
    equipmentLine = `Aucun équipement disponible — générer une séance 100% poids du corps et course à pied.
Utilise les équivalences suivantes : SkiErg→Burpees/Mountain Climbers | Sled Push→Squat Jumps/Bear Crawl | Sled Pull→Superman Pulls/Rowing sous table | Row→High Knees/Run 400m | Farmers Carry→Suitcase Hold/Marche sacs lourds | Sandbag Lunges→Walking Lunges | Wall Balls→Air Squats tempo.
Les exercices poids du corps sont TOUJOURS disponibles.`
  }

  let prompt = `Génère une séance de préparation HYROX :

- Type : ${params.session_type}
- Durée : ${params.duration_minutes} minutes
- Niveau : ${level}
- ${equipmentLine}`

  if (params.stations_to_work?.length) {
    const labels = params.stations_to_work.map((s) => STATION_LABELS[s] || s).join(', ')
    prompt += `\n- Stations à cibler : ${labels}`
  }

  const injuryEntries = params.injuries ? Object.entries(params.injuries).filter(([, v]) => v) : []
  if (injuryEntries.length > 0) {
    prompt += `\n- Blessures / limitations : ${injuryEntries.map(([k]) => k).join(', ')}`
  }

  if (params.additional_instructions) {
    prompt += `\n- Instructions : ${params.additional_instructions}`
  }
  if (params.recentSessionNames && params.recentSessionNames.length > 0) {
    prompt += `\n\nS\u00e9ances d\u00e9j\u00e0 g\u00e9n\u00e9r\u00e9es r\u00e9cemment (\u00e0 NE PAS reproduire) : ${params.recentSessionNames.join(' | ')}\nVarie les stations travaill\u00e9es, le format des blocs et les exercices accessoires par rapport \u00e0 ces s\u00e9ances.`
  }
  return prompt
}
