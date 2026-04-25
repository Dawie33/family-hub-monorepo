import { Injectable } from "@nestjs/common"
import { Knex } from "knex"
import { InjectModel } from "nest-knexjs"
import { slugify } from "src/common/utils/utils"
import { CreateExerciseDto, ExerciseQueryDto, UpdateExerciseDto } from "src/exercises/dto/exercises.dto"

@Injectable()
export class ExercisesService {
    constructor(@InjectModel() private readonly knex: Knex) { }

    /**
     * Récupérer tous les exercices.
     * @param {QueryDto} query - Paramètres de la requête.
     * @param {string} query.limit - Nombre d'exercices à récupérer. Par défaut : 50.
     * @param {string} query.offset - Décalage de pagination. Par défaut : 0.
     * @param {string} query.search - Paramètre de recherche. S'il est défini, la valeur donnée dans l'étiquette de l'exercice sera recherchée.
     * @param {string} query.orderBy - Colonne de tri. Par défaut : « created_at ».
     * @param {string} query.orderDir - Sens de l'ordre. Par défaut : « desc ».
     * @returns {Promise<{rows: Exercise[], count: number}>} - Promesse qui renvoie un objet contenant les lignes et le nombre.
     */
    async findAll({
        limit = '50',
        offset = '0',
        search,
        category,
        difficulty,
        orderBy = 'created_at',
        orderDir = 'desc'
    }: ExerciseQueryDto) {

        let query = this.knex("exercises").select("*")

        // Recherche par nom
        if (search) {
            query = query.where('name', 'ilike', `%${search}%`)
        }

        // Filtre par catégorie
        if (category) {
            query = query.where('category', category)
        }

        // Filtre par difficulté
        if (difficulty) {
            query = query.where('difficulty', difficulty)
        }

        const rows = await query
            .limit(Number(limit))
            .offset(Number(offset))
            .orderBy(orderBy, orderDir)

        // Count avec les mêmes filtres
        let countQuery = this.knex("exercises").count({ count: "*" })

        if (search) {
            countQuery = countQuery.where('name', 'ilike', `%${search}%`)
        }
        if (category) {
            countQuery = countQuery.where('category', category)
        }
        if (difficulty) {
            countQuery = countQuery.where('difficulty', difficulty)
        }

        const countResult = await countQuery.first()
        const count = Number(countResult?.count)

        return { rows, count }

    }

    /**
     * Récupère un exercice par son identifiant.
     * @param {string} id - Identifiant de l'exercice.
     * @returns {Promise<Exercise | null>} - Promesse qui renvoie l'exercice correspondant à l'identifiant ou null si l'exercice n'existe pas.
     */
    async findOne(id: string) {
        return this.knex('exercises').where({ id }).first()
    }

    /**
     * Récupère un exercice par son nom.
     * Recherche d'abord une correspondance exacte, sinon recherche avec ILIKE (insensible à la casse et pluriel tolérant)
     * @param {string} name - Nom de l'exercice.
     * @returns {Promise<Exercise | null>} - Promesse qui renvoie l'exercice correspondant au nom ou null si l'exercice n'existe pas.
     */
    async findByName(name: string) {
        // Essayer une correspondance exacte d'abord
        let exercise = await this.knex('exercises').where({ 'name': name }).first()

        if (exercise) {
            return exercise
        }

        // Sinon, recherche insensible à la casse et au pluriel
        // Enlever le 's' final si présent pour supporter "Air Squats" -> "Air Squat"
        const singularName = name.endsWith('s') ? name.slice(0, -1) : name
        exercise = await this.knex('exercises')
            .where('name', 'ilike', singularName)
            .orWhere('name', 'ilike', name)
            .first()

        return exercise || null
    }

    /**
     * Crée un nouvel exercice.
     * @param {object} data - Informations de l'exercice à créer.
     * @returns {Promise<Exercise | null>} - Promesse qui renvoie l'exercice créé.
     */
    async create(data: CreateExerciseDto) {
        const [row] = await this.knex('exercises')
            .insert({
                name: data.name,
                slug: slugify(data.name),
                description: data.description || null,
                instructions: data.instructions || null,
                category: data.category,
                muscle_groups: data.muscle_groups ? JSON.stringify(data.muscle_groups) : null,
                difficulty: data.difficulty,
                scaling_options: data.scaling_options ? JSON.stringify(data.scaling_options) : null,
                equipment_required: data.equipment_required ? JSON.stringify(data.equipment_required) : null,
                bodyweight_only: data.bodyweight_only || false,
                measurement_type: data.measurement_type,
                contraindications: data.contraindications ? JSON.stringify(data.contraindications) : null,
                safety_notes: data.safety_notes || null,
                video_url: data.video_url || null,
                image_url: data.image_url || null,
                isActive: data.isActive !== undefined ? data.isActive : true,
            })
            .returning('*')

        return row
    }

    /**
     * Met à jour un exercice.
     * @param {string} id - ID de l'exercice à mettre à jour.
     * @param {UpdateExerciseDto} data - Informations de l'exercice à mettre à jour.
     * @returns {Promise<Exercise | null>} - Promesse qui renvoie l'exercice mis à jour.
     */
    async update(id: string, data: UpdateExerciseDto) {
        const updateData: Partial<{
            name: string
            slug: string
            description: string
            instructions: string
            category: string
            muscle_groups: string
            difficulty: string
            scaling_options: string
            equipment_required: string
            bodyweight_only: boolean
            measurement_type: string
            contraindications: string
            safety_notes: string
            video_url: string
            image_url: string
            isActive: boolean

        }> = {}

        if (data.name !== undefined) {
            updateData.name = data.name
            updateData.slug = slugify(data.name)
        }
        if (data.description !== undefined) updateData.description = data.description
        if (data.instructions !== undefined) updateData.instructions = data.instructions
        if (data.category !== undefined) updateData.category = data.category
        if (data.muscle_groups !== undefined) updateData.muscle_groups = JSON.stringify(data.muscle_groups)
        if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
        if (data.scaling_options !== undefined) updateData.scaling_options = JSON.stringify(data.scaling_options)
        if (data.equipment_required !== undefined) updateData.equipment_required = JSON.stringify(data.equipment_required)
        if (data.bodyweight_only !== undefined) updateData.bodyweight_only = data.bodyweight_only
        if (data.measurement_type !== undefined) updateData.measurement_type = data.measurement_type
        if (data.contraindications !== undefined) updateData.contraindications = JSON.stringify(data.contraindications)
        if (data.safety_notes !== undefined) updateData.safety_notes = data.safety_notes
        if (data.video_url !== undefined) updateData.video_url = data.video_url
        if (data.image_url !== undefined) updateData.image_url = data.image_url
        if (data.isActive !== undefined) updateData.isActive = data.isActive

        const [row] = await this.knex('exercises')
            .where({ id })
            .update(updateData)
            .returning('*')

        return row
    }

    async delete(id: string) {
        await this.knex('exercises').where({ id }).delete()
        return { success: true }
    }

}


