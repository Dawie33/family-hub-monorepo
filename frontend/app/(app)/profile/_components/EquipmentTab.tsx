const EQUIPMENT_CATEGORIES = [
  {
    category: 'Basique',
    items: [
      { value: 'bodyweight', label: 'Poids du corps' },
      { value: 'mat', label: 'Tapis' },
      { value: 'band', label: 'Bande élastique' },
    ],
  },
  {
    category: 'Haltérophilie',
    items: [
      { value: 'barbell', label: 'Barre olympique' },
      { value: 'plates', label: 'Disques' },
      { value: 'rack', label: 'Rack' },
      { value: 'bench', label: 'Banc' },
      { value: 'dumbbell', label: 'Haltères' },
      { value: 'kettlebell', label: 'Kettlebell' },
      { value: 'ez-bar', label: 'Barre EZ' },
      { value: 'trap-bar', label: 'Trap bar' },
    ],
  },
  {
    category: 'CrossFit',
    items: [
      { value: 'box', label: 'Box' },
      { value: 'pull-up-bar', label: 'Barre de traction' },
      { value: 'jump-rope', label: 'Corde à sauter' },
      { value: 'wall-ball', label: 'Wall ball' },
      { value: 'rings', label: 'Anneaux' },
      { value: 'parallettes', label: 'Parallettes' },
      { value: 'ghd', label: 'GHD' },
      { value: 'medicine-ball', label: 'Medecine ball' },
      { value: 'slam-ball', label: 'Slam ball' },
      { value: 'abmat', label: 'AbMat' },
      { value: 'sandbag', label: 'Sandbag' },
      { value: 'battle-ropes', label: 'Battle ropes' },
    ],
  },
  {
    category: 'Cardio',
    items: [
      { value: 'rower', label: 'Rameur' },
      { value: 'assault-bike', label: 'Assault bike' },
      { value: 'ski-erg', label: 'Ski erg' },
      { value: 'treadmill', label: 'Tapis de course' },
      { value: 'stationary-bike', label: 'Vélo stationnaire' },
      { value: 'elliptical', label: 'Elliptique' },
      { value: 'stairmaster', label: 'Stairmaster' },
    ],
  },
  {
    category: 'Strongman',
    items: [
      { value: 'sled', label: 'Luge' },
      { value: 'tire', label: 'Pneu' },
      { value: 'sledgehammer', label: 'Masse' },
      { value: 'farmer-walk-handles', label: 'Farmer walk' },
      { value: 'yoke', label: 'Yoke' },
      { value: 'atlas-stone', label: 'Atlas stone' },
    ],
  },
  {
    category: 'Accessoires',
    items: [
      { value: 'foam-roller', label: 'Foam roller' },
      { value: 'lacrosse-ball', label: 'Balle lacrosse' },
      { value: 'ab-wheel', label: 'Ab wheel' },
      { value: 'suspension-trainer', label: 'TRX / Suspension' },
      { value: 'plyo-box', label: 'Plyo box' },
      { value: 'pvc-pipe', label: 'Barre PVC' },
    ],
  },
]

const EQUIPMENT_PRESETS = [
  { label: 'Minimal', items: ['bodyweight', 'mat'] },
  { label: 'Home gym', items: ['bodyweight', 'mat', 'band', 'dumbbell', 'kettlebell', 'pull-up-bar', 'jump-rope'] },
  {
    label: 'Box CrossFit',
    items: ['barbell', 'plates', 'rack', 'dumbbell', 'kettlebell', 'box', 'pull-up-bar', 'jump-rope', 'rower', 'assault-bike', 'wall-ball', 'rings', 'medicine-ball', 'ghd'],
  },
]

interface EquipmentTabProps {
  equipment: string[]
  saving: boolean
  onToggle: (item: string) => void
  onPreset: (items: string[]) => void
  onClear: () => void
  onSave: () => void
}

export function EquipmentTab({ equipment, saving, onToggle, onPreset, onClear, onSave }: EquipmentTabProps) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">Équipement disponible</h2>
        <p className="text-sm text-slate-400 mt-1">
          Renseignez l'équipement dont vous disposez pour que l'IA génère des workouts adaptés.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPreset(preset.items)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          >
            {preset.label}
          </button>
        ))}
        {equipment.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Equipment grid */}
      <div className="space-y-3 rounded-xl p-3 bg-slate-900/50 border border-slate-700/50">
        {EQUIPMENT_CATEGORIES.map((group) => (
          <div key={group.category}>
            <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{group.category}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => {
                const isSelected = equipment.includes(item.value)
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onToggle(item.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {equipment.length > 0 && (
        <p className="text-xs text-orange-400 font-medium">
          {equipment.length} équipement{equipment.length > 1 ? 's' : ''} sélectionné{equipment.length > 1 ? 's' : ''}
        </p>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {saving ? 'Sauvegarde...' : "Sauvegarder l'équipement"}
      </button>
    </div>
  )
}
