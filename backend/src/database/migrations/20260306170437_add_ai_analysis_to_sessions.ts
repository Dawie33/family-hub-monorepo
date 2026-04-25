import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workout_sessions', (table) => {
    table.jsonb('ai_analysis').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workout_sessions', (table) => {
    table.dropColumn('ai_analysis')
  })
}
