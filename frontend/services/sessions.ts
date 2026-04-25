import { WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate } from '@/domain/entities/workout'
import apiClient from './apiClient'
import ResourceApi from './resourceApi'
import type { QueryParams } from './types'

export interface WodAnalysis {
  summary: string
  performance_level: 'pr' | 'above_average' | 'average' | 'below_average' | 'first_time'
  comparison: string | null
  strengths: string[]
  improvements: string[]
  next_steps: string
}

export const sessionApi = new ResourceApi<WorkoutSession>('/workout-sessions')

export class SessionService {

  /**
   * Démarre une nouvelle session de workout
   * @param data Données de la session à créer
   * @returns Promesse contenant la session créée
   */
  async startSession(data: WorkoutSessionCreate): Promise<WorkoutSession> {
    return apiClient.post<WorkoutSession>('/workout-sessions', data)
  }

  /**
   * Met à jour une session de workout
   * @param sessionId ID de la session
   * @param data Données à mettre à jour
   * @returns Promesse contenant la session mise à jour
   */
  async updateSession(sessionId: string, data: WorkoutSessionUpdate): Promise<WorkoutSession> {
    return apiClient.patch<WorkoutSession>(`/workout-sessions/${sessionId}`, data)
  }

  /**
   * Récupère toutes les sessions d'un utilisateur avec pagination.
   * Retourne la réponse complète du backend avec rows et count.
   *
   * @param params Paramètres de pagination (limit, offset)
   * @returns Promesse contenant { rows: WorkoutSession[], count: number }
   */
  async getAll(params?: QueryParams) {
    return sessionApi.getAll(params)
  }

  /**
   * Récupère une session de workout par son ID
   * @param sessionId ID de la session
   * @returns Promesse contenant la session
   */
  async getSession(sessionId: string): Promise<WorkoutSession> {
    return apiClient.get<WorkoutSession>(`/workout-sessions/${sessionId}`)
  }

  /**
   * Récupère toutes les sessions pour un workout spécifique
   * @param workoutId ID du workout
   * @returns Promesse contenant les sessions du workout
   */
  async getByWorkoutId(workoutId: string): Promise<WorkoutSession[]> {
    return apiClient.get<WorkoutSession[]>(`/workout-sessions/workout/${workoutId}`)
  }

  /**
   * Supprime une session de workout
   * @param sessionId ID de la session à supprimer
   * @returns Promesse qui renvoie void une fois la session supprimée
   */
  async deleteSession(sessionId: string): Promise<void> {
    return sessionApi.delete(sessionId)
  }

  async analyzeSession(sessionId: string, force = false): Promise<WodAnalysis> {
    const url = force
      ? `/workout-sessions/${sessionId}/analyze?force=true`
      : `/workout-sessions/${sessionId}/analyze`
    return apiClient.post<WodAnalysis>(url, {})
  }
}

export const sessionService = new SessionService()
