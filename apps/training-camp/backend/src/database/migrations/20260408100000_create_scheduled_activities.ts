import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('scheduled_activities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.date('scheduled_date').notNullable()
    table.enum('activity_type', ['hyrox', 'running', 'athx']).notNullable()
    // Référence polymorphique vers la session du module correspondant (hyrox_sessions, running_sessions, athx_sessions)
    // Pas de FK contrainte car les tables n'existent pas encore — sera ajouté lors de la migration de chaque module
    table.uuid('activity_id').nullable()
    table.enum('status', ['scheduled', 'completed', 'skipped', 'rescheduled']).notNullable().defaultTo('scheduled')
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index(['user_id'], 'idx_scheduled_activities_user_id')
    table.index(['scheduled_date'], 'idx_scheduled_activities_date')
    table.index(['user_id', 'scheduled_date'], 'idx_scheduled_activities_user_date')
    table.index(['activity_type'], 'idx_scheduled_activities_type')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('scheduled_activities')
}
