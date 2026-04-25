import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_workouts', (table) => {
   table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Informations de base
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.text('description').nullable();
    
    // Type de WOD
    table.enum('type', [
      'amrap',        // As Many Rounds As Possible
      'for_time',     // For Time
      'emom',         // Every Minute On the Minute
      'tabata',       // Tabata Protocol
      'rounds',       // X Rounds for Time
      'strength',     // Strength Training
      'hero',         // Hero WODs
      'benchmark',    // Benchmark WODs (Fran, Murph, etc.)
      'custom'        // Custom workout
    ]).notNullable();
    
    // Structure du workout
    table.json('structure').notNullable(); // Structure complète du WOD
    table.integer('estimated_duration').nullable(); // en minutes
    table.enum('intensity', ['low', 'moderate', 'high', 'very_high']).notNullable();
    
    // Difficulté et niveau
    table.enum('difficulty', ['beginner', 'intermediate', 'advanced']).notNullable();
    table.json('scaling_options').nullable(); // Options pour différents niveaux
    
    // Matériel requis
    table.json('equipment_required').nullable(); // ['barbell', 'pull_up_bar', 'dumbbells']
    table.boolean('bodyweight_only').defaultTo(false);
    
    // Ciblage
    table.json('muscle_groups_targeted').nullable(); // ['legs', 'back', 'core']
    table.json('energy_systems').nullable(); // ['aerobic', 'anaerobic', 'phosphocreatine']
    
    // IA et personnalisation
    table.boolean('ai_generated').defaultTo(false);
    table.json('ai_parameters').nullable(); // Paramètres utilisés pour la génération IA
    table.uuid('created_by_user_id').nullable()
    .references('id').inTable('users')
    .onDelete('SET NULL');
    
    // Scoring et résultats
    table.enum('scoring_type', [
      'time',         // Temps pour compléter
      'rounds',       // Nombre de rounds
      'reps',         // Nombre de répétitions
      'weight',       // Poids soulevé
      'distance',     // Distance parcourue
      'points'        // Système de points
    ]).nullable();
    
    // Statistiques d'usage
    table.integer('usage_count').defaultTo(0); // Combien de fois utilisé
    table.decimal('average_rating', 3, 2).nullable(); // Note moyenne (0.00 à 10.00)
    table.integer('total_ratings').defaultTo(0); // Nombre total de notes
    
    // Statut et visibilité
    table.boolean('isActive').defaultTo(true);
    table.boolean('isFeatured').defaultTo(false);
    table.boolean('isPublic').defaultTo(true); // Visible par tous ou privé
    
    // Catégories spéciales
    table.boolean('is_benchmark').defaultTo(false); // Fran, Murph, etc.
    table.boolean('is_hero_wod').defaultTo(false); // Hero WODs
    
    // Métadonnées
    table.text('coach_notes').nullable(); // Notes pour les coachs
    table.json('tags').nullable(); // Tags pour filtrer (cardio, strength, etc.)
    
    table.timestamps(true, true);
    
    // Index pour optimisation
    table.index(['type']);
    table.index(['difficulty']);
    table.index(['intensity']);
    table.index(['bodyweight_only']);
    table.index(['ai_generated']);
    table.index(['isActive']);
    table.index(['isFeatured']);
    table.index(['isPublic']);
    table.index(['is_benchmark']);
    table.index(['is_hero_wod']);
    table.index(['scoring_type']);
    table.index(['created_by_user_id']);
    
  });
}

export async function down(knex: Knex): Promise<void> {
await knex.schema.dropTableIfExists('user_workouts');
}