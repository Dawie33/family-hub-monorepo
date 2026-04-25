import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workout_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    table.uuid('workout_id').nullable()
      .references('id').inTable('workouts').onDelete('SET NULL') // peut être null si séance libre
    table.date('date').notNullable()
    table.jsonb('results_json').notNullable() // {strength:{sets:[...]}, metcon:{time_sec|rounds}, ...}
    table.integer('rpe').notNullable().defaultTo(7) // 1..10
    table.text('notes').nullable()

    table.index(['user_id', 'date'], 'idx_workout_logs_user_date')
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workout_logs')
}
