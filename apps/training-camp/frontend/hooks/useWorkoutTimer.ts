import { createContext, useContext } from "react"

export type TimerType = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA'

export interface AMRAPRound {
    duration: number
    rest: number
}

export interface TabataRound {
    round: number
    rest: number
}

export interface EmomRound {
    round: number
    rest: number
}

export interface ForTimeRound {
    round: number
    rest: number
}

export interface TimerConfig {
    timeCap?: number
    duration?: number
    rounds?: number
    workSeconds?: number
    restSeconds?: number
    intervalMinutes?: number
    amrapRounds?: AMRAPRound[]
    tabataRound?: TabataRound
    emomRound?: EmomRound
    forTimeRound?: ForTimeRound
    isDeathBy?: boolean
    noTimeCap?: boolean
}

export type TimerState = 'badge' | 'menu' | 'config' | 'running' | 'minimized'

export interface WorkoutTimerState {
    state: TimerState
    timerType: TimerType | null
    timerConfig: TimerConfig
}

export interface WorkoutTimerContextType extends WorkoutTimerState {
    openMenu: () => void
    selectTimerType: (type: TimerType) => void
    startTimer: (config: TimerConfig) => void
    stopTimer: () => void
    closeTimer: () => void
    goBackToMenu: () => void
    minimizeTimer: () => void
    maximizeTimer: () => void
}

export const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(undefined)

/**
 * Récupère le context du timer de workout.
 * @returns {WorkoutTimerContextType} - Le context du timer de workout.
 * @throws {Error} - Si le context n'est pas défini.
 */
export const useWorkoutTimer = () => {
    const context = useContext(WorkoutTimerContext)
    if (!context) {
        throw new Error('useWorkoutTimer must be used within a WorkoutTimerProvider')
    }
    return context
}
