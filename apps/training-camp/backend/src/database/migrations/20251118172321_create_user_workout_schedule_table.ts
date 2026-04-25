import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_workout_schedule', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Relations
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    table.uuid('workout_id').notNullable()
      .references('id').inTable('workouts').onDelete('CASCADE')

    // Planification
    table.date('scheduled_date').notNullable()

    // Statut de la planification
    table.enum('status', ['scheduled', 'completed', 'skipped', 'rescheduled'])
      .notNullable()
      .defaultTo('scheduled')

    // Lien vers la session si complétée
    table.uuid('completed_session_id').nullable()
      .references('id').inTable('workout_sessions').onDelete('SET NULL')

    // Notes de planification
    table.text('notes').nullable()

    table.timestamps(true, true)

    // Index pour optimisation
    table.index(['user_id', 'scheduled_date'], 'idx_schedule_user_date')
    table.index(['workout_id'], 'idx_schedule_workout')
    table.index(['status'], 'idx_schedule_status')

    // Contrainte unique : un utilisateur ne peut planifier qu'un seul workout par date
    table.unique(['user_id', 'scheduled_date'], { indexName: 'uq_user_date_schedule' })
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_workout_schedule')
}

