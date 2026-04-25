import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('skill_progress_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('step_id').notNullable()
      .references('id').inTable('skill_program_steps').onDelete('CASCADE')
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    table.date('session_date').notNullable()
    table.jsonb('performance_data')
    table.text('session_notes').nullable()
    table.timestamps(true, true)

    table.index(['step_id', 'session_date'], 'idx_skill_logs_step_date')
    table.index(['user_id', 'session_date'], 'idx_skill_logs_user_date')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('skill_progress_logs')
}
