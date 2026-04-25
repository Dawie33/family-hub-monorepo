import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_program_enrollments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Relations
    table.uuid('user_id').notNullable()
    .references('id').inTable('users')
    .onDelete('CASCADE');
    table.uuid('program_id').notNullable()
    .references('id').inTable('training_programs')
    .onDelete('CASCADE');

    // Dates importantes
    table.timestamp('enrolled_at').notNullable();
    table.timestamp('started_at').nullable(); // Début effectif
    table.timestamp('planned_end_at').nullable(); // Fin prévue
    table.timestamp('completed_at').nullable(); // Fin effective
    
    // Statut
    table.enum('status', [
      'enrolled',     // Inscrit mais pas commencé
      'active',       // En cours
      'paused',       // Mis en pause
      'completed',    // Terminé avec succès
      'abandoned',    // Abandonné
      'expired'       // Expiré
    ]).defaultTo('enrolled');
    
    // Progression
    table.integer('current_week').defaultTo(1); // Semaine actuelle
    table.integer('completed_sessions').defaultTo(0); // Sessions complétées
    table.integer('total_sessions').notNullable(); // Total sessions du programme
    table.decimal('completion_percentage', 5, 2).defaultTo(0); // % completion
    
    // Personnalisation appliquée
    table.json('customizations_applied').nullable(); // Adaptations faites
    table.json('schedule_adjustments').nullable(); // Ajustements planning
    
    // Performance et suivi
    table.json('initial_assessments').nullable(); // Tests initiaux
    table.json('progress_assessments').nullable(); // Tests de progression
    table.json('final_assessments').nullable(); // Tests finaux
    
    // Feedback
    table.integer('program_rating').nullable(); // Note finale du programme
    table.text('program_feedback').nullable(); // Commentaires sur le programme
    table.json('weekly_feedback').nullable(); // Feedback par semaine
    
    // Auto-pause/reprise
    table.timestamp('last_pause_at').nullable();
    table.text('pause_reason').nullable();
    table.integer('total_paused_days').defaultTo(0);
    
    table.timestamps(true, true);
    
    // Contraintes
    table.unique(['user_id', 'program_id', 'enrolled_at']); // Un user peut refaire le même programme
    
    // Index
    table.index(['user_id']);
    table.index(['program_id']);
    table.index(['status']);
    table.index(['current_week']);
    table.index(['enrolled_at']);
    table.index(['started_at']);
    table.index(['completed_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_program_enrollments');
}