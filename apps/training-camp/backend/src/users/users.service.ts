import { Injectable } from "@nestjs/common"
import { Knex } from "knex"
import { InjectModel } from "nest-knexjs"
import { UpdateUserDto, UserProfile, UserQueryDto } from "./dto"

@Injectable()

export class UsersService {
    constructor(
        @InjectModel() private readonly knex: Knex
    ) { }

    private sanitizeUser(user: Record<string, unknown>): Omit<UserProfile, 'stats'> {
        const { password, ...sanitized } = user
        return sanitized as Omit<UserProfile, 'stats'>
    }

    /**
     * Récupère un utilisateur par son ID avec ses statistiques.
     * @param {string} id - Identifiant de l'utilisateur.
     * @returns {Promise<User | null>} - Promesse qui renvoie l'utilisateur correspondant à l'identifiant ou null si l'utilisateur n'existe pas.
     * Le résultat inclut le mot de passe de l'utilisateur qui est masqué.
     * Les stats de l'utilisateur sont également récupérés et incluent le nombre de workout et de sessions qu'il a créées.
     */
    async getProfile(id: string) {
        const user = await this.knex('users')
            .where({ id })
            .first()

        if (!user) return null

        const sanitizedUser = this.sanitizeUser(user)

        // Récupérer les stats de l'utilisateur
        const [workoutsCount, sessionsCount, totalTime] = await Promise.all([
            this.knex('workouts')
                .where({ created_by_user_id: id })
                .count('* as count')
                .first(),
            this.knex('workout_sessions')
                .where({ user_id: id })
                .whereNotNull('completed_at')
                .count('* as count')
                .first(),
            // Calculer le temps total des sessions complétées
            this.knex('workout_sessions')
                .select(
                    this.knex.raw(`
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN results->>'elapsed_time_seconds' IS NOT NULL
                                    THEN (results->>'elapsed_time_seconds')::integer
                                    WHEN completed_at IS NOT NULL
                                    THEN EXTRACT(EPOCH FROM (completed_at - started_at))::integer
                                    ELSE 0
                                END
                            ),
                            0
                        ) as total_seconds
                    `)
                )
                .where({ user_id: id })
                .whereNotNull('completed_at')
                .first(),
        ])

        return {
            ...sanitizedUser,
            stats: {
                workouts: Number(workoutsCount?.count || 0),
                sessions: Number(sessionsCount?.count || 0),
                total_time_minutes: Math.round(Number(totalTime?.total_seconds || 0) / 60),
            },
        }
    }


    /**
     * Récupère la liste des utilisateurs avec filtres et recherche.
     * @param {UserQueryDto} query - Paramètres de la requête.
     * @param {string} query.limit - Nombre d'utilisateurs à récupérer. Par défaut : 20.
     * @param {string} query.offset - Décalage de pagination. Par défaut : 0.
     * @param {string} query.search - Paramètre de recherche. S'il est défini, la valeur donnée dans l'étiquette de l'utilisateur sera recherchée.
     * @param {string} query.role - Rôle de l'utilisateur. Par défaut : tous les utilisateurs sont récupérés.
     * @param {string} query.orderBy - Colonne de tri. Par défaut : « created_at ».
     * @param {string} query.orderDir - Sens de l'ordre. Par défaut : « desc ».
     * @returns {Promise<{rows: User[], count: number}>} - Promesse qui renvoie un objet contenant les lignes et le nombre.
     */
    async findAll({ limit = '20', offset = '0', search = '', role, orderBy = 'created_at', orderDir = 'desc' }: UserQueryDto
    ) {
        let query = this.knex('users')
            .select('users.*')
            .select(this.knex.raw('COUNT(DISTINCT workouts.id) as workouts_count'))
            .leftJoin('workouts', 'users.id', 'workouts.created_by_user_id')
            .groupBy('users.id')

        if (search) {
            query = query.where(function () {
                this.where('users.email', 'ilike', `%${search}%`)
                    .orWhere('users.firstName', 'ilike', `%${search}%`)
                    .orWhere('users.lastName', 'ilike', `%${search}%`)
            })
        }

        if (role) {
            query = query.where('users.role', role)
        }

        const rows = await query
            .limit(Number(limit))
            .offset(Number(offset))
            .orderBy(orderBy, orderDir)

        const sanitizedRows = rows.map(user => this.sanitizeUser(user))

        const countQuery = this.knex('users').count('* as count')

        if (search) {
            countQuery.where(function () {
                this.where('email', 'ilike', `%${search}%`)
                    .orWhere('firstName', 'ilike', `%${search}%`)
                    .orWhere('lastName', 'ilike', `%${search}%`)
            })
        }
        if (role) {
            countQuery.where('role', role)
        }

        const countResult = await countQuery.first()

        return {
            rows: sanitizedRows,
            count: Number(countResult?.count || 0),
        }
    }

    /**
     * Récupère un utilisateur par son ID.
     * @param {string} id - Identifiant de l'utilisateur.
     * @returns {Promise<User | null>} - Promesse qui renvoie l'utilisateur correspondant à l'identifiant ou null si l'utilisateur n'existe pas.
     * Le résultat inclut le mot de passe de l'utilisateur qui est masqué.
     * Les stats de l'utilisateur sont également récupérés et incluent le nombre de workout et de sessions qu'il a créées.
     */
    async findOne(id: string) {
        const user = await this.knex('users')
            .where({ id })
            .first()

        if (!user) return null

        const sanitizedUser = this.sanitizeUser(user)

        // Récupérer les stats de l'utilisateur
        const [workoutsCount, sessionsCount] = await Promise.all([
            this.knex('workouts')
                .where({ created_by_user_id: id })
                .count('* as count')
                .first(),
            this.knex('workout_sessions')
                .where({ user_id: id })
                .count('* as count')
                .first(),
        ])

        return {
            ...sanitizedUser,
            stats: {
                workouts: Number(workoutsCount?.count || 0),
                sessions: Number(sessionsCount?.count || 0),
            },
        }
    }


    /**
     * Mettre à jour un utilisateur.
     * @param {string} id - Identifiant de l'utilisateur.
     * @param {Partial<{ email: string; firstName: string; lastName: string; role: string; is_active: boolean }>} data - Données à mettre à jour.
     * @returns {Promise<User | null>} - Promesse qui renvoie l'utilisateur mis à jour ou null si l'utilisateur n'existe pas.
     * Le résultat inclut le mot de passe de l'utilisateur qui est masqué.
     */
    async update(id: string, data: UpdateUserDto) {
        const updateData: Record<string, unknown> = {}

        if (data.email !== undefined) updateData.email = data.email
        if (data.firstName !== undefined) updateData.firstName = data.firstName
        if (data.lastName !== undefined) updateData.lastName = data.lastName
        if (data.role !== undefined) updateData.role = data.role
        if (data.isActive !== undefined) updateData.is_active = data.isActive
        if (data.sport_level !== undefined) updateData.sport_level = data.sport_level
        if (data.height !== undefined) updateData.height = data.height
        if (data.weight !== undefined) updateData.weight = data.weight
        if (data.body_fat_percentage !== undefined) updateData.body_fat_percentage = data.body_fat_percentage
        if (data.equipment_available !== undefined) updateData.equipment_available = JSON.stringify(data.equipment_available)

        const [row] = await this.knex('users')
            .where({ id })
            .update(updateData)
            .returning('*')

        if (!row) return null

        return this.sanitizeUser(row)
    }

    /**
     * Supprime un utilisateur.
     * @param {string} id - Identifiant de l'utilisateur à supprimer.
     * @returns {Promise<{success: boolean}>} - Promesse qui renvoie un objet contenant le statut de la suppression.
     */
    async delete(id: string) {
        await this.knex('users').where({ id }).delete()
        return { success: true }
    }


}


