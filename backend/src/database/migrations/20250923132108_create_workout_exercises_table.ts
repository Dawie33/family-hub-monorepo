import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workout_exercises', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));    
    // Relations
    table.uuid('workout_id').notNullable()
    .references('id').inTable('workouts')
    .onDelete('CASCADE');
    table.uuid('exercise_id').notNullable()
    .references('id').inTable('exercises')
    .onDelete('CASCADE');
    
    // Structure dans le workout
    table.integer('order_index').notNullable(); // Ordre dans le WOD
    table.string('sets').nullable(); // "3x10", "AMRAP", "21-15-9"
    table.string('reps').nullable(); // "10", "max", "30 seconds"
    table.string('weight').nullable(); // "bodyweight", "50kg", "heavy"
    table.string('distance').nullable(); // "400m", "1km"
    table.string('time').nullable(); // "2 minutes", "30 seconds"
    
    // Instructions spécifiques pour ce workout
    table.text('specific_instructions').nullable();
    table.json('scaling_for_this_workout').nullable();
    
    // Métadonnées
    table.boolean('is_warmup').defaultTo(false);
    table.boolean('is_cooldown').defaultTo(false);
    table.boolean('is_main_workout').defaultTo(true);
    
    table.timestamps(true, true);
    
    // Index
    table.index(['workout_id']);
    table.index(['exercise_id']);
    table.index(['order_index']);
    table.unique(['workout_id', 'exercise_id', 'order_index']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workout_exercises');
}