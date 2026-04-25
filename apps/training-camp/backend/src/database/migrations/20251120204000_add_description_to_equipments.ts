import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('equipments', (table) => {
        table.text('description').nullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('equipments', (table) => {
        table.dropColumn('description')
    })
}
