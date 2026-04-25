// ============================================================================
// TYPES TECHNIQUES DE L'API
// ============================================================================


// Re-export common types for API convenience
export type { PaginatedResponse, QueryParams } from '@/domain/entities/common'

/**
 * Configuration du client API
 */
export interface ApiClientConfig {
  /** URL de base de l'API (par défaut: process.env.NEXT_PUBLIC_API_URL) */
  baseURL?: string
  /** En-têtes HTTP par défaut à inclure dans chaque requête */
  headers?: Record<string, string>
}

/**
 * Options pour les requêtes HTTP
 */
export interface RequestOptions {
  /** Paramètres de requête (query params) à ajouter à l'URL */
  params?: Record<string, string | number | boolean | undefined>
  /** En-têtes HTTP spécifiques à cette requête */
  headers?: Record<string, string>
  /** Signal d'annulation pour interrompre la requête */
  signal?: AbortSignal
}













