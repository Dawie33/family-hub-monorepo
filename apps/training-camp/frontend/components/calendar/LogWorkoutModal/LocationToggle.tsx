'use client'

import { Home } from 'lucide-react'

interface LocationToggleProps {
  location: 'box' | 'maison'
  onLocationChange: (location: 'box' | 'maison') => void
}

export function LocationToggle({ location, onLocationChange }: LocationToggleProps) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-2 block">Lieu</label>
      <div className="flex gap-2">
        <button
          onClick={() => onLocationChange('box')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg border transition-colors ${
            location === 'box'
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          🏋️ Box
        </button>
        <button
          onClick={() => onLocationChange('maison')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg border transition-colors ${
            location === 'maison'
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" /> Maison
        </button>
      </div>
    </div>
  )
}
