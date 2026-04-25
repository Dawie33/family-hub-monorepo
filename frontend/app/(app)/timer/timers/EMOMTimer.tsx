'use client'

import { ChevronRight } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useTimerSounds } from '@/hooks/useTimerSounds'

interface EMOMTimerProps {
  durationMin: number
  intervalMin?: number
  onComplete?: () => void
  onTimeUpdate?: (time: string) => void
}

export function EMOMTimer({ durationMin, intervalMin = 1, onComplete, onTimeUpdate }: EMOMTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const sounds = useTimerSounds()
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const totalSeconds = durationMin * 60
  const intervalSeconds = intervalMin * 60
  const currentRound = Math.floor(elapsedSeconds / intervalSeconds) + 1
  const totalRounds = Math.ceil(totalSeconds / intervalSeconds)
  const roundElapsed = elapsedSeconds % intervalSeconds
  const roundRemaining = intervalSeconds - roundElapsed

  const label = intervalMin === 1 ? 'EMOM' : `E${intervalMin}MOM`

  // Countdown de départ (10s)
  useEffect(() => {
    if (countdown === null || countdown === 0) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          sounds.playStartSound()
          setIsRunning(true)
          return null
        }
        sounds.playCountdownBeep()
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  // Timer principal
  useEffect(() => {
    if (!isRunning || countdown !== null) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1
        const nextRoundElapsed = next % intervalSeconds
        const remainingInRound = intervalSeconds - nextRoundElapsed

        // Alerte 10s avant la fin du round
        if (remainingInRound === 10 && next < totalSeconds) {
          sounds.playAlertSound()
        }

        // Son de nouveau round
        if (nextRoundElapsed === 0 && next < totalSeconds) {
          sounds.playRoundSound()
        }

        // Fin du workout
        if (next >= totalSeconds) {
          sounds.playFinishSound()
          setIsRunning(false)
          onComplete?.()
          return totalSeconds
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, totalSeconds, onComplete, countdown, intervalSeconds])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (onTimeUpdate) onTimeUpdate(formatTime(roundRemaining))
  }, [roundRemaining, onTimeUpdate])

  // Wake lock
  useEffect(() => {
    const request = async () => {
      try {
        if ('wakeLock' in navigator && isRunning) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch { /* ignore */ }
    }
    const release = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
    if (isRunning) request()
    else release()
    return () => { release() }
  }, [isRunning])

  const reset = () => {
    setElapsedSeconds(0)
    setIsRunning(false)
    setCountdown(null)
  }

  const handleStart = () => {
    if (elapsedSeconds === 0 && !isRunning) {
      setCountdown(10)
    } else {
      setIsRunning(!isRunning)
    }
  }

  const skipToNextRound = () => {
    setElapsedSeconds(currentRound * intervalSeconds)
  }

  const ringProgress = (roundElapsed / intervalSeconds) * 565
  const totalProgress = (elapsedSeconds / totalSeconds) * 100
  const isComplete = elapsedSeconds >= totalSeconds

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 lg:space-y-8 w-full">
      {/* Countdown de départ */}
      {countdown !== null && countdown > 0 ? (
        <div className="text-center py-4 lg:py-8">
          <div className="text-xs font-medium text-slate-400 mb-2">Préparez-vous...</div>
          <div className="text-6xl lg:text-8xl font-bold font-mono text-purple-500 animate-pulse">
            {countdown}
          </div>
          <div className="text-sm text-slate-400 mt-2">Get Ready!</div>
        </div>
      ) : (
        <>
          {/* Badge label */}
          <div className="inline-block px-3 lg:px-4 py-1.5 lg:py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <span className="text-purple-400 text-xs lg:text-sm font-semibold tracking-wide">
              {label}
            </span>
          </div>

          {/* Indicateur de round */}
          <div className="text-slate-400 text-base lg:text-lg">
            Round{' '}
            <span className="text-white font-bold text-xl lg:text-2xl">{currentRound}</span>
            {' '}/ {totalRounds}
          </div>

          {/* Timer principal avec anneau SVG (temps restant dans le round) */}
          <div className="relative">
            <div className="text-7xl lg:text-[120px] font-bold leading-none tracking-tighter font-mono text-purple-400">
              {formatTime(roundRemaining)}
            </div>

            <svg
              className="absolute inset-0 -m-4 lg:-m-8 w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] h-[calc(100%+2rem)] lg:h-[calc(100%+4rem)]"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${ringProgress} 565`}
                transform="rotate(-90 100 100)"
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Progression totale */}
          <div className="w-full space-y-1 px-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Total : {formatTime(elapsedSeconds)}</span>
              <span>{formatTime(totalSeconds)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-purple-500/50 transition-all duration-1000 ease-linear"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex gap-3 lg:gap-4 justify-center">
            <button
              onClick={handleStart}
              disabled={isComplete}
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-purple-500 hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg lg:text-xl font-bold">
                {isRunning ? '⏸' : '▶'}
              </span>
            </button>

            {isRunning && currentRound < totalRounds && (
              <button
                onClick={skipToNextRound}
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-slate-800 hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-700 active:scale-95"
                title="Round suivant"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            )}

            <button
              onClick={reset}
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-slate-800 hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-700 active:scale-95"
              title="Recommencer"
            >
              <span className="text-lg lg:text-xl">↺</span>
            </button>
          </div>

          {/* Statut */}
          {isComplete && (
            <div className="px-4 lg:px-6 py-2 lg:py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="font-semibold text-green-400 text-sm lg:text-base">
                🎉 {label} Terminé ! {totalRounds} rounds complétés
              </p>
            </div>
          )}

          {!isRunning && elapsedSeconds === 0 && (
            <div className="text-slate-500 text-xs lg:text-sm">
              Appuyez sur play pour démarrer
            </div>
          )}
        </>
      )}
    </div>
  )
}
