import { BadRequestException, Injectable } from "@nestjs/common"
import { Knex } from "knex"
import { InjectModel } from "nest-knexjs"
import { slugify } from "src/common/utils/utils"
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from "./dto"

@Injectable()
export class EquipmentsService {
    constructor(@InjectModel() private readonly knex: Knex) { }

    /**
    * Récupérer tous les équipements.
    * @param {QueryDto} query - Paramètres de la requête.
    * @param {string} query.limit - Nombre d'équipements à récupérer. Par défaut : 50.
    * @param {string} query.offset - Décalage de pagination. Par défaut : 0.
    * @param {string} query.search - Paramètre de recherche. S'il est défini, la valeur donnée dans l'étiquette de l'équipement sera recherchée.
    * @param {string} query.orderBy - Colonne de tri. Par défaut : « created_at ».
    * @param {string} query.orderDir - Sens de l'ordre. Par défaut : « desc ».
    * @returns {Promise<{rows: Equipment[], count: number}>} - Promesse qui renvoie un objet contenant les lignes et le nombre.
     **/
    async findAll({ limit = '50', offset = '0', search, orderBy = 'created_at', orderDir = 'desc' }: EquipmentQueryDto) {
        let query = this.knex('equipments').select('*')

        if (search) {
            query = query.where('label', 'ilike', `%${search}%`)
        }

        const rows = await query
            .limit(Number(limit))
            .offset(Number(offset))
            .orderBy(orderBy, orderDir)

        const countResult = await this.knex('equipments')
            .count('* as count')
            .where((builder) => {
                if (search) {
                    builder.where('label', 'ilike', `%${search}%`)
                }
            })
            .first()

        return {
            rows,
            count: Number(countResult?.count || 0),
        }
    }


    /**
     * Récupère un equipment par son ID.
     * @param {string} id - ID de l'équipement.
     */
    async findOne(id: string) {
        if (!id) {
            throw new BadRequestException('id de l\'équipement manquant')
        }
        const equipment = await this.knex("equipments").where({ id }).first()

        if (!equipment) {
            throw new BadRequestException('Equipments introuvable')
        }

        return equipment
    }

    /**
     * Crée un nouvel équipement.
     * @param {CreateEquipmentDto} data - Informations de l'équipement à créer.
     * @returns {Promise<Equipment>} - Promesse qui renvoie l'équipement créé.
     * @throws {BadRequestException} Si l'équipement n'a pas pu être créé.
     */
    async create(data: CreateEquipmentDto) {
        const [row] = await this.knex('equipments')
            .insert({
                slug: slugify(data.label),
                label: data.label,
                description: data.description,
                image_url: data.image_url,
                meta: data.meta ? JSON.stringify(data.meta) : JSON.stringify({}),
            })
            .returning('*')

        return row
    }

    /**
     * Met à jour un équipement.
     * @param {string} id - ID de l'équipement à mettre à jour.
     * @param {UpdateEquipmentDto} data - Informations de l'équipement à mettre à jour.
     * @returns {Promise<Equipment>} - Promesse qui renvoie l'équipement mis à jour.
     * @throws {BadRequestException} Si l'équipement n'a pas pu être mis à jour.
     */
    async update(id: string, data: UpdateEquipmentDto) {
        const updateData: Partial<{
            label: string
            slug: string
            description: string
            meta: string
            image_url: string
        }> = {}

        if (data.label !== undefined) {
            updateData.label = data.label
            updateData.slug = slugify(data.label)
        }
        if (data.description !== undefined) {
            updateData.description = data.description
        }
        if (data.meta !== undefined) {
            updateData.meta = typeof data.meta === 'string'
                ? data.meta
                : JSON.stringify(data.meta)
        }
        if (data.image_url !== undefined) {
            updateData.image_url = data.image_url
        }

        const [row] = await this.knex('equipments')
            .where({ id })
            .update(updateData)
            .returning('*')

        return row
    }

    /**
     * Supprime un équipement.
     * @param {string} id - ID de l'équipement à supprimer.
     * @returns {Promise<{success: boolean}>} - Promesse qui renvoie un objet contenant le statut de la suppression.
     */
    async delete(id: string) {
        await this.knex('equipments').where({ id }).delete()
        return { success: true }
    }

}