import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('strength_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

    table.date('session_date').notNullable()

    // Groupes musculaires ciblés (array JSON : ["shoulders","arms","chest"])
    table.specificType('target_muscles', 'text[]').notNullable()

    table.enum('session_goal', ['strength', 'hypertrophy', 'endurance', 'power']).notNullable().defaultTo('hypertrophy')

    // Équipements disponibles au moment de la génération
    table.jsonb('equipment_used').nullable()

    table.enum('source', ['manual', 'ai_generated']).notNullable().defaultTo('ai_generated')

    // Plan complet généré par l'IA
    table.jsonb('ai_plan').nullable()

    // Séries effectuées : [{ exercise_name, set_number, reps, weight_kg, rpe, notes }]
    table.jsonb('sets_logged').nullable()

    table.integer('perceived_effort').nullable()  // RPE 1-10
    table.integer('duration_minutes').nullable()
    table.text('notes').nullable()

    table.timestamps(true, true)

    table.index(['user_id'], 'idx_strength_sessions_user_id')
    table.index(['session_date'], 'idx_strength_sessions_date')
    table.index(['session_goal'], 'idx_strength_sessions_goal')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('strength_sessions')
}
