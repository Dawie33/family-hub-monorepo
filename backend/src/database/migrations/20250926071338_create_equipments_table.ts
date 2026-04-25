import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable('equipments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('slug').notNullable().unique();   // ex: 'barbell', 'kettlebell', 'rings', 'rower'
    table.string('label').notNullable();           // ex: 'Barre olympique', 'Kettlebell', 'Anneaux'
    table.jsonb('meta').notNullable().defaultTo('{}'); // ex: {brand:null, notes:null}
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('equipments', (table) => {
    table.index(['slug'], 'idx_equipments_slug');
  });

}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('equipments');
}
