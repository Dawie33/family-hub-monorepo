import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Ajouter les colonnes programme dans user_workout_schedule
  await knex.schema.alterTable('user_workout_schedule', (table) => {
    table
      .enum('session_type', ['workout', 'box_session', 'program_session'])
      .notNullable()
      .defaultTo('workout')

    table
      .uuid('program_enrollment_id')
      .nullable()
      .references('id')
      .inTable('user_program_enrollments')
      .onDelete('SET NULL')

    // Stocke le détail de la séance pour les program_session
    table.jsonb('session_data').nullable()

    table.index(['program_enrollment_id'], 'idx_schedule_enrollment')
    table.index(['session_type'], 'idx_schedule_session_type')
  })

  // Index partiel unique sur user_program_enrollments pour garantir 1 seul programme actif
  await knex.raw(`
    CREATE UNIQUE INDEX uq_user_active_enrollment
    ON user_program_enrollments (user_id)
    WHERE status IN ('enrolled', 'active')
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS uq_user_active_enrollment')

  await knex.schema.alterTable('user_workout_schedule', (table) => {
    table.dropIndex([], 'idx_schedule_enrollment')
    table.dropIndex([], 'idx_schedule_session_type')
    table.dropColumn('session_type')
    table.dropColumn('program_enrollment_id')
    table.dropColumn('session_data')
  })
}
