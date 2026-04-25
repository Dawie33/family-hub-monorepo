import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('athx_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.uuid('scheduled_activity_id').nullable().references('id').inTable('scheduled_activities').onDelete('SET NULL')

    table.date('session_date').notNullable()
    table.enum('session_type', ['full_competition', 'strength_prep', 'endurance_prep', 'metcon_prep', 'mixed']).notNullable()
    table.enum('source', ['manual', 'ai_generated']).notNullable().defaultTo('manual')

    table.integer('duration_minutes').nullable()
    table.integer('perceived_effort').nullable()   // RPE 1-10

    // Résultats par zone ATHX (stockés en JSON)
    // { strength: { score: "...", notes: "..." }, endurance: {...}, metcon: {...} }
    table.jsonb('zone_results').nullable()

    // Plan IA généré
    table.jsonb('ai_plan').nullable()

    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index(['user_id'], 'idx_athx_sessions_user_id')
    table.index(['session_date'], 'idx_athx_sessions_date')
    table.index(['session_type'], 'idx_athx_sessions_type')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('athx_sessions')
}
