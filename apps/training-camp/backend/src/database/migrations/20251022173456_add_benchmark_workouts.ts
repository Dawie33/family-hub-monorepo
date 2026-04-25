import type { Knex } from "knex";

/**
 * Migration obsolète - Les benchmarks pour Running, Cycling et Musculation
 * ont été supprimés car l'application est maintenant spécialisée CrossFit uniquement.
 * Les benchmarks CrossFit sont gérés dans le seed 05_workouts_seed.ts
 */

export async function up(_knex: Knex): Promise<void> {
  // Migration vidée - seul CrossFit est supporté
  // Les benchmarks CrossFit (Cindy, Fran, Helen, DT) sont dans les seeds
}

export async function down(_knex: Knex): Promise<void> {
  // Rien à faire
}
