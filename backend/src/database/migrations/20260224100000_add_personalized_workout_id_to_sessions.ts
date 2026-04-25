import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workout_sessions', (table) => {
    // Make workout_id nullable (can be null when using personalized_workout_id)
    table.uuid('workout_id').nullable().alter()

    // Add optional reference to personalized_workouts
    table.uuid('personalized_workout_id').nullable()
      .references('id').inTable('personalized_workouts').onDelete('CASCADE')

    table.index(['personalized_workout_id'], 'idx_sessions_personalized_workout')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workout_sessions', (table) => {
    table.dropIndex([], 'idx_sessions_personalized_workout')
    table.dropColumn('personalized_workout_id')
    table.uuid('workout_id').notNullable().alter()
  })
}
