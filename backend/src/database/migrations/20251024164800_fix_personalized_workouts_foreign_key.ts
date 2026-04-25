import { Knex } from 'knex'

// No-op : la table personalized_workouts est déjà créée avec la bonne structure
export async function up(_knex: Knex): Promise<void> {}
export async function down(_knex: Knex): Promise<void> {}
