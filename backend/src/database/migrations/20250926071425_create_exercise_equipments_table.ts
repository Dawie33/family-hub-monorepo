import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('exercise_equipments', (table) => {
    table.uuid('exercise_id').notNullable()
      .references('id').inTable('exercises').onDelete('CASCADE');
    table.uuid('equipment_id').notNullable()
      .references('id').inTable('equipments').onDelete('CASCADE');
    table.primary(['exercise_id', 'equipment_id']);
  });

  await knex.schema.alterTable('exercise_equipments', (table) => {
    table.index(['exercise_id'], 'idx_exercise_equipment_ex');
    table.index(['equipment_id'], 'idx_exercise_equipment_eq');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('exercise_equipments');
}
