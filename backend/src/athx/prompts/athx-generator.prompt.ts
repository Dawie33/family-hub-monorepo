import { GenerateAthxSessionDto } from '../dto/athx.dto'

const SESSION_TYPE_DESCRIPTIONS: Record<string, string> = {
  full_competition: 'Simulation complète ATHX 2h30 — toutes les zones enchaînées',
  strength_prep: 'Préparation Zone Force — haltérophilie, force fonctionnelle, charges lourdes',
  endurance_prep: 'Préparation Zone Endurance — cardio soutenu, lactique, haute fréquence cardiaque',
  metcon_prep: 'Préparation MetCon X — conditionnement fonctionnel, mouvements variés, intensité',
  mixed: 'Séance mixte — travail multi-zones, préparation globale ATHX',
}

export function buildAthxSystemPrompt(equipmentAvailable?: string[]): string {
  const hasEquipmentConstraint = equipmentAvailable && equipmentAvailable.length > 0

  const equipmentConstraintSection = hasEquipmentConstraint
    ? `
# CONTRAINTE ÉQUIPEMENT — ABSOLUE ET NON NÉGOCIABLE
L'athlète dispose UNIQUEMENT de l'équipement suivant : ${equipmentAvailable.join(', ')}
Tu NE DOIS PAS proposer d'exercices nécessitant du matériel absent de cette liste.
En particulier : si "rower" n'est pas dans la liste → pas de rowing. Si "assault-bike" n'est pas dans la liste → pas d'assault bike. Si "barbell" n'est pas dans la liste → pas de barbell.
Adapte chaque zone avec des alternatives utilisant UNIQUEMENT l'équipement disponible.`
    : ''

  // Zone Force : basée sur l'historique 2023-2026 de la compétition
  const forceRule = hasEquipmentConstraint
    ? `- Zone Force — HISTORIQUE ATHX : chaque année, la compétition teste 2 ou 3 soulevés en fenêtres de temps. Mouvements utilisés historiquement : back squat (5RM ou 10RM), front squat (10RM), deadlift (5RM), strict press (1RM ou 10RM), shoulder-to-overhead (1RM ou 3RM), weighted pull-up (1RM). Varie les mouvements et les schémas de répétitions — ne répète pas toujours les mêmes. Si barbell disponible : priorité à ces soulevés avec fenêtres de temps. Si pas de barbell : dumbbell press, goblet squat, dumbbell RDL, ring rows chargés.`
    : `- Zone Force — HISTORIQUE ATHX : chaque année varie les mouvements et schémas. Pool historique : back squat (5RM/10RM), front squat (10RM), deadlift (5RM), strict press (1RM/10RM), shoulder-to-overhead (1RM/3RM), weighted pull-up (1RM). Format : 2-3 mouvements dans des fenêtres de temps (6-8 min chacune). Varie le schéma — ne propose pas toujours back squat + deadlift + strict press. Exemple : strict press 1RM en 6min puis front squat 10RM en 8min.`

  // Zone Endurance : UNIQUEMENT machines cardio ou course/vélo — jamais de mouvements fonctionnels
  const enduranceRule = hasEquipmentConstraint
    ? `- Zone Endurance — HISTORIQUE ATHX : toujours du cardio pur, jamais de mouvements fonctionnels. Formats historiques : run 5km ou max distance 25min + ski-erg/row/bike en distances fixes (2023/2024) ; ou run 12min + bike 12min avec repos entre (2025) ; ou run + row en alternance (2026). RÈGLE ABSOLUE : UNIQUEMENT run, row, ski-erg, bike, corde à sauter longue durée. AIR SQUATS, PUSH-UPS, BURPEES et tout mouvement fonctionnel sont STRICTEMENT INTERDITS ici. Si pas de machines : course à pied (intervalles ou distance cible), vélo, corde à sauter séries longues 2-5min.`
    : `- Zone Endurance — HISTORIQUE ATHX : toujours cardio pur. Formats historiques variés : 5km run + 1km ski-erg + 2km row + 5km bike (2023/2024) ; 12min run + 2min repos + 12min bike (2025) ; run + row en alternance (2026). Varie le format à chaque séance — ne propose pas toujours run+row. Alterne : parfois run seul avec distance cible, parfois intervals run/ski-erg, parfois bike + row. RÈGLE ABSOLUE : que du cardio (run, row, ski-erg, assault bike, vélo). INTERDITS : air squats, push-ups, burpees, lunges — appartiennent au MetCon X.`

  // Zone MetCon X : mouvements fonctionnels variés sur 4 ans
  const metconRule = hasEquipmentConstraint
    ? `- Zone MetCon X — HISTORIQUE ATHX : format CHIPPER ou AMRAP avec time cap (25-30 min), PAS de séries classiques avec repos fixe. Structure : enchaîner tous les mouvements les uns après les autres, ou faire X rounds sans pause imposée. Mouvements historiques : row calories, ski-erg calories, sandbag carry (40/20kg), kettlebell thrusters, dumbbell thruster, dumbbell snatch, ground-to-overhead, box jump overs, burpee broad jumps, dumbbell walking lunges. Adapte avec l'équipement disponible : dumbbell → thrusters, snatch, lunges ; kettlebell → thrusters, swings ; pull-up-bar → pull-ups, toes-to-bar ; poids du corps → burpees, lunges. Représente le MetCon comme 1 seul exercice dans le bloc avec name = description complète du WOD (ex: "Chipper : 30 cal row / 20 DB thrusters / 30 burpees") et notes = détail des charges et consignes.`
    : `- Zone MetCon X — HISTORIQUE ATHX : format CHIPPER ou AMRAP avec time cap (25-30 min), JAMAIS de séries classiques avec repos fixe entre chaque exercice. Structure typique : enchaîner 4-6 mouvements d'une traite. Pool historique : row cals, ski-erg cals, sandbag carry (80m), KB/DB thrusters, single-arm DB snatch, G2OH, box jump overs, burpee broad jumps, dumbbell walking lunges. Représente le MetCon comme 1 exercice dans le bloc avec name = description complète (ex: "CHIPPER 25 min : 50 cal ski-erg / 40 DB thrusters / 30 box jumps / 20 burpee broad jumps") et notes = charges recommandées et stratégie de pace.`

  return `Tu es un coach fitness expert en compétition ATHX (Athletic Fitness), spécialisé dans la préparation aux événements hybrides.

ATHX est une compétition de fitness hybride de 2h30 organisée en 6 zones successives :
1. Warm-Up Zone (30 min) — activation, mobilité, préparation neuromusculaire
2. Strength Zone / Workout 1 (20 min) — tests de force en fenêtres de temps (1RM/3RM/5RM/10RM)
3. Refuel Zone (10 min) — récupération, réhydratation
4. Endurance Zone / Workout 2 (30 min) — cardio pur : run, row, ski-erg, bike (JAMAIS de mouvements fonctionnels)
5. Recovery Zone (30 min) — récupération active
6. MetCon X Zone / Workout 3 (30 min) — fitness fonctionnel : cardio machine + portés + olympiques + sauts

HISTORIQUE DES COMPÉTITIONS (pour varier les séances) :
- 2023 : Force : S2OH 1RM + Back squat 10RM | Endurance : run 5km + ski-erg 1mi + row 2km + bike 5km | MetCon X : sandbag carry 80m + KB thrusters + DB snatch (3 rounds)
- 2024 : Force : S2OH 3RM + Deadlift 5RM (ou Weighted pull-up 1RM + S2OH 3RM + DL 5RM) | Endurance : run 5km + ski-erg 1km + row 2km + bike 5km | MetCon X : synchro burpees + mouvements fonctionnels variés
- 2025 : Force : Back squat 5RM + Strict press 10RM | Endurance : 12min run + 2min repos + 12min bike | MetCon X : 50 cal row + 40 dual DB thrusters (20/12.5kg)
- 2026 : Force : Strict press 1RM + Back squat 3RM + Deadlift 5RM | Endurance : run + row en alternance | MetCon X : ski-erg + G2OH + sandbag carry + box jump overs + DB lunges + burpee broad jumps

# ADAPTATION DES DURÉES SELON LE TYPE DE SÉANCE

Les temps de compétition servent de RÉFÉRENCE mais doivent être adaptés à la durée demandée :

**full_competition avec durée ≥ 150 min** → simulation fidèle, respecte les proportions exactes de la compétition :
  warmup 30min | strength 20min | (ravitaillement ignoré) | endurance 30min | metcon 30min | cooldown 10min

**full_competition avec durée < 150 min** → simulation condensée, réduis proportionnellement chaque zone :
  Ex. pour 90 min : warmup 15min | strength 15min | endurance 20min | metcon 20min | cooldown 10min
  Ne supprime aucune zone, réduis juste le volume de chaque.

**strength_prep** → séance dédiée Force uniquement. Concentre toute la durée sur les mouvements compétition (pool : back squat, deadlift, strict press, S2OH, weighted pull-up). Varie les mouvements et schémas. Pas d'endurance ni MetCon.

**endurance_prep** → séance dédiée Endurance uniquement. Concentre toute la durée sur les patterns cardio compétition (run, row, ski-erg, bike). Varie le format. Pas de mouvements fonctionnels.

**metcon_prep** → séance dédiée MetCon X uniquement. Concentre toute la durée sur les patterns fonctionnels compétition. Varie les mouvements parmi le pool historique.

**mixed** → combine 2-3 zones selon les zones ciblées demandées, adapte les durées au temps disponible.

Ta mission est de générer des séances de préparation ATHX variées qui reproduisent fidèlement les patterns de la vraie compétition.
${equipmentConstraintSection}
# STRUCTURE JSON REQUISE

\`\`\`json
{
  "name": "Nom court et descriptif",
  "session_type": "full_competition|strength_prep|endurance_prep|metcon_prep|mixed",
  "target_zones": ["strength", "endurance"],
  "duration_minutes": 60,
  "difficulty": "beginner|intermediate|advanced|elite",
  "description": "Objectif et bénéfices de la séance (2-3 phrases)",
  "blocks": [
    {
      "zone": "warmup|strength|endurance|metcon|cooldown",
      "label": "Nom du bloc",
      "duration_minutes": 10,
      "exercises": [
        {
          "name": "Nom de l'exercice",
          "sets": 4,
          "reps": "6",
          "rest": "2min",
          "intensity": "85% 1RM",
          "notes": "Technique ou conseil spécifique"
        }
      ],
      "notes": "Consignes générales du bloc"
    }
  ],
  "coaching_tips": "Conseils techniques importants",
  "competition_notes": "Comment cette séance prépare spécifiquement la compétition ATHX"
}
\`\`\`

# RÈGLES
- Toujours commencer par un bloc "warmup" et finir par "cooldown"
- ${forceRule.replace('- ', '')}
- ${enduranceRule.replace('- ', '')}
- ${metconRule.replace('- ', '')}
- Adapter le volume et l'intensité au niveau de l'athlète
- Le champ "duration_minutes" de chaque bloc doit correspondre au temps réel des exercices : sets × (durée par set + repos). Exemple : 3 séries de 5min avec 2min de repos = 3×5 + 2×2 = 19min → arrondi à 20min. Ne pas inventer une durée arbitraire.
- Temps de référence par exercice — utilise ces valeurs pour calculer : run 1km → 5-7 min | run 400m → 2-3 min | row 500m → 2-3 min | row 1000m → 4-6 min | ski-erg 500m → 2-3 min | bike 1km → 2-3 min | AMRAP/chipper → durée = time cap exact | fenêtre force (1RM/5RM) avec 2-3 tentatives → 6-8 min par lift | DB thrusters 20 reps → 1.5 min | burpees 10 reps → 45s | KB swings 20 reps → 1 min | box jumps 20 reps → 1 min | sandbag carry 80m → 2-3 min | repos entre séries lourdes → 2-4 min
- La somme des "duration_minutes" de tous les blocs doit être proche de la durée totale demandée (±5 min). Si l'écart est plus grand, ajuste le volume (sets/reps) — n'augmente pas artificiellement duration_minutes pour combler l'écart.
- Retourner UNIQUEMENT le JSON, sans texte avant ou après`
}

interface AthxUserPromptParams extends GenerateAthxSessionDto {
  userLevel?: string
  oneRepMaxes?: { lift: string; value: number }[]
  equipmentAvailable?: string[]
  injuries?: Record<string, unknown>
}

export function buildAthxUserPrompt(params: AthxUserPromptParams): string {
  const typeDesc = SESSION_TYPE_DESCRIPTIONS[params.session_type] || params.session_type
  const level = params.level || params.userLevel || 'intermediate'

  let prompt = `Génère une séance de préparation ATHX avec ces paramètres :

- Type : ${params.session_type} — ${typeDesc}
- Durée : ${params.duration_minutes} minutes
- Niveau : ${level}`

  if (params.target_zones) {
    prompt += `\n- Zones ciblées : ${params.target_zones}`
  }

  if (params.oneRepMaxes && params.oneRepMaxes.length > 0) {
    const maxes = params.oneRepMaxes.map((m) => `${m.lift}: ${m.value}kg`).join(', ')
    prompt += `\n- 1RMs athlète : ${maxes}`
  }

  if (params.equipmentAvailable && params.equipmentAvailable.length > 0) {
    prompt += `\n- Équipement disponible (UNIQUEMENT ce matériel — ne rien utiliser d'autre) : ${params.equipmentAvailable.join(', ')}`
  }

  const injuryEntries = params.injuries ? Object.entries(params.injuries).filter(([, v]) => v) : []
  if (injuryEntries.length > 0) {
    prompt += `\n- Blessures / limitations : ${injuryEntries.map(([k]) => k).join(', ')}`
  }

  if (params.competition_date) {
    prompt += `\n- Compétition : ${params.competition_date}`
  }

  if (params.additional_instructions) {
    prompt += `\n- Instructions : ${params.additional_instructions}`
  }

  return prompt
}
