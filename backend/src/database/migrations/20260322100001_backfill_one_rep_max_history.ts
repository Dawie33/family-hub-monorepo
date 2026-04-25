import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const existing = await knex('one_rep_maxes').select('user_id', 'lift', 'value', 'source', 'measured_at')
  if (existing.length > 0) {
    await knex('one_rep_max_history').insert(
      existing.map((row) => ({
        user_id: row.user_id,
        lift: row.lift,
        value: row.value,
        source: row.source,
        measured_at: row.measured_at,
      })),
    )
  }
}

export async function down(knex: Knex): Promise<void> {
  // Pas de rollback sur un backfill
}
