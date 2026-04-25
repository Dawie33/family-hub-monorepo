interface RxToggleProps {
  isRx: boolean
  onIsRxChange: (value: boolean) => void
}

export function RxToggle({ isRx, onIsRxChange }: RxToggleProps) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-2 block">Performance</label>
      <div className="flex gap-2">
        <button
          onClick={() => onIsRxChange(true)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
            isRx
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          Rx
        </button>
        <button
          onClick={() => onIsRxChange(false)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
            !isRx
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          Scaled
        </button>
      </div>
    </div>
  )
}
