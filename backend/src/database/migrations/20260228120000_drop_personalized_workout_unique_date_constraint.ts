import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('personalized_workouts', (table) => {
    table.dropUnique(['user_id', 'wod_date'], 'uq_personalized_user_date')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('personalized_workouts', (table) => {
    table.unique(['user_id', 'wod_date'], { useConstraint: true, indexName: 'uq_personalized_user_date' })
  })
}
