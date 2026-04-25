'use client'

interface TimeInputProps {
  minutes: string
  seconds: string
  onMinutesChange: (v: string) => void
  onSecondsChange: (v: string) => void
  className?: string
}

export function TimeInput({ minutes, seconds, onMinutesChange, onSecondsChange, className }: TimeInputProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-2">
        <input
          type="number"
          min="0"
          max="99"
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-white text-center text-lg font-mono outline-none"
        />
        <span className="text-slate-400 text-sm">min</span>
      </div>
      <span className="text-slate-400 text-lg font-bold">:</span>
      <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-2">
        <input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={(e) => onSecondsChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-white text-center text-lg font-mono outline-none"
        />
        <span className="text-slate-400 text-sm">s</span>
      </div>
    </div>
  )
}
