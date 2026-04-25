import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workout_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Relations
    table.uuid('workout_id').notNullable()
      .references('id').inTable('workouts').onDelete('CASCADE')
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')

    // Timestamps de session
    table.timestamp('started_at').notNullable()
    table.timestamp('completed_at').nullable()

    // Données de performance
    table.text('notes').nullable()
    table.jsonb('results').nullable() // { elapsed_time_seconds, block_progress, etc. }

    table.timestamps(true, true)

    // Index pour optimisation
    table.index(['user_id', 'started_at'], 'idx_sessions_user_started')
    table.index(['workout_id'], 'idx_sessions_workout')
    table.index(['completed_at'], 'idx_sessions_completed')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workout_sessions')
}
