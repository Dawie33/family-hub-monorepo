import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workouts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Informations de base
    table.string('name').nullable();
    table.string('slug').nullable().unique();
    table.text('description').nullable();

    // Type de workout
    table.string('workout_type').nullable(); // amrap, for_time, interval, endurance, strength, fartlek, tempo, etc.

    // Structure du workout
    table.jsonb('blocks').nullable(); // warmup, main, cooldown
    table.integer('estimated_duration').nullable(); // en minutes
    table.string('intensity').nullable(); // low, moderate, high, very_high, recovery, tempo, threshold, vo2max

    // Difficulté et niveau
    table.string('difficulty').nullable(); // beginner, intermediate, advanced
    table.json('scaling_options').nullable(); // Options pour adapter le workout

    // Matériel/équipement requis
    table.json('equipment_required').nullable(); // bike, shoes, weights, pool, etc.

    // Ciblage
    table.json('focus_areas').nullable(); // endurance, speed, power, technique, etc.
    table.json('metrics_tracked').nullable(); // distance, pace, heart_rate, power, cadence, etc.
    
    // IA et personnalisation
    table.boolean('ai_generated').defaultTo(false);
    table.json('ai_parameters').nullable(); // Paramètres utilisés pour la génération IA
    table.uuid('created_by_user_id').nullable()
    .references('id').inTable('users')
    .onDelete('SET NULL');
    // Objectifs et résultats
    table.json('target_metrics').nullable(); // {distance: 10km, pace: '5:00/km', duration: 3600, power: 250, etc.}
    
    // Statistiques d'usage
    table.integer('usage_count').defaultTo(0); // Combien de fois utilisé
    table.decimal('average_rating', 3, 2).nullable(); // Note moyenne (0.00 à 10.00)
    table.integer('total_ratings').defaultTo(0); // Nombre total de notes
    
    // Statut et visibilité
    table.boolean('isActive').defaultTo(true);
    table.boolean('isFeatured').defaultTo(false);
    table.boolean('isPublic').defaultTo(true); // Visible par tous ou privé
    table.string('status').defaultTo('published'); // draft, published, archived

    // Planification
    table.date('scheduled_date').nullable(); // Date de planification du workout

    // Catégories spéciales
    table.boolean('is_benchmark').defaultTo(false); // Workouts de référence (ex: FTP test, 5k time trial, Fran, etc.)
    
    // Métadonnées
    table.text('coach_notes').nullable(); // Notes pour les coachs
    table.json('tags').nullable(); // Tags pour filtrer (cardio, strength, etc.)
    
    table.timestamps(true, true);

    // Contrainte unique pour éviter les doublons de workouts journaliers
    table.unique(['scheduled_date']);

    // Index pour optimisation
    table.index(['workout_type']);
    table.index(['difficulty']);
    table.index(['intensity']);
    table.index(['ai_generated']);
    table.index(['isActive']);
    table.index(['isFeatured']);
    table.index(['isPublic']);
    table.index(['is_benchmark']);
    table.index(['created_by_user_id']);
    table.index(['scheduled_date']);
    table.index(['status']);
   });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workouts');
}