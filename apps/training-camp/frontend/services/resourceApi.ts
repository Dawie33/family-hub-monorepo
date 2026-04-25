import { apiClient } from './apiClient'
import type { PaginatedResponse, QueryParams, RequestOptions } from './types'

/**
 * Classe API générique pour les opérations CRUD
 * Fournit des méthodes standards pour interagir avec les ressources REST
 *
 * @template T - Type de la ressource
 * @template CreateDTO - Type du DTO pour créer des ressources (par défaut Partial<T>)
 * @template UpdateDTO - Type du DTO pour mettre à jour des ressources (par défaut Partial<T>)
 *
 * @example
 * ```typescript
 * interface Exercise {
 *   id: string
 *   name: string
 *   category: string
 * }
 *
 */
export class ResourceApi<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  /** Point de terminaison de l'API pour cette ressource */
  protected endpoint: string

  /**
   * Crée une nouvelle instance de ResourceApi
   * @param endpoint Point de terminaison de l'API (ex: '/exercises')
   */
  constructor(endpoint: string) {
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }

  /**
   * Récupère toutes les ressources avec des paramètres de requête optionnels
   * Retourne la réponse complète du backend avec rows et count
   *
   * @param params Paramètres de requête (limit, offset, search, etc.)
   * @param options Options de requête supplémentaires (headers, signal)
   * @returns Promesse contenant { rows: T[], count: number }
   *
   * @example
   * ```typescript
   * // Récupérer tous les exercices
   * const { rows, count } = await exercisesApi.getAll()
   *
   * // Avec pagination et recherche
   * const { rows, count } = await exercisesApi.getAll({
   *   limit: 10,
   *   offset: 0,
   *   search: 'push'
   * })
   * console.log(`${rows.length} résultats sur ${count}`)
   * ```
   */
  async getAll(params?: QueryParams, options?: RequestOptions): Promise<PaginatedResponse<T>> {
    return apiClient.get<PaginatedResponse<T>>(this.endpoint, {
      ...options,
      params: { ...params, ...options?.params },
    })
  }

  /**
   * Récupère une ressource unique par son ID
   *
   * @param id Identifiant de la ressource (string ou number)
   * @param options Options de requête supplémentaires
   * @returns Promesse contenant la ressource
   *
   * @example
   * ```typescript
   * const exercise = await exercisesApi.getOne('123')
   * const exercise = await exercisesApi.getOne(123) // Fonctionne aussi avec number
   * ```
   */
  async getOne(id: string | number, options?: RequestOptions): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`, options)
  }

  /**
   * Crée une nouvelle ressource
   *
   * @param data Données de la ressource à créer
   * @param options Options de requête supplémentaires
   * @returns Promesse contenant la ressource créée
   *
   * @example
   * ```typescript
   * const newExercise = await exercisesApi.create({
   *   name: 'Push-ups',
   *   category: 'Strength',
   *   description: 'Exercise de crossfit'
   * })
   * ```
   */
  async create(data: CreateDTO, options?: RequestOptions): Promise<T> {
    return apiClient.post<T>(this.endpoint, data, options)
  }

  /**
   * Met à jour partiellement une ressource existante (PATCH)
   * Seuls les champs fournis seront mis à jour
   *
   * @param id Identifiant de la ressource à mettre à jour
   * @param data Données partielles à mettre à jour
   * @param options Options de requête supplémentaires
   * @returns Promesse contenant la ressource mise à jour
   *
   * @example
   * ```typescript
   * // Mettre à jour seulement le nom
   * const updated = await exercisesApi.update('123', {
   *   name: 'Diamond Push-ups'
   * })
   * ```
   */
  async update(id: string | number, data: UpdateDTO, options?: RequestOptions): Promise<T> {
    return apiClient.patch<T>(`${this.endpoint}/${id}`, data, options)
  }



  /**
   * Supprime une ressource
   *
   * @param id Identifiant de la ressource à supprimer
   * @param options Options de requête supplémentaires
   * @returns Promesse qui se résout quand la suppression est terminée
   *
   * @example
   * ```typescript
   * await exercisesApi.delete('123')
   * console.log('Exercice supprimé')
   * ```
   */
  async delete(id: string | number, options?: RequestOptions): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`, options)
  }



}

export default ResourceApi
