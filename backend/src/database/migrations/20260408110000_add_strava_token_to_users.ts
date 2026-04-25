import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.text('strava_refresh_token').nullable()
    table.bigInteger('strava_athlete_id').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('strava_refresh_token')
    table.dropColumn('strava_athlete_id')
  })
}
