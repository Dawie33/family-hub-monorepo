
// ============================================================================
// Exercices API

import { CreateExerciseDTO, Exercise, UpdateExerciseDTO } from "@/domain/entities/exercise"
import ResourceApi from "./resourceApi"

// ============================================================================
export const exercisesApi = new ResourceApi<Exercise, CreateExerciseDTO, UpdateExerciseDTO>(
    '/exercises'
)

export async function getExercises(params?: {
    limit?: number
    offset?: number
    search?: string
    orderBy?: string
    orderDir?: 'asc' | 'desc'
}) {
    return exercisesApi.getAll(params)
}

export async function getExercise(id: string): Promise<Exercise> {
    return exercisesApi.getOne(id)
}

export async function getExerciseByName(name: string): Promise<Exercise> {
    // Utiliser l'endpoint spécifique by-name au lieu de l'endpoint par ID
    const apiClient = await import('./apiClient').then(m => m.apiClient)
    return apiClient.get<Exercise>(`/exercises/by-name/${encodeURIComponent(name)}`)
}

export async function createExercise(data: CreateExerciseDTO): Promise<Exercise> {
    return exercisesApi.create(data)
}

export async function updateExercise(id: string, data: UpdateExerciseDTO): Promise<Exercise> {
    return exercisesApi.update(id, data)
}

export async function deleteExercise(id: string): Promise<void> {
    return exercisesApi.delete(id)
}

