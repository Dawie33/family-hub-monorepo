'use client'

import { useState } from 'react'
import { TimerConfig, TimerState, TimerType, WorkoutTimerContext } from '../hooks/useWorkoutTimer'

/**
* Un fournisseur pour le contexte WorkoutTimerContext, qui gère l'état d'un
* minuteur d'entraînement et fournit des fonctions pour mettre à jour cet état.
*
* @param {React.ReactNode} children - Les enfants du fournisseur
* @returns {JSX.Element} - L'élément fournisseur
 */

export function WorkoutTimerProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<TimerState>('badge')
    const [timerType, setTimerType] = useState<TimerType | null>(null)
    const [timerConfig, setTimerConfig] = useState<TimerConfig>({})

    const openMenu = () => setState('menu')

    const selectTimerType = (type: TimerType) => {
        setTimerType(type)
        setState('config')
    }

    const startTimer = (config: TimerConfig) => {
        setTimerConfig(config)
        setState('running')
    }

    const stopTimer = () => {
        setState('badge')
        setTimerType(null)
        setTimerConfig({})
    }

    const closeTimer = () => {
        setState('badge')
        setTimerType(null)
        setTimerConfig({})
    }

    const goBackToMenu = () => {
        setState('menu')
        setTimerType(null)
    }

    const minimizeTimer = () => {
        setState('minimized')
    }

    const maximizeTimer = () => {
        setState('running')
    }

    return (
        <WorkoutTimerContext.Provider
            value={{
                state,
                timerType,
                timerConfig,
                openMenu,
                selectTimerType,
                startTimer,
                stopTimer,
                closeTimer,
                goBackToMenu,
                minimizeTimer,
                maximizeTimer
            }}
        >
            {children}
        </WorkoutTimerContext.Provider>
    )
}

