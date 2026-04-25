import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('one_rep_maxes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    // ex.: back_squat, front_squat, deadlift, bench_press, strict_press, clean, snatch...
    table.string('lift').notNullable();

    table.decimal('value', 7, 2).notNullable(); // en kg
    table.date('measured_at').notNullable().defaultTo(knex.fn.now());
    table.enu('source', ['real', 'estimated'], { useNative: true, enumName: 'one_rm_source' })
      .notNullable().defaultTo('real');

    table.unique(['user_id', 'lift'], { useConstraint: true, indexName: 'uq_one_rm_user_lift' });
    table.index(['user_id'], 'idx_one_rm_user');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Supprime la table qui utilise le type
  await knex.schema.dropTableIfExists('one_rep_maxes');
  // Puis supprime le type
  await knex.raw('DROP TYPE IF EXISTS one_rm_source;');
}
