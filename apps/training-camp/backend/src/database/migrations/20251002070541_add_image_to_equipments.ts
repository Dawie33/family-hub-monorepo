import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('equipments', (table) => {
    table.string('image_url').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('equipments', (table) => {
    table.dropColumn('image_url');
  });
}
