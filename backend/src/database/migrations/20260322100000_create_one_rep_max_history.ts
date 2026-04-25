import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('one_rep_max_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('lift').notNullable()
    table.decimal('value', 7, 2).notNullable()
    table.string('source').notNullable().defaultTo('real')
    table.timestamp('measured_at').notNullable().defaultTo(knex.fn.now())
    table.index(['user_id', 'lift'], 'idx_one_rm_history_user_lift')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('one_rep_max_history')
}
