import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  
  await knex.schema.createTable('users', (table) => {
    // Clé primaire
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Informations de base
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('firstName', 100).notNullable();
    table.string('lastName', 100).notNullable();
    table.date('dateOfBirth').nullable();
    table.enum('gender', ['male', 'female', 'other']).nullable();
    
    // Profil athlétique
    table.enum('sport_level', ['beginner', 'intermediate', 'advanced', 'elite']).defaultTo('beginner');
    table.json('benchmark_results').nullable(); // Résultats des benchmarks
    table.json('personal_records').nullable(); // Records personnels
    
    // Données physiologiques
    table.integer('height').nullable(); // en cm
    table.integer('weight').nullable(); // en kg
    table.integer('resting_heart_rate').nullable(); // BPM
    table.integer('max_heart_rate').nullable(); // BPM
    table.decimal('body_fat_percentage', 4, 1).nullable(); // %
    
    // Objectifs généraux
    table.json('global_goals').nullable(); // { weight_loss: true, endurance: true, strength: true, ... }
    
    // Blessures et limitations (générales)
    table.json('injuries').nullable();
    table.text('medical_notes').nullable();
    table.json('physical_limitations').nullable(); // Restrictions physiques
    
    // Matériel disponible (étendu)
    table.json('equipment_available').nullable(); // Équipement disponible
    table.enum('training_location', ['home', 'gym', 'outdoor', 'mixed']).defaultTo('gym');
    
    // Préférences générales
    table.json('training_preferences').nullable(); // Durée, intensité, fréquence
    table.json('schedule_preferences').nullable(); // Jours, heures préférées
    
    // Statut du compte
    table.boolean('isActive').defaultTo(true);
    table.boolean('emailVerified').defaultTo(false);
    table.timestamp('lastLoginAt').nullable();
    
    // Coaching et programmes
    table.boolean('has_coach').defaultTo(false);
    table.integer('coach_id').unsigned().nullable(); // Référence coach
    table.boolean('premium_member').defaultTo(false);
    
    // Timestamps automatiques
    table.timestamps(true, true);
    
    // Index pour optimisation
    table.index(['email']);
    table.index(['sport_level']);
    table.index(['isActive']);
    table.index(['premium_member']);
  });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users');
  await knex.schema.raw('DROP EXTENSION IF EXISTS pgcrypto');
}