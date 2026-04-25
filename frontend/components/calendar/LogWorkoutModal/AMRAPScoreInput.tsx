interface AMRAPScoreInputProps {
  rounds: string
  bonusReps: string
  onRoundsChange: (value: string) => void
  onBonusRepsChange: (value: string) => void
}

export function AMRAPScoreInput({ rounds, bonusReps, onRoundsChange, onBonusRepsChange }: AMRAPScoreInputProps) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-2 block">Score</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-2">
          <input
            type="number"
            min="0"
            value={rounds}
            onChange={e => onRoundsChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-white text-center text-lg font-mono outline-none"
          />
          <span className="text-slate-400 text-sm">rounds</span>
        </div>
        <span className="text-slate-400">+</span>
        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-2">
          <input
            type="number"
            min="0"
            value={bonusReps}
            onChange={e => onBonusRepsChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-white text-center text-lg font-mono outline-none"
          />
          <span className="text-slate-400 text-sm">reps</span>
        </div>
      </div>
    </div>
  )
}
