
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.text('google_refresh_token').nullable()
    table.string('google_calendar_id').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('google_refresh_token')
    table.dropColumn('google_calendar_id')
  })
}
