import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('hyrox_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.uuid('scheduled_activity_id').nullable().references('id').inTable('scheduled_activities').onDelete('SET NULL')

    table.date('session_date').notNullable()
    table.enum('session_type', ['full_simulation', 'station_prep', 'run_prep', 'mixed']).notNullable()
    table.enum('source', ['manual', 'ai_generated']).notNullable().defaultTo('manual')

    // Temps total de la simulation (en secondes)
    table.integer('total_time_seconds').nullable()

    // Temps par run : [{ run: 1, time_seconds: 245 }, ...]
    table.jsonb('run_times').nullable()

    // Temps par station : [{ station: 'ski_erg', time_seconds: 180, alternative_used: 'rowing' }, ...]
    // Stations dans l'ordre HYROX : ski_erg, sled_push, sled_pull, burpee_broad_jumps,
    //                               rowing, farmers_carry, sandbag_lunges, wall_balls
    table.jsonb('station_times').nullable()

    // Équipement disponible (pour les alternatives)
    table.jsonb('equipment_available').nullable()

    table.integer('perceived_effort').nullable()   // RPE 1-10
    table.jsonb('ai_plan').nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index(['user_id'], 'idx_hyrox_sessions_user_id')
    table.index(['session_date'], 'idx_hyrox_sessions_date')
    table.index(['session_type'], 'idx_hyrox_sessions_type')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('hyrox_sessions')
}
