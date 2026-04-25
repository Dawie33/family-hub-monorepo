import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('exercises', (table) => {
   table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Informations de base
    table.string('name').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.text('description').nullable();
    table.text('instructions').nullable();
    
    // Catégorisation
    table.enum('category', [
      'strength', 'cardio', 'gymnastics', 'olympic_lifting', 
      'powerlifting', 'endurance', 'mobility'
    ]).notNullable();
    
    table.json('muscle_groups').nullable();
    
    // Difficulté et scaling
    table.enum('difficulty', ['beginner', 'intermediate', 'advanced']).notNullable();
    table.json('scaling_options').nullable();
    
    // Matériel requis
    table.json('equipment_required').nullable();
    table.boolean('bodyweight_only').defaultTo(false);
    
    // Métriques
    table.enum('measurement_type', [
      'reps', 'time', 'distance', 'weight', 'calories'
    ]).notNullable();
    
    // Sécurité
    table.json('contraindications').nullable();
    table.text('safety_notes').nullable();
    
    // Média
    table.string('video_url').nullable();
    table.string('image_url').nullable();
    // Métadonnées
    table.boolean('isActive').defaultTo(true);
    table.timestamps(true, true);
    
    // Index
    table.index(['category']);
    table.index(['difficulty']);
    table.index(['bodyweight_only']);
    table.index(['isActive']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('exercises');
}