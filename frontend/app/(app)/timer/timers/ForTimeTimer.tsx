'use client'

import { useState, useEffect, useRef } from 'react'
import { useTimerSounds } from '@/hooks/useTimerSounds'

interface ForTimeTimerProps {
  capMin?: number
  onComplete?: () => void
  onTimeUpdate?: (time: string) => void
}

export function ForTimeTimer({ capMin, onComplete, onTimeUpdate }: ForTimeTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const sounds = useTimerSounds()
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Gérer le countdown de 10 secondes
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

  // Gérer le timer principal
  useEffect(() => {
    if (!isRunning || countdown !== null) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1
        if (capMin && next >= capMin * 60) {
          setIsRunning(false)
          onComplete?.()
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, capMin, onComplete, countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (onTimeUpdate) {
      const timeString = formatTime(elapsedSeconds)
      onTimeUpdate(timeString)
    }
  }, [elapsedSeconds, onTimeUpdate])

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
    setIsFinished(false)
    setCountdown(null)
  }

  const handleStart = () => {
    if (elapsedSeconds === 0 && !isRunning && !isFinished) {
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
              FOR TIME
            </span>
          </div>

          {/* Main Timer avec anneau de progression */}
          <div className="relative">
            <div className="text-7xl lg:text-[120px] font-bold leading-none tracking-tighter font-mono">
              {formatTime(elapsedSeconds)}
            </div>

            {/* Progress Ring - SVG */}
            {capMin && (
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
                  strokeDasharray={`${(elapsedSeconds / (capMin * 60)) * 565} 565`}
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000"
                />
              </svg>
            )}
          </div>

          {/* Cap Time */}
          {capMin && (
            <div className="text-slate-400 text-base lg:text-lg">
              Cap : <span className="text-white font-semibold">{formatTime(capMin * 60)}</span>
            </div>
          )}

          {/* Boutons de contrôle */}
          <div className="flex gap-3 lg:gap-4 justify-center">
            <button
              onClick={handleStart}
              disabled={isFinished}
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
          {capMin && elapsedSeconds >= capMin * 60 && (
            <div className="px-4 lg:px-6 py-2 lg:py-3 bg-red-500/20 border border-red-500/30 rounded-xl animate-pulse">
              <p className="text-red-400 font-semibold text-sm lg:text-base">Time Cap atteint !</p>
            </div>
          )}

          {!isRunning && elapsedSeconds === 0 && (
            <div className="text-slate-500 text-xs lg:text-sm">
              Appuyez sur play pour démarrer
            </div>
          )}

          {/* Message de fin */}
          {isFinished && (
            <div className="px-4 lg:px-6 py-2 lg:py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="font-semibold text-green-400 text-sm lg:text-base">
                Terminé en {formatTime(elapsedSeconds)} !
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
