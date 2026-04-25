'use client'

import { motion } from 'framer-motion'

interface PersonalRecord {
  type: string
  value: number
  unit: string
  date: string
}

interface PersonalRecordsProps {
  records: PersonalRecord[]
}

export function PersonalRecords({ records }: PersonalRecordsProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
          <span className="text-xl">🏆</span>
        </div>
        <p className="text-sm">Aucun record personnel</p>
        <p className="text-xs mt-1 text-slate-500">Continue à t'entraîner pour établir tes premiers records !</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `Il y a ${months} mois`
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isRecent = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  return (
    <div className="space-y-3">
      {records.map((record, index) => {
        const recent = isRecent(record.date)

        return (
          <motion.div
            key={`${record.type}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <span className="text-lg">🏅</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{record.type}</h4>
                    {recent && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(record.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">
                    {record.unit.includes(':') ? record.unit : record.value}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">{record.unit.includes(':') ? 'temps' : record.unit}</p>
                </div>
                <span className="text-emerald-400 text-sm">▲</span>
              </div>
            </div>
          </motion.div>
        )
      })}

      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: records.length * 0.05 }}
          className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-dashed border-slate-700/50"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <span className="text-slate-400">Total des records</span>
            </div>
            <span className="font-bold text-white">{records.length}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
