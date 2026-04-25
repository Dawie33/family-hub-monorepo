/**
 * Barrel export pour toutes les entités du domaine
 */

export * from './workout'
export * from './workout-history'
export * from './exercise'
export * from './equipment'
export * from './auth'
export * from './benchmark'
export * from './common'

// Export workout-structure séparément pour éviter les conflits avec Exercise
export type { WorkoutBlocks, WorkoutSection, SectionType, Exercise as WorkoutExercise } from './workout-structure'
