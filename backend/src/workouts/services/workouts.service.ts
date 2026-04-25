import { Injectable } from '@nestjs/common'
import { format } from 'date-fns'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import { safeJsonStringify } from 'src/common/utils/utils'
import { SaveBenchmarkResultDto } from 'src/workouts/dto/workout.dto'
import { CreateWorkoutDto, UpdateWorkoutDto, WorkoutDto, WorkoutQueryDto } from '../dto/workout.dto'
import { calculateLevelFromBenchmarks } from '../workout.utils'


@Injectable()
export class WorkoutsService {
  constructor(
    @InjectModel() private readonly knex: Knex
  ) { }

  /**
   * Recherche tous les workouts.
   * @returns Tous les workouts.
   */
  async findAll({ limit = '20', offset = '0', orderBy = 'created_at', orderDir = 'desc', search, status = '', scheduled_date, difficulty, workout_type, is_benchmark }: WorkoutQueryDto, userId?: string) {

    const applyFilters = (q: Knex.QueryBuilder) => {
      // Visibilité : public OU publié OU appartient à l'utilisateur connecté
      if (userId) {
        q = q.where((builder) => {
          builder.where('isPublic', true).orWhereNull('isPublic').orWhere('workouts.status', 'published').orWhere('created_by_user_id', userId)
        })
      } else {
        q = q.where((builder) => {
          builder.where('isPublic', true).orWhereNull('isPublic').orWhere('workouts.status', 'published')
        })
      }
      if (search) q = q.where('workouts.name', 'ilike', `%${search}%`)
      if (status) q = q.where('workouts.status', status)
      if (scheduled_date) q = q.where('workouts.scheduled_date', scheduled_date)
      if (difficulty) q = q.where('workouts.difficulty', difficulty)
      if (workout_type) q = q.where('workouts.workout_type', workout_type)
      if (is_benchmark !== undefined) q = q.where('workouts.is_benchmark', is_benchmark)
      return q
    }

    const rows = await applyFilters(this.knex('workouts').select('*'))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(orderBy, orderDir)

    const countResult = await applyFilters(this.knex('workouts').count('* as count')).first()

    return {
      rows,
      count: Number(countResult?.count || 0),
    }
  }

  /**
   * Récupère un workout par son ID
   * @param id ID du workout
   * @returns Le workout avec ses exercices associés
   */
  async findOne(id: string) {
    const workout = await this.knex('workouts')
      .select('workouts.*')
      .where('workouts.id', id)
      .first()

    if (!workout) return null

    // Récupérer les exercices associés
    const exercises = await this.knex('workout_exercises')
      .select('workout_exercises.*', 'exercises.name as exercise_name', 'exercises.category')
      .join('exercises', 'workout_exercises.exercise_id', 'exercises.id')
      .where('workout_exercises.workout_id', id)
      .orderBy('workout_exercises.order_index', 'asc')

    return {
      ...workout,
      exercises,
    }
  }

  /**
   * Récupère le workout du jour.
   * Sélectionne un workout publié basé sur un hash de la date.
   * @param userId ID de l'utilisateur
   * @param date Date (format YYYY-MM-DD), par défaut aujourd'hui
   * @returns Le workout du jour
   */
  async getDailyWorkout(userId: string, date?: string): Promise<WorkoutDto> {
    const targetDate = date && date.trim() !== '' ? date : format(new Date(), 'yyyy-MM-dd')

    // Récupérer tous les workouts publiés
    const workouts = await this.knex('workouts')
      .where({ status: 'published' })
      .orderBy('id', 'asc')

    if (!workouts || workouts.length === 0) {
      throw new Error('Aucun workout publié trouvé')
    }

    // Sélectionner le workout du jour basé sur un hash de la date
    const dateHash = parseInt(targetDate.split('-').join(''), 10)
    const workoutIndex = dateHash % workouts.length
    const workout = workouts[workoutIndex]

    const { blocks, tags, ...rest } = workout
    return {
      ...rest,
      blocks,
      tags: tags || [],
    }
  }

  /**
   * Récupère les workouts benchmark
   * Les benchmarks sont des workouts de référence pour évaluer le niveau
   * @returns Liste des workouts benchmark triés par difficulté
   */
  async getBenchmarkWorkouts() {
    try {
      const rows = await this.knex('workouts')
        .select('workouts.*')
        .where({ 'workouts.status': 'published', 'workouts.is_benchmark': true })
        .orderBy('workouts.difficulty', 'asc')
        .orderBy('workouts.name', 'asc')

      const count = rows.length

      return { rows, count }
    } catch (error) {
      throw new Error('Erreur dans la récupération des benchmarks: ' + error.message)
    }
  }

  async getPersonalizedWorkouts(
    userId: string,
    limit = '20',
    offset = '0',
    search?: string,
    difficulty?: string,
    intensity?: string,
    minDuration?: string,
    maxDuration?: string
  ) {
    let query = this.knex('personalized_workouts')
      .select('*')
      .where({ user_id: userId })

    // Filtre de recherche dans le plan_json (name ou description)
    if (search) {
      query = query.where(function () {
        this.whereRaw(`plan_json->>'name' ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`plan_json->>'description' ILIKE ?`, [`%${search}%`])
      })
    }

    // Filtre de difficulté
    if (difficulty) {
      query = query.whereRaw(`LOWER(plan_json->>'difficulty') = ?`, [difficulty.toLowerCase()])
    }

    // Filtre d'intensité
    if (intensity) {
      query = query.whereRaw(`LOWER(plan_json->>'intensity') = ?`, [intensity.toLowerCase()])
    }

    // Filtre de durée minimale
    if (minDuration) {
      query = query.whereRaw(`plan_json->>'duration' >= ?`, [minDuration])
    }

    // Filtre de durée maximale
    if (maxDuration) {
      query = query.whereRaw(`plan_json->>'duration' <= ?`, [maxDuration])
    }

    const rows = await query
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy('created_at', 'desc')

    // Count avec les mêmes filtres
    let countQuery = this.knex('personalized_workouts')
      .count({ count: '*' })
      .where({ user_id: userId })

    if (search) {
      countQuery = countQuery.where(function () {
        this.whereRaw(`plan_json->>'name' ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`plan_json->>'description' ILIKE ?`, [`%${search}%`])
      })
    }

    if (difficulty) {
      countQuery = countQuery.whereRaw(`LOWER(plan_json->>'difficulty') = ?`, [difficulty.toLowerCase()])
    }

    if (intensity) {
      countQuery = countQuery.whereRaw(`LOWER(plan_json->>'intensity') = ?`, [intensity.toLowerCase()])
    }

    if (minDuration) {
      countQuery = countQuery.whereRaw(`plan_json->>'duration' >= ?`, [minDuration])
    }

    if (maxDuration) {
      countQuery = countQuery.whereRaw(`plan_json->>'duration' <= ?`, [maxDuration])
    }

    const countResult = await countQuery.first()
    const count = Number(countResult?.count)

    return { rows, count }
  }


  /**
   * Met à jour un workout.
   * @param id ID du workout à mettre à jour.
   * @param data Informations de mise à jour du workout.
   * @returns Le workout mis à jour.
   */
  async update(id: string, data: UpdateWorkoutDto) {

    const updateData: Partial<{
      name: string
      slug: string
      description: string
      workout_type: string
      wod_format: string
      difficulty: string
      intensity: string
      estimated_duration: number
      status: string
      isActive: boolean
      isFeatured: boolean
      isPublic: boolean
      blocks: string
      tags: string
      scheduled_date: string
      image_url: string
    }> = {}


    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.workout_type !== undefined) updateData.workout_type = data.workout_type
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.intensity !== undefined) updateData.intensity = data.intensity
    if (data.estimated_duration !== undefined) updateData.estimated_duration = data.estimated_duration
    if (data.status !== undefined) updateData.status = data.status
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
    if (data.blocks !== undefined) updateData.blocks = JSON.stringify(data.blocks)
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
    if (data.scheduled_date !== undefined) updateData.scheduled_date = data.scheduled_date
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    const [row] = await this.knex('workouts')
      .where({ id })
      .update(updateData)
      .returning('*')

    return row
  }

  /**
  * Récupère un workout personnalisé par son ID et l'ID de l'utilisateur
  * @param id ID du workout personnalisé
  * @param userId ID de l'utilisateur
  * @returns Le workout personnalisé associé
  * @throws {Error} Si le workout n'est pas trouvé ou que l'utilisateur n'a pas les permissions nécessaires
  */
  async getPersonalizedWorkout(id: string, userId: string) {
    try {
      const workout = await this.knex('personalized_workouts')
        .where({ id, user_id: userId })
        .first()

      if (!workout) {
        throw new Error('Personalized workout not found or you do not have permission to access it')
      }

      return workout
    } catch (error) {
      throw new Error('Failed to fetch personalized workout: ' + error.message)
    }
  }

  /**
   * Supprime un workout personnalisé.
   * Vérifie que l'utilisateur est bien propriétaire du workout avant de le supprimer.
   * @param id ID du workout personnalisé
   * @param userId ID de l'utilisateur
   */
  async deletePersonalizedWorkout(id: string, userId: string) {
    try {
      // Vérifier que le workout appartient bien à l'utilisateur
      const workout = await this.knex('personalized_workouts')
        .where({ id, user_id: userId })
        .first()

      if (!workout) {
        throw new Error('Personalized workout not found or you do not have permission to delete it')
      }

      // Supprimer le workout
      await this.knex('personalized_workouts')
        .where({ id, user_id: userId })
        .delete()

      return { success: true }
    } catch (error) {
      throw new Error('Failed to delete personalized workout: ' + error.message)
    }
  }

  /**
   * Crée un nouveau workout personnalisé.
   * Si workout.id existe, vérifie si le workout de base existe.
   * Sinon, crée un workout personnalisé sans base_id (workout généré par IA).
   * Les données sont transmises via le body de la requête.
   * @param workout Données du workout à créer.
   * @param userId ID de l'utilisateur.
   * @returns Promesse contenant le workout créé.
   * @throws {Error} Si le workout de base n'existe pas ou si une erreur se produit lors de la création.
   */
  async createPersonalizedWorkout(workout: WorkoutDto, userId: string) {

    let baseId: string | null = null

    // Si un ID est fourni, vérifier si le workout existe
    if (workout.id) {
      const baseWorkout = await this.knex('workouts').where({ id: workout.id }).first()

      if (!baseWorkout) {
        throw new Error(`Base workout with id ${workout.id} does not exist`)
      }

      baseId = workout.id
    }

    const wodDate = new Date().toISOString().split('T')[0]
    const workoutWithDate = {
      ...workout,
      name: workout.name ? `${workout.name} — ${wodDate}` : wodDate,
    }

    const record = {
      user_id: userId,
      base_id: baseId, // Peut être null pour les workouts générés par IA
      plan_json: JSON.stringify(workoutWithDate),
      wod_date: wodDate,
      params_json: JSON.stringify({}), // Objet vide par défaut
    }

    try {
      const newWorkout = await this.knex('personalized_workouts').insert(record).returning('*')
      return newWorkout[0]
    } catch (error) {
      throw new Error('Failed to create personalized workout: ' + error.message)
    }
  }

  /**
   * Crée un nouveau workout
   * @param data Informations de création du workout
   * @returns Le workout créé
   */
  async create(data: CreateWorkoutDto) {
    // Build the record with proper JSON handling
    const record: {
      name: string | null
      slug: string | null
      description: string | null
      workout_type: string | null
      blocks: string | null
      estimated_duration: number | null
      intensity: string | null
      difficulty: string | null
      scaling_options: string | null
      equipment_required: string | null
      focus_areas: string | null
      metrics_tracked: string | null
      ai_generated: boolean
      ai_parameters: string | null
      created_by_user_id: string | null
      target_metrics: string | null
      isActive: boolean
      isFeatured: boolean
      isPublic: boolean
      status: string
      scheduled_date: string | null
      is_benchmark: boolean
      coach_notes: string | null
      tags: string | null
      image_url: string
    } = {
      name: data.name || null,
      slug: data.slug || null,
      description: data.description || null,
      workout_type: data.workout_type || null,
      blocks: safeJsonStringify(data.blocks, {}),
      estimated_duration: data.estimated_duration || null,
      intensity: data.intensity || null,
      difficulty: data.difficulty || null,
      scaling_options: safeJsonStringify(data.scaling_options, null),
      equipment_required: safeJsonStringify(data.equipment_required, null),
      focus_areas: safeJsonStringify(data.focus_areas, null),
      metrics_tracked: safeJsonStringify(data.metrics_tracked, null),
      ai_generated: data.ai_generated || false,
      ai_parameters: safeJsonStringify(data.ai_parameters, null),
      created_by_user_id: data.created_by_user_id || null,
      target_metrics: safeJsonStringify(data.target_metrics, null),
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      status: data.status || 'draft',
      scheduled_date: data.scheduled_date || null,
      is_benchmark: data.is_benchmark || false,
      coach_notes: data.coach_notes || null,
      tags: safeJsonStringify(data.tags, []),
      image_url: data.image_url || '',
    }

    // Insert the workout
    const [row] = await this.knex('workouts')
      .insert(record)
      .returning('*')

    return row
  }

  async delete(id: string) {
    await this.knex('workouts').where({ id }).delete()
    return { success: true }
  }

  /**
     * Enregistre le résultat d'un benchmark et calcule/met à jour le niveau de l'utilisateur
     * @param user_id ID de l'utilisateur
     * @param data Données du benchmark (workoutId, workoutName, result)
     */
  async saveBenchmarkResult(user_id: string, data: SaveBenchmarkResultDto) {
    const { workoutId, workoutName, result } = data

    // Récupérer le profil utilisateur
    const user = await this.knex('users')
      .where({ id: user_id })
      .first()

    const existingResults = user?.benchmark_results || {}

    const updatedResults = {
      ...existingResults,
      [workoutName]: {
        workout_id: workoutId,
        result,
        date: new Date().toISOString()
      }
    }

    // Calculer le niveau basé sur les résultats
    const calculatedLevel = calculateLevelFromBenchmarks(
      workoutName,
      result,
      user?.sport_level || 'beginner'
    )

    // Mettre à jour directement dans la table users
    await this.knex('users')
      .where({ id: user_id })
      .update({
        benchmark_results: JSON.stringify(updatedResults),
        sport_level: calculatedLevel,
        updated_at: new Date()
      })

    return {
      success: true,
      level: calculatedLevel,
      benchmark_results: updatedResults
    }
  }

  async remove(id: string) {
    await this.knex('workouts').where({ id }).delete()
    return { success: true }
  }

}
