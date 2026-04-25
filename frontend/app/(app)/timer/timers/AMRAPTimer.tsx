'use client'

import { useEffect, useState, useRef } from 'react'
import { useTimerSounds } from '@/hooks/useTimerSounds'
import { useTimerVibration } from '@/hooks/useTimerVibration'

interface AMRAPTimerProps {
  duration: number
  onComplete?: () => void
  onTimeUpdate?: (time: string) => void
  onRoundsUpdate?: (rounds: number) => void
  soundEnabled?: boolean
}

export function AMRAPTimer({ duration, onComplete, onTimeUpdate, onRoundsUpdate, soundEnabled = true }: AMRAPTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [rounds, setRounds] = useState(0)
  const totalSeconds = duration * 60
  const sounds = useTimerSounds()
  const vibration = useTimerVibration()
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Gérer le countdown de 10 secondes
  useEffect(() => {
    if (countdown === null || countdown === 0) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null

        if (prev <= 1) {
          if (soundEnabled) sounds.playStartSound()
          vibration.vibrateStart()
          setIsRunning(true)
          return null
        }

        if (soundEnabled) sounds.playCountdownBeep()
        vibration.vibrateCountdown()
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, soundEnabled])

  // Gérer le timer principal
  useEffect(() => {
    if (!isRunning || countdown !== null) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1
        const remaining = totalSeconds - next

        // Son d'alerte à 10 secondes de la fin
        if (remaining === 10) {
          if (soundEnabled) sounds.playAlertSound()
          vibration.vibrateAlert()
        }

        // Son de fin
        if (next >= totalSeconds) {
          if (soundEnabled) sounds.playFinishSound()
          vibration.vibrateFinish()
          setIsRunning(false)
          onComplete?.()
          return totalSeconds
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, totalSeconds, onComplete, countdown, soundEnabled])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingSeconds = totalSeconds - elapsedSeconds

  useEffect(() => {
    if (onTimeUpdate) {
      const timeString = formatTime(remainingSeconds)
      onTimeUpdate(timeString)
    }
  }, [remainingSeconds, onTimeUpdate])

  useEffect(() => {
    if (onRoundsUpdate) {
      onRoundsUpdate(rounds)
    }
  }, [rounds, onRoundsUpdate])

  const incrementRound = () => {
    setRounds(prev => prev + 1)
  }

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

  const reset = () => {
    setElapsedSeconds(0)
    setIsRunning(false)
    setCountdown(null)
    setRounds(0)
  }

  const handleStart = () => {
    if (elapsedSeconds === 0 && !isRunning) {
      setCountdown(10)
    } else {
      setIsRunning(!isRunning)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 lg:space-y-8 w-full">
      {/* Afficher le countdown si actif */}
      {countdown !== null && countdown > 0 ? (
        <div className="text-center py-4 lg:py-8">
          <div className="text-xs font-medium text-slate-400 mb-2">Préparez-vous...</div>
          <div className="text-6xl lg:text-8xl font-bold font-mono text-orange-500 animate-pulse">
            {countdown}
          </div>
          <div className="text-sm text-slate-400 mt-2">Get Ready!</div>
        </div>
      ) : (
        <>
          {/* Badge type de timer */}
          <div className="inline-block px-3 lg:px-4 py-1.5 lg:py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="text-orange-400 text-xs lg:text-sm font-semibold tracking-wide">
              AMRAP
            </span>
          </div>

          {/* Main Timer avec anneau de progression */}
          <div className="relative">
            <div className="text-7xl lg:text-[120px] font-bold leading-none tracking-tighter font-mono">
              {formatTime(remainingSeconds)}
            </div>

            {/* Progress Ring - SVG */}
            <svg className="absolute inset-0 -m-4 lg:-m-8 w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] h-[calc(100%+2rem)] lg:h-[calc(100%+4rem)]" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgb(249, 115, 22)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(elapsedSeconds / totalSeconds) * 565} 565`}
                transform="rotate(-90 100 100)"
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Rounds Counter */}
          <div className="bg-slate-800/50 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-slate-700/50 w-full max-w-[200px]">
            <div className="text-slate-400 text-xs lg:text-sm mb-1 text-center">Rounds complétés</div>
            <div className="text-3xl lg:text-4xl font-bold text-orange-400 text-center">{rounds}</div>
            <button
              onClick={incrementRound}
              disabled={!isRunning}
              className="mt-2 lg:mt-3 w-full px-4 lg:px-6 py-1.5 lg:py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm lg:text-base hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Round
            </button>
          </div>

          {/* Cap Time */}
          <div className="text-slate-400 text-base lg:text-lg">
            Durée : <span className="text-white font-semibold">{formatTime(totalSeconds)}</span>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex gap-3 lg:gap-4 justify-center">
            <button
              onClick={handleStart}
              disabled={elapsedSeconds >= totalSeconds}
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg lg:text-xl font-bold">
                {isRunning ? '⏸' : '▶'}
              </span>
            </button>
            <button
              onClick={reset}
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-slate-800 hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-700 active:scale-95"
            >
              <span className="text-lg lg:text-xl">↺</span>
            </button>
          </div>

          {/* Status Messages */}
          {elapsedSeconds >= totalSeconds && (
            <div className="px-4 lg:px-6 py-2 lg:py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="font-semibold text-green-400 text-sm lg:text-base">
                AMRAP Terminé ! {rounds} round{rounds !== 1 ? 's' : ''}
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
