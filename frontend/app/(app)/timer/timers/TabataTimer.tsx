'use client'

import { Play, Pause, RotateCcw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface TabataTimerProps {
  rounds?: number
  workSeconds?: number
  restSeconds?: number
  onComplete?: () => void
  onTimeUpdate?: (time: string) => void
}

export function TabataTimer({
  rounds = 8,
  workSeconds = 20,
  restSeconds = 10,
  onComplete,
  onTimeUpdate
}: TabataTimerProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [secondsInPhase, setSecondsInPhase] = useState(0)
  const [isWorking, setIsWorking] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const totalSeconds = rounds * (workSeconds + restSeconds)
  const cycleSeconds = workSeconds + restSeconds

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSecondsInPhase(prev => {
        const next = prev + 1
        const currentPhaseLength = isWorking ? workSeconds : restSeconds

        if (next >= currentPhaseLength) {
          // Changement de phase
          if (isWorking) {
            // Passage au repos
            setIsWorking(false)
            return 0
          } else {
            // Passage au round suivant
            if (currentRound >= rounds) {
              // Fin du Tabata
              setIsRunning(false)
              onComplete?.()
              return 0
            }
            setCurrentRound(r => r + 1)
            setIsWorking(true)
            return 0
          }
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isWorking, currentRound, rounds, workSeconds, restSeconds, onComplete])

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0')
  }

  const reset = () => {
    setCurrentRound(1)
    setSecondsInPhase(0)
    setIsWorking(true)
    setIsRunning(false)
  }

  const elapsedTotalSeconds = (currentRound - 1) * cycleSeconds + (isWorking ? secondsInPhase : workSeconds + secondsInPhase)
  const progressPercent = (elapsedTotalSeconds / totalSeconds) * 100
  const currentPhaseLength = isWorking ? workSeconds : restSeconds
  const remainingInPhase = currentPhaseLength - secondsInPhase
  const phaseProgressPercent = (secondsInPhase / currentPhaseLength) * 100

  // Mettre à jour le temps pour la vue minimisée
  useEffect(() => {
    if (onTimeUpdate && isRunning) {
      const minutes = Math.floor(remainingInPhase / 60)
      const seconds = remainingInPhase % 60
      onTimeUpdate(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }
  }, [remainingInPhase, isRunning, onTimeUpdate])

  // Gérer le Wake Lock pour empêcher l'écran de se mettre en veille
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isRunning) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.log('Wake Lock error:', err)
      }
    }

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release()
          wakeLockRef.current = null
        } catch (err) {
          console.log('Wake Lock release error:', err)
        }
      }
    }

    if (isRunning) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isRunning])

  const isComplete = currentRound > rounds

  return (
    <div className={`border-2 rounded-xl p-6 space-y-4 transition-colors ${
      isWorking
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-800'
        : 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-300 dark:border-yellow-800'
    }`}>
      {/* Header */}
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground mb-1">Tabata Timer</div>
        <div className="text-4xl font-bold mb-2">
          <span className={isWorking ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
            {isWorking ? '💪 TRAVAIL' : '😌 REPOS'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Round {currentRound} / {rounds}
        </div>
      </div>

      {/* Timer principal */}
      <div className="text-center">
        <div className={`text-8xl font-bold font-mono ${
          isWorking ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
        }`}>
          {formatTime(remainingInPhase)}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          secondes restantes
        </div>
      </div>

      {/* Barre de progression de la phase */}
      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isWorking
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}
          style={{ width: `${phaseProgressPercent}%` }}
        />
      </div>

      {/* Progression totale */}
      <div className="text-center text-sm text-muted-foreground">
        Progression totale: {Math.round(progressPercent)}%
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Prochaine phase */}
      {!isComplete && (
        <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
          Prochain: {isWorking ? `Repos ${restSeconds}s` : `Travail ${workSeconds}s`}
        </div>
      )}

      {/* Contrôles */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={isComplete}
          className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-colors ${
            isWorking
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-muted'
              : 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-muted'
          } disabled:cursor-not-allowed`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {elapsedTotalSeconds > 0 && !isComplete ? 'Reprendre' : 'Démarrer'}
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="px-4 py-3 border-2 border-border hover:bg-accent rounded-lg transition-colors"
          title="Recommencer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {isComplete && (
        <div className="bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-800 rounded-lg p-3 text-center">
          <p className="font-semibold text-green-900 dark:text-green-100">
            🎉 Tabata Terminé ! {rounds} rounds complétés
          </p>
        </div>
      )}
    </div>
  )
}
