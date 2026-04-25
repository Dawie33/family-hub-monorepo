import { Injectable, BadRequestException, ConflictException } from '@nestjs/common'
import OpenAI from 'openai'
import {
  buildCrossFitSystemPrompt,
  buildCrossFitWorkoutPrompt
} from '../prompts/crossfit-generator.prompt'
import { GeneratedWorkoutSchema, GeneratedWorkoutValidated } from '../schemas/workout.schema'
import { ZodError } from 'zod'
import { UserContextService, ActiveSkillContext } from './user-context.service'
import { WorkoutsService } from './workouts.service'
import { WorkoutScheduleService } from './workout-schedule.service'

/**
 * Type pour la structure du workout généré par l'IA
 * Inféré automatiquement depuis le schéma Zod
 */
export type GeneratedWorkout = GeneratedWorkoutValidated

export interface WeeklyPlanDayInput {
  date: string // 'YYYY-MM-DD'
  type: string // 'perso' | 'box' | 'rest'
  focus?: string
}

export interface WeeklyPlanResult {
  scheduled: { date: string; workout_name: string; schedule_id: string }[]
  skipped: string[]
  box_days: string[]
}

export interface WorkoutGenerationParams {
  workoutType?: string
  duration: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  equipment?: string[]
  focus?: string | string[]
  additionalInstructions?: string
  skipSkillBlock?: boolean
  techniqueFocus?: string // 'skills' | 'altero' | 'force' | '' (auto)
}

@Injectable()
export class AIWorkoutGeneratorService {
  private openai: OpenAI

  constructor(
    private readonly userContextService: UserContextService,
    private readonly workoutsService: WorkoutsService,
    private readonly workoutScheduleService: WorkoutScheduleService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Génère un workout CrossFit en utilisant l'IA GPT-4o
   * @param params Paramètres de génération
   * @returns Le workout généré au format JSON
   */
  async generateWorkout(params: WorkoutGenerationParams): Promise<GeneratedWorkout> {
    const systemPrompt = buildCrossFitSystemPrompt(params.equipment)
    const userPrompt = buildCrossFitWorkoutPrompt({
      workoutType: params.workoutType || 'mixed',
      duration: params.duration,
      difficulty: params.difficulty || 'intermediate',
      equipment: params.equipment,
      focus: Array.isArray(params.focus) ? params.focus.join(', ') : params.focus,
      additionalInstructions: params.additionalInstructions
    })
    return this.callOpenAI(systemPrompt, userPrompt)
  }

  /**
   * Génère un workout personnalisé enrichi avec le profil complet de l'utilisateur
   * @param userId ID de l'utilisateur
   * @param params Paramètres de génération (difficulty et equipment optionnels — fallback sur profil)
   * @returns Le workout généré au format JSON
   */
  async generatePersonalizedWorkout(userId: string, params: WorkoutGenerationParams): Promise<GeneratedWorkout> {
    const context = await this.userContextService.getUserAIContext(userId)

    const difficulty = params.difficulty ?? (context.sport_level as WorkoutGenerationParams['difficulty']) ?? 'intermediate'
    const equipment = params.equipment && params.equipment.length > 0
      ? params.equipment
      : context.equipment_available.length > 0 ? context.equipment_available : undefined

    const skillInstruction = params.skipSkillBlock ? null : this.buildSkillInstruction(context.activeSkills)

    const techniqueInstruction = params.techniqueFocus !== undefined
      ? this.buildTechniqueInstruction(params.techniqueFocus, { equipment: equipment ?? [], level: difficulty })
      : null

    const additionalInstructions = [techniqueInstruction, skillInstruction, params.additionalInstructions]
      .filter(Boolean)
      .join('\n\n') || undefined

    const systemPrompt = buildCrossFitSystemPrompt(equipment, context)
    const userPrompt = buildCrossFitWorkoutPrompt({
      workoutType: params.workoutType || 'mixed',
      duration: params.duration,
      difficulty,
      equipment,
      focus: Array.isArray(params.focus) ? params.focus.join(', ') : params.focus,
      additionalInstructions,
    })
    return this.callOpenAI(systemPrompt, userPrompt)
  }

  /**
   * Sélectionne le skill le moins récemment travaillé parmi les skills actifs
   * et construit l'instruction à injecter dans le prompt de génération.
   */
  private buildSkillInstruction(activeSkills: ActiveSkillContext[]): string | null {
    if (!activeSkills.length) return null

    // Trier par last_trained ASC (null = jamais travaillé → priorité maximale)
    const sorted = [...activeSkills].sort((a, b) => {
      if (!a.last_trained && !b.last_trained) return 0
      if (!a.last_trained) return -1
      if (!b.last_trained) return 1
      return new Date(a.last_trained).getTime() - new Date(b.last_trained).getTime()
    })

    const skill = sorted[0]

    const exercisesText = (skill.recommended_exercises ?? [])
      .map((ex) => {
        const parts = [ex.name]
        if (ex.sets) parts.push(`${ex.sets} séries`)
        if (ex.reps) parts.push(`${ex.reps} reps`)
        if (ex.rest) parts.push(`repos ${ex.rest}`)
        if (ex.intensity) parts.push(ex.intensity)
        if (ex.notes) parts.push(`(${ex.notes})`)
        return `  - ${parts.join(' — ')}`
      })
      .join('\n')

    const lastTrainedNote = skill.last_trained
      ? `(dernière séance : ${new Date(skill.last_trained).toLocaleDateString('fr-FR')})`
      : '(jamais travaillé)'

    return [
      `**TRAVAIL TECHNIQUE À INTÉGRER OBLIGATOIREMENT** ${lastTrainedNote} :`,
      `Skill : "${skill.skill_name}" (${skill.skill_category})`,
      `Étape : "${skill.step_title}"`,
      skill.step_description ? `Objectif : ${skill.step_description}` : null,
      exercisesText ? `Exercices de progression :\n${exercisesText}` : null,
      skill.coaching_tips ? `Tips : ${skill.coaching_tips}` : null,
      `→ Inclus une section "skill_work" de 15-20 min AVANT le MetCon avec ces exercices.`,
      `→ Si pertinent, intègre "${skill.skill_name}" ou ses variantes progressives dans le MetCon.`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  private buildTechniqueInstruction(focus: string, ctx: { equipment: string[]; level: string }): string | null {
    const equipNote = ctx.equipment.length
      ? `Équipement disponible UNIQUEMENT : ${ctx.equipment.join(', ')}. N'utilise QUE cet équipement, rien d'autre.`
      : `Pas d'équipement spécifique — mouvements au poids du corps uniquement.`
    const levelNote = `Niveau athlète : ${ctx.level}.`
    const header = `CONTRAINTES ABSOLUES :\n- ${equipNote}\n- ${levelNote}\n- Adapte les mouvements et les charges à ces contraintes.\n`
    const core = `4) CORE / GAINAGE (5-10 min) — abdos et gainage : planches, hollow body, hollow rocks, toes-to-bar lent, sit-ups. PAS de conditioning.`

    const map: Record<string, string> = {
      skills: `STRUCTURE OBLIGATOIRE — PAS DE METCON, séance technique gymnastics pure :
${header}
1) WARMUP (10 min) — mobilité, activation spécifique gymnastics
2) TECHNIQUE GYMNASTICS (25-30 min) — choisis UN mouvement adapté au niveau ET à l'équipement disponible (ex: si pas d'anneaux → barre uniquement). Propose des progressions adaptées au niveau : si débutant sur ce mouvement, commence par les prérequis (ex: strict pull-ups, dips, banded MU). Plusieurs séries avec temps de repos suffisant.
3) RENFORCEMENT SPÉCIFIQUE (10 min) — force auxiliaire liée au mouvement travaillé (ex: dips, ring rows, hollow holds, pike push-ups)
${core}`,
      altero: `STRUCTURE OBLIGATOIRE — PAS DE METCON, séance haltérophilie pure :
${header}
1) WARMUP (10 min) — échauffement haltérophilie, mobilité épaules/hanches/chevilles
2) TECHNIQUE HALTÉROPHILIE (25-30 min) — snatch ou clean & jerk selon l'équipement. Complexes techniques progressifs ou travail de force spécifique (ex: 6x2 à 70%, puis 4x1 à 80%). Temps de repos complet entre les séries (2-3 min). Adapte les charges au niveau.
3) RENFORCEMENT COMPLÉMENTAIRE (10 min) — overhead squat, RDL, press derrière la nuque, ou autre exercice spécifique haltérophilie adapté à l'équipement
${core}`,
      force: `STRUCTURE OBLIGATOIRE — PAS DE METCON, séance force pure :
${header}
1) WARMUP (10 min) — mobilité et activation musculaire ciblée
2) FORCE PRINCIPALE (25-30 min) — un grand mouvement adapté à l'équipement : back squat, deadlift, bench press ou overhead press. 5 séries progressives (ex: 5x5 ou 5/3/1). Temps de repos complet (2-3 min). Adapte les charges au niveau.
3) ACCESSOIRE (10 min) — 2-3 exercices complémentaires ciblant les muscles synergistes, adaptés à l'équipement disponible
${core}`,
    }

    if (map[focus]) return map[focus]

    // Auto — l'IA choisit la dominante, toujours sans MetCon et avec le contexte utilisateur
    return `STRUCTURE OBLIGATOIRE — PAS DE METCON, séance technique/force pure :
${header}
1) WARMUP (10 min) — mobilité et activation adaptés à la séance
2) TRAVAIL PRINCIPAL (25-30 min) — choisis UNE dominante adaptée à l'équipement disponible et au niveau : gymnastics technique, haltérophilie, ou force. Plusieurs séries qualitatives avec temps de repos complet. Si un mouvement n'est pas réalisable avec l'équipement, propose une alternative adaptée.
3) RENFORCEMENT COMPLÉMENTAIRE (10 min) — exercices spécifiques à la dominante choisie, adaptés à l'équipement
${core}`
  }

  /**
   * Extrait et structure un WOD depuis du texte brut (ex: légende Instagram)
   * @param text Texte brut contenant la description du workout
   * @returns Le workout structuré au format JSON
   */
  async parseWorkoutText(text: string): Promise<GeneratedWorkout> {
    const systemPrompt = `Tu es un expert CrossFit spécialisé dans l'extraction et la structuration de WODs depuis du texte brut.

Ta mission est d'EXTRAIRE fidèlement le workout décrit dans le texte fourni, sans inventer d'exercices non mentionnés.
${buildCrossFitSystemPrompt()}`

    const userPrompt = `Extrait et structure ce WOD au format JSON :

---
${text}
---

IMPORTANT :
- Extrait fidèlement les informations présentes dans le texte
- Si une information manque (durée estimée, difficulté), infère-la de manière cohérente avec le contenu
- Structure les exercices en sections (warmup si mentionné, metcon, etc.) selon la logique CrossFit
- Retourne UNIQUEMENT le JSON structuré, sans texte avant ou après

RÈGLE CRITIQUE — ROUNDS MULTIPLES AVEC CHARGES DIFFÉRENTES :
Si le workout comporte plusieurs groupes de rounds avec des charges différentes (ex: "3 rounds de X kg, puis 2 rounds de Y kg, puis 1 round de Z kg"), tu dois créer UNE section séparée par groupe, chacune avec son propre champ "rounds" et ses propres charges dans le champ "weight" de chaque exercice. Ne fusionne JAMAIS plusieurs groupes de rounds en une seule section.

Exemple : "3 rounds de 50 DU + 10 Deadlifts (100kg), 2 rounds de 50 DU + 10 Deadlifts (120kg), 1 round de 50 DU + 10 Deadlifts (140kg)" → 3 sections distinctes avec rounds: 3, rounds: 2, rounds: 1`

    try {
      return await this.callOpenAI(systemPrompt, userPrompt)
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Le texte ne semble pas contenir un workout valide')
    }
  }

  /**
   * Retrouve un WOD de référence connu (benchmark, Open, Hero WOD) par son nom
   * @param name Nom du WOD (ex: "Open 18.1", "Murph", "Fran")
   * @returns Le workout structuré au format JSON
   */
  async lookupWorkoutByName(name: string, referenceData?: string): Promise<GeneratedWorkout> {
    const systemPrompt = `Tu es un expert CrossFit avec une connaissance exhaustive des WODs officiels.
Ta mission est de retrouver et structurer avec précision un WOD de référence connu.
${buildCrossFitSystemPrompt()}`

    let userPrompt: string

    if (referenceData) {
      userPrompt = `Voici les détails officiels du WOD "${name}" fournis par l'utilisateur :

${referenceData}

Structure ce WOD exactement tel que décrit ci-dessus. Respecte SCRUPULEUSEMENT les mouvements, répétitions et charges indiqués.

IMPORTANT : Retourne UNIQUEMENT le JSON structuré, sans texte avant ou après`
    } else {
      userPrompt = `Retrouve le WOD officiel connu sous le nom : "${name}"

Il peut s'agir de :
- Un WOD CrossFit Open (ex: 18.1, 24.3, 11.4...)
- Un benchmark officiel (Fran, Helen, Cindy, Diane, Murph, DT, Grace, Isabel, Karen...)
- Un Hero WOD (Murph, DT, Badger, JT, Lumberjack 20...)
- Un WOD de compétition connu

Retrouve les détails EXACTS et OFFICIELS : mouvements, répétitions, charges (hommes/femmes si applicable), structure (AMRAP/For Time/EMOM...), time cap si applicable, scoring.
IMPORTANT : Si tu n'es pas certain à 100% du contenu exact et officiel de ce WOD, ne l'invente pas. Retourne une erreur JSON : {"error": "UNKNOWN_WOD"}
Note : ta connaissance s'arrête à début 2025, les Open récents (26.x) ne sont pas dans tes données.

IMPORTANT : Retourne UNIQUEMENT le JSON structuré, sans texte avant ou après`
    }

    try {
      return await this.callOpenAI(systemPrompt, userPrompt)
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException(`Impossible de trouver le WOD "${name}". S'il s'agit d'un WOD récent, colle ses détails dans le champ prévu.`)
    }
  }

  /**
   * Génère un plan d'entraînement hebdomadaire pour les jours Perso et retourne le résumé
   * @param userId ID de l'utilisateur
   * @param days Tableau des jours avec leur type (perso/box/rest)
   * @returns Résultat avec les workouts planifiés, les jours skippés et les jours Box
   */
  async generateWeeklyPlan(userId: string, days: WeeklyPlanDayInput[]): Promise<WeeklyPlanResult> {
    const persoDays = days.filter((d) => d.type === 'perso')
    const boxDayDates = days.filter((d) => d.type === 'box').map((d) => d.date)

    const scheduled: WeeklyPlanResult['scheduled'] = []
    const skipped: string[] = []
    const savedBoxDays: string[] = []

    await Promise.all([
      ...persoDays.map(async (day) => {
        try {
          const wod = await this.generatePersonalizedWorkout(userId, {
            workoutType: 'mixed',
            duration: 45,
            techniqueFocus: day.focus ?? '',
            skipSkillBlock: true,
          })

          const saved = await this.workoutsService.create({
            name: wod.name,
            description: wod.description,
            workout_type: wod.workout_type,
            estimated_duration: wod.estimated_duration,
            difficulty: wod.difficulty,
            intensity: wod.intensity,
            blocks: wod.blocks as Record<string, unknown>,
            equipment_required: wod.equipment_required || [],
            focus_areas: wod.focus_areas || [],
            tags: wod.tags || [],
            coach_notes: wod.coach_notes || undefined,
            isPublic: false,
            status: 'published',
            ai_generated: true,
            created_by_user_id: userId,
          })

          try {
            const schedule = await this.workoutScheduleService.create(userId, {
              workout_id: saved.id,
              scheduled_date: day.date,
            })
            scheduled.push({ date: day.date, workout_name: wod.name, schedule_id: schedule.id })
          } catch (err) {
            if (err instanceof ConflictException) {
              skipped.push(day.date)
            } else {
              throw err
            }
          }
        } catch (err) {
          if (err instanceof ConflictException) {
            skipped.push(day.date)
          } else {
            throw err
          }
        }
      }),
      ...boxDayDates.map(async (date) => {
        try {
          await this.workoutScheduleService.create(userId, {
            scheduled_date: date,
            session_type: 'box_session',
          })
          savedBoxDays.push(date)
        } catch (err) {
          if (!(err instanceof ConflictException)) throw err
          // Already scheduled — silently skip
        }
      }),
    ])

    return { scheduled, skipped, box_days: savedBoxDays }
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<GeneratedWorkout> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new BadRequestException('No response from AI')
      }

      const workoutData = JSON.parse(content)

      if (workoutData.error === 'UNKNOWN_WOD') {
        throw new BadRequestException('UNKNOWN_WOD')
      }

      return GeneratedWorkoutSchema.parse(workoutData)
    } catch (error) {
      console.error('Error generating workout with AI:', error)

      if (error instanceof SyntaxError) {
        throw new BadRequestException('AI generated invalid JSON')
      }

      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestException(`Workout validation failed: ${errorMessages}`)
      }

      throw new BadRequestException(`Failed to generate workout: ${error.message}`)
    }
  }
}
