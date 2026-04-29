import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('skill_program_steps', (table) => {
    table.index(['program_id', 'status'], 'idx_skill_steps_program_status')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('skill_program_steps', (table) => {
    table.dropIndex([], 'idx_skill_steps_program_status')
  })
}
