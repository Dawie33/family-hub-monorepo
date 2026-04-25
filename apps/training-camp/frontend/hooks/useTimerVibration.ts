'use client'

import { useCallback } from 'react'

/**
 * Hook pour gérer les vibrations des timers
 * Utilise l'API Vibration du navigateur
 */
export function useTimerVibration() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  // Vibration courte pour le countdown
  const vibrateCountdown = useCallback(() => vibrate(50), [vibrate])

  // Vibration pour le démarrage (pattern montant)
  const vibrateStart = useCallback(() => vibrate([100, 50, 100, 50, 200]), [vibrate])

  // Vibration pour la fin (pattern long)
  const vibrateFinish = useCallback(() => vibrate([200, 100, 200, 100, 400]), [vibrate])

  // Vibration d'alerte
  const vibrateAlert = useCallback(() => vibrate([100, 50, 100]), [vibrate])

  return {
    vibrateCountdown,
    vibrateStart,
    vibrateFinish,
    vibrateAlert
  }
}
