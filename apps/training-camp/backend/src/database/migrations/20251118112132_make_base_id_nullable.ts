import { Knex } from 'knex'

// No-op : base_id est déjà nullable dans la migration originale
export async function up(_knex: Knex): Promise<void> {}
export async function down(_knex: Knex): Promise<void> {}
