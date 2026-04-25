import type { User } from '@/domain/entities/auth'

const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors'

interface ProfileTabProps {
  fullUser: User | null
  authEmail?: string
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  sportLevel: string
  setSportLevel: (v: string) => void
  height: string
  setHeight: (v: string) => void
  weight: string
  setWeight: (v: string) => void
  bodyFat: string
  setBodyFat: (v: string) => void
  saving: boolean
  onSave: () => void
}

export function ProfileTab({
  fullUser, authEmail,
  firstName, setFirstName,
  lastName, setLastName,
  sportLevel, setSportLevel,
  height, setHeight,
  weight, setWeight,
  bodyFat, setBodyFat,
  saving, onSave,
}: ProfileTabProps) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-5">
      <h2 className="text-lg font-bold">Informations personnelles</h2>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
        <input
          type="email"
          value={fullUser?.email ?? authEmail ?? ''}
          readOnly
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900/30 border border-slate-700/30 text-slate-500 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Niveau sportif</label>
        <select value={sportLevel} onChange={(e) => setSportLevel(e.target.value)} className={inputClass}>
          <option value="">Non renseigné</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
          <option value="elite">Elite</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Taille (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="180" min="100" max="250" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Poids (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" min="30" max="300" step="0.1" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">% Graisse</label>
          <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="15" min="3" max="60" step="0.1" className={inputClass} />
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
      </button>
    </div>
  )
}
