import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_equipments', (table) => {
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.uuid('equipment_id').notNullable()
      .references('id').inTable('equipments').onDelete('CASCADE');
    table.boolean('available').notNullable().defaultTo(true); // permet de décocher temporairement
    table.jsonb('meta').notNullable().defaultTo('{}');        // ex: paires de DB (2x22.5), KB sizes, etc.
    table.primary(['user_id', 'equipment_id']);
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('user_equipments', (table) => {
    table.index(['user_id'], 'idx_user_equipments_user');
    table.index(['equipment_id'], 'idx_user_equipments_equipment');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_equipments');
}
