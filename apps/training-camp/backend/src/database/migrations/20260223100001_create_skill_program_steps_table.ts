import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('skill_program_steps', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('program_id').notNullable()
      .references('id').inTable('skill_programs').onDelete('CASCADE')
    table.integer('step_number').notNullable()
    table.string('title').notNullable()
    table.text('description')
    table.jsonb('validation_criteria')
    table.jsonb('recommended_exercises')
    table.text('coaching_tips').nullable()
    table.integer('estimated_duration_weeks').nullable()
    table.enum('status', ['locked', 'in_progress', 'completed', 'skipped']).defaultTo('locked')
    table.boolean('manually_overridden').defaultTo(false)
    table.timestamp('unlocked_at').nullable()
    table.timestamp('completed_at').nullable()
    table.timestamps(true, true)

    table.unique(['program_id', 'step_number'], { indexName: 'uq_skill_step_number' })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('skill_program_steps')
}
