/**
 * Types communs partages dans toute l'application
 */

/**
 * Format de reponse paginee standard retourne par le backend
 * @template T Type des elements dans le tableau de donnees
 */
export interface PaginatedResponse<T> {
  rows: T[]
  count: number
}

/**
 * Paramatres de requete standards pour les operations de liste
 */
export interface QueryParams {
  limit?: number
  offset?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}
