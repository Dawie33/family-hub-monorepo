import { TimeInput } from '@/components/ui/time-input'

interface ForTimeScoreInputProps {
  mins: string
  secs: string
  capAtteint: boolean
  capScore: string
  capDescription: string
  onMinsChange: (value: string) => void
  onSecsChange: (value: string) => void
  onCapAtteintChange: (value: boolean) => void
  onCapScoreChange: (value: string) => void
  onCapDescriptionChange: (value: string) => void
}

export function ForTimeScoreInput({
  mins,
  secs,
  capAtteint,
  capScore,
  capDescription,
  onMinsChange,
  onSecsChange,
  onCapAtteintChange,
  onCapScoreChange,
  onCapDescriptionChange,
}: ForTimeScoreInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400">Temps</label>
        <button
          onClick={() => onCapAtteintChange(!capAtteint)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            capAtteint
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          Cap atteint
        </button>
      </div>
      {!capAtteint ? (
        <TimeInput minutes={mins} seconds={secs} onMinutesChange={onMinsChange} onSecondsChange={onSecsChange} />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <input
              type="number"
              min="0"
              value={capScore}
              onChange={e => onCapScoreChange(e.target.value)}
              placeholder="0"
              className="w-24 bg-transparent text-white text-center text-lg font-mono outline-none"
            />
            <span className="text-red-400 text-sm">reps total (score officiel)</span>
          </div>
          <input
            type="text"
            value={capDescription}
            onChange={e => onCapDescriptionChange(e.target.value)}
            placeholder="Ex: Round 2 + 24m lunges + 15 chest-to-bar"
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50"
          />
        </div>
      )}
    </div>
  )
}
