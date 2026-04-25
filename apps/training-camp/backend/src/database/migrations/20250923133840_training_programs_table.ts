import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('training_programs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Informations de base
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.text('description').nullable();
    table.text('objectives').nullable(); // Objectifs du programme
    
    // Niveau cible
    table.enum('target_level', ['beginner', 'intermediate', 'advanced', 'elite']).notNullable();
    
    // Structure temporelle
    table.integer('duration_weeks').notNullable(); // Durée en semaines
    table.integer('sessions_per_week').notNullable(); // Séances par semaine
    table.integer('estimated_session_duration').nullable(); // Durée moyenne par séance (min)
    
    // Type de programme
    table.enum('program_type', [
      'strength_building',    // Développement de la force
      'endurance_base',      // Base d'endurance
      'competition_prep',    // Préparation compétition
      'rehabilitation',      // Réhabilitation
      'weight_loss',         // Perte de poids
      'maintenance',         // Maintien
      'peaking',            // Pic de forme
      'off_season'          // Intersaison
    ]).notNullable();
    
    // Intensité et volume
    table.enum('intensity_profile', ['low', 'moderate', 'high', 'variable']).notNullable();
    table.enum('volume_profile', ['low', 'moderate', 'high', 'progressive']).notNullable();
    
    // Prérequis
    table.json('prerequisites').nullable(); // Niveau minimum, équipement requis
    table.json('equipment_required').nullable(); // Matériel nécessaire
    
    // Contenu structuré
    table.json('weekly_structure').notNullable(); // Structure semaine type
    table.json('progression_scheme').nullable(); // Schéma de progression
    table.json('testing_schedule').nullable(); // Tests d'évaluation planifiés
    
    // Personnalisation
    table.boolean('is_customizable').defaultTo(true); // Peut être adapté
    table.json('customization_options').nullable(); // Options de personnalisation
    
    // Créateur et statut
    table.integer('created_by_coach_id').unsigned().nullable(); // Coach créateur
    table.enum('program_status', ['draft', 'active', 'archived']).defaultTo('active');
    table.boolean('is_premium').defaultTo(false);
    table.boolean('is_featured').defaultTo(false);
    
    // Statistiques
    table.integer('enrollment_count').defaultTo(0); // Nb d'inscrits
    table.decimal('average_rating', 3, 2).nullable(); // Note moyenne
    table.integer('completion_rate').nullable(); // Taux de completion %
    
    table.timestamps(true, true);
    
 
    
    // Index
    table.index(['target_level']);
    table.index(['program_type']);
    table.index(['program_status']);
    table.index(['is_premium']);
    table.index(['is_featured']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('training_programs');
}