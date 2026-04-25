'use client'

import { useTimerSounds } from '@/hooks/useTimerSounds'
import { Check, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface StrengthRestTimerProps {
  rounds: number
  restSeconds: number
  onComplete?: () => void
}

type Phase = 'ready' | 'working' | 'resting' | 'done'

export function StrengthRestTimer({ rounds, restSeconds, onComplete }: StrengthRestTimerProps) {
  const [currentSet, setCurrentSet] = useState(1)
  const [phase, setPhase] = useState<Phase>('ready')
  const [restRemaining, setRestRemaining] = useState(restSeconds)
  const sounds = useTimerSounds()
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Countdown pendant le repos
  useEffect(() => {
    if (phase !== 'resting') return

    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        // Bips de fin de repos (3, 2, 1)
        if (prev - 1 <= 3 && prev - 1 > 0) {
          sounds.playCountdownBeep()
        }

        if (prev <= 1) {
          const nextSet = currentSet + 1
          if (nextSet > rounds) {
            setPhase('done')
            sounds.playFinishSound()
            onComplete?.()
          } else {
            setCurrentSet(nextSet)
            setPhase('ready')
            sounds.playRoundSound()
          }
          return restSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, currentSet, rounds, restSeconds, sounds, onComplete])

  // Wake lock pendant le repos
  useEffect(() => {
    const request = async () => {
      try {
        if ('wakeLock' in navigator && phase === 'resting') {
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
    if (phase === 'resting') request()
    else release()
    return () => { release() }
  }, [phase])

  const handleStartSet = () => {
    setPhase('working')
    sounds.playStartSound()
  }

  const handleSetDone = () => {
    if (currentSet >= rounds) {
      setPhase('done')
      sounds.playFinishSound()
      onComplete?.()
      return
    }
    setRestRemaining(restSeconds)
    setPhase('resting')
    sounds.playRestSound()
  }

  const handleSkipRest = () => {
    const nextSet = currentSet + 1
    setCurrentSet(nextSet)
    setPhase('ready')
    sounds.playRoundSound()
  }

  const reset = () => {
    setCurrentSet(1)
    setPhase('ready')
    setRestRemaining(restSeconds)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const restProgress = ((restSeconds - restRemaining) / restSeconds) * 100

  // ── Phase READY ──────────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="bg-gradient-to-br from-amber-950/30 to-orange-950/30 border-2 border-amber-700 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-amber-400 mb-1 uppercase">Strength</div>
          <div className="text-5xl font-bold text-amber-300">
            Série {currentSet}
            <span className="text-2xl text-amber-600"> / {rounds}</span>
          </div>
          <div className="text-slate-400 text-sm mt-1">
            Repos entre séries : {formatTime(restSeconds)}
          </div>
        </div>

        <button
          onClick={handleStartSet}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-amber-500/20"
        >
          <Play className="w-5 h-5" />
          Commencer la série
        </button>

        {currentSet > 1 && (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Recommencer depuis le début
          </button>
        )}
      </div>
    )
  }

  // ── Phase WORKING ─────────────────────────────────────────────────────────────
  if (phase === 'working') {
    return (
      <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border-2 border-green-700 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-green-400 mb-1 uppercase">💪 En cours</div>
          <div className="text-5xl font-bold text-green-300">
            Série {currentSet}
            <span className="text-2xl text-green-600"> / {rounds}</span>
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {currentSet < rounds ? `Repos ensuite : ${formatTime(restSeconds)}` : 'Dernière série !'}
          </div>
        </div>

        <button
          onClick={handleSetDone}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-green-500/20"
        >
          <Check className="w-5 h-5" />
          Série terminée
        </button>
      </div>
    )
  }

  // ── Phase RESTING ─────────────────────────────────────────────────────────────
  if (phase === 'resting') {
    return (
      <div className="bg-gradient-to-br from-blue-950/30 to-slate-950/30 border-2 border-blue-700 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest text-blue-400 mb-1 uppercase">😌 Repos</div>
          <div className="text-6xl font-bold font-mono text-blue-300">
            {formatTime(restRemaining)}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            Prochaine série : {currentSet + 1} / {rounds}
          </div>
        </div>

        {/* Barre de progression du repos */}
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${restProgress}%` }}
          />
        </div>

        <button
          onClick={handleSkipRest}
          className="w-full flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          Passer le repos
        </button>
      </div>
    )
  }

  // ── Phase DONE ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border-2 border-green-700 rounded-xl p-6 space-y-3 text-center">
      <div className="text-4xl">🎉</div>
      <div className="text-xl font-bold text-green-300">Section terminée !</div>
      <div className="text-slate-400 text-sm">{rounds} séries complétées</div>
      <button
        onClick={reset}
        className="flex items-center justify-center gap-1 mx-auto text-slate-500 hover:text-slate-300 text-xs transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Recommencer
      </button>
    </div>
  )
}
