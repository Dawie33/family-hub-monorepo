import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_workout_schedule', (table) => {
    // Rendre workout_id nullable (un schedule peut référencer un workout perso à la place)
    table.uuid('workout_id').nullable().alter()

    // Nouvelle FK optionnelle vers personalized_workouts
    table.uuid('personalized_workout_id').nullable()
      .references('id').inTable('personalized_workouts').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_workout_schedule', (table) => {
    table.dropColumn('personalized_workout_id')
    table.uuid('workout_id').notNullable().alter()
  })
}
