import { BenchmarkResultDto } from './dto/workout.dto'

/**
 * Valide et retourne un niveau utilisateur valide
 * @param level Niveau à valider
 * @returns Niveau valide ou 'beginner' par défaut
 */
export function validateLevel(level: string): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'elite'] as const
    type ValidLevel = typeof validLevels[number]

    if (validLevels.includes(level as ValidLevel)) {
        return level as ValidLevel
    }
    return 'beginner'
}

/**
 * Calcule le niveau de l'utilisateur basé sur les résultats du benchmark
 * Cette fonction utilise des standards de référence pour déterminer le niveau
 * @param workoutName Nom du workout benchmark
 * @param result Résultat du benchmark
 * @param currentLevel Niveau actuel de l'utilisateur
 * @returns Niveau calculé
 */
export function calculateLevelFromBenchmarks(
    workoutName: string,
    result: BenchmarkResultDto,
    currentLevel: string
): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
    // Standards de référence pour les benchmarks
    const benchmarkStandards: Record<string, {
        elite: number,
        advanced: number,
        intermediate: number,
        beginner: number,
        metric: 'rounds' | 'time' | 'distance' | 'weight' | 'power'
    }> = {
        // ===== CROSSFIT =====
        'Cindy': { elite: 30, advanced: 20, intermediate: 15, beginner: 0, metric: 'rounds' },
        'Fran': { elite: 180, advanced: 360, intermediate: 600, beginner: 999999, metric: 'time' },
        'Helen': { elite: 480, advanced: 720, intermediate: 900, beginner: 999999, metric: 'time' },
        'Grace': { elite: 180, advanced: 420, intermediate: 720, beginner: 999999, metric: 'time' },
    }

    const standard = benchmarkStandards[workoutName]
    if (!standard) {
        // Si pas de standard défini, garder le niveau actuel
        return validateLevel(currentLevel)
    }

    // Déterminer la valeur selon le type de métrique
    let value: number | undefined
    switch (standard.metric) {
        case 'rounds':
            value = result.rounds !== undefined ? result.rounds + (result.reps || 0) / 100 : undefined
            break
        case 'time':
            value = result.time_seconds
            break
        case 'distance':
            value = result.rounds // Pour Cooper Test, on stocke la distance en mètres dans rounds
            break
        case 'weight':
            value = result.weight
            break
        case 'power':
            value = result.weight // Pour FTP, on stocke la puissance en watts dans weight
            break
    }

    if (value === undefined) {
        // Si pas de valeur disponible, garder le niveau actuel
        return validateLevel(currentLevel)
    }

    // Calculer le niveau selon le type de métrique
    if (standard.metric === 'rounds' || standard.metric === 'distance' || standard.metric === 'weight' || standard.metric === 'power') {
        // Plus c'est élevé, mieux c'est
        if (value >= standard.elite) return 'elite'
        if (value >= standard.advanced) return 'advanced'
        if (value >= standard.intermediate) return 'intermediate'
        return 'beginner'
    } else {
        // Pour "time", moins c'est élevé, mieux c'est
        if (value <= standard.elite) return 'elite'
        if (value <= standard.advanced) return 'advanced'
        if (value <= standard.intermediate) return 'intermediate'
        return 'beginner'
    }
}
