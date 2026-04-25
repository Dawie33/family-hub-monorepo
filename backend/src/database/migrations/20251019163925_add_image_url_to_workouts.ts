import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workouts', (table) => {
    table.string('image_url').nullable().comment('URL de l\'image du workout (Unsplash ou autre)');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workouts', (table) => {
    table.dropColumn('image_url');
  });
}

