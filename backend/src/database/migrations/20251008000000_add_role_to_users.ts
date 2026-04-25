import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.enum('role', ['user', 'admin', 'coach']).defaultTo('user').notNullable()
  })

  // Index pour optimisation
  await knex.schema.alterTable('users', (table) => {
    table.index(['role'], 'idx_users_role')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex(['role'], 'idx_users_role')
  })

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role')
  })
}
