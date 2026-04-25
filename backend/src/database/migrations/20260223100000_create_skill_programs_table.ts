import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('skill_programs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    table.string('skill_name').notNullable()
    table.enum('skill_category', ['gymnastics', 'olympic_lifting', 'strength', 'mobility']).notNullable()
    table.text('description')
    table.integer('estimated_weeks')
    table.enum('status', ['active', 'completed', 'paused', 'abandoned']).defaultTo('active')
    table.jsonb('ai_parameters')
    table.text('progression_notes')
    table.text('safety_notes')
    table.timestamp('started_at').defaultTo(knex.fn.now())
    table.timestamp('completed_at').nullable()
    table.timestamps(true, true)

    table.index(['user_id', 'status'], 'idx_skill_programs_user_status')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('skill_programs')
}
