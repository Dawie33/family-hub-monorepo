import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('running_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    // Lien optionnel vers la planification calendrier
    table.uuid('scheduled_activity_id').nullable().references('id').inTable('scheduled_activities').onDelete('SET NULL')

    table.date('session_date').notNullable()
    table.enum('run_type', ['easy', 'tempo', 'intervals', 'long_run', 'fartlek', 'recovery', 'race']).notNullable()
    table.enum('source', ['manual', 'ai_generated', 'strava']).notNullable().defaultTo('manual')

    // Métriques de performance
    table.decimal('distance_km', 6, 2).nullable()
    table.integer('duration_seconds').nullable()           // durée réelle
    table.integer('avg_pace_seconds_per_km').nullable()   // allure moyenne (s/km)
    table.integer('avg_heart_rate').nullable()
    table.integer('max_heart_rate').nullable()
    table.integer('elevation_gain_m').nullable()
    table.integer('calories').nullable()
    table.integer('perceived_effort').nullable()          // RPE 1-10

    // Plan IA (structure de la séance générée)
    table.jsonb('ai_plan').nullable()

    // Intégration Strava
    table.text('strava_activity_id').nullable().unique() // évite les doublons à la sync

    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index(['user_id'], 'idx_running_sessions_user_id')
    table.index(['session_date'], 'idx_running_sessions_date')
    table.index(['user_id', 'session_date'], 'idx_running_sessions_user_date')
    table.index(['source'], 'idx_running_sessions_source')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('running_sessions')
}
