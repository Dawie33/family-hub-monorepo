'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AMRAPRound, EmomRound, TabataRound, TimerConfig, TimerType } from '@/hooks/useWorkoutTimer'
import { motion } from 'framer-motion'
import { ArrowLeft, CirclePlus, InfinityIcon, Play, X } from 'lucide-react'
import { useState } from 'react'

interface ConfigViewProps {
  timerType: TimerType
  onStart: (config: TimerConfig) => void
  onBack: () => void
}

export function ConfigView({ timerType, onStart, onBack }: ConfigViewProps) {
  const [config, setConfig] = useState<TimerConfig>({
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    duration: 20,
    timeCap: 15,
    intervalMinutes: 1
  })

  const [amrapRounds, setAmrapRounds] = useState<AMRAPRound[]>([])
  const [tabataRound, setTabataRound] = useState<TabataRound>()
  const [emomRound, setEmomRound] = useState<EmomRound>()
  const [isDeathBy, setIsDeathBy] = useState(false)
  const [noTimeCap, setNoTimeCap] = useState(false)

  const handleStart = () => {
    const finalConfig = { ...config }

    if (amrapRounds.length > 0) finalConfig.amrapRounds = amrapRounds
    if (tabataRound) finalConfig.tabataRound = tabataRound
    if (emomRound) finalConfig.emomRound = emomRound
    if (isDeathBy) {
      finalConfig.isDeathBy = true
      delete finalConfig.duration
    }
    if (noTimeCap) {
      finalConfig.noTimeCap = true
      delete finalConfig.timeCap
    }

    onStart(finalConfig)
  }

  const addTabataRound = () => setTabataRound({ round: 4, rest: 1 })
  const updateTabataRound = (field: 'round' | 'rest', value: number) => {
    if (tabataRound) setTabataRound({ ...tabataRound, [field]: value })
  }
  const removeTabataRound = () => setTabataRound(undefined)

  const addAMRAPRound = () => setAmrapRounds([...amrapRounds, { duration: 10, rest: 2 }])
  const updateAMRAPRound = (index: number, field: 'duration' | 'rest', value: number) => {
    const updated = [...amrapRounds]
    updated[index][field] = value
    setAmrapRounds(updated)
  }
  const removeAMRAPRound = (index: number) => setAmrapRounds(amrapRounds.filter((_, i) => i !== index))

  const addEmomRound = () => setEmomRound({ round: 4, rest: 1 })
  const updateEmomRound = (field: 'round' | 'rest', value: number) => {
    if (emomRound) setEmomRound({ ...emomRound, [field]: value })
  }
  const removeEmomRound = () => setEmomRound(undefined)

  const getTimerColor = () => {
    switch (timerType) {
      case 'TABATA': return 'border-purple-500'
      case 'AMRAP': return 'border-orange-500'
      case 'EMOM': return 'border-pink-500'
      case 'FOR_TIME': return 'border-green-500'
    }
  }

  const getTimerTitle = () => {
    switch (timerType) {
      case 'TABATA': return 'Configuration Tabata'
      case 'AMRAP': return 'Configuration AMRAP'
      case 'EMOM': return 'Configuration EMOM'
      case 'FOR_TIME': return 'Configuration For Time'
    }
  }

  const renderConfig = () => {
    const colorClass = getTimerColor()

    switch (timerType) {
      case 'TABATA':
        return (
          <div className="space-y-6">
            {/* Configuration principale */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Tours</label>
                <input
                  type="number"
                  value={config.rounds}
                  onChange={(e) => setConfig({ ...config, rounds: parseInt(e.target.value) || 1 })}
                  className={`w-full px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Travail (s)</label>
                <input
                  type="number"
                  value={config.workSeconds}
                  onChange={(e) => setConfig({ ...config, workSeconds: parseInt(e.target.value) || 1 })}
                  className={`w-full px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Repos (s)</label>
                <input
                  type="number"
                  value={config.restSeconds}
                  onChange={(e) => setConfig({ ...config, restSeconds: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="0"
                />
              </div>
            </div>

            {/* Options avancées */}
            {!tabataRound && (
              <motion.button
                onClick={addTabataRound}
                className="w-full py-3 px-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CirclePlus className="w-4 h-4" />
                Ajouter des réglages avancés
              </motion.button>
            )}

            {tabataRound && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Réglages avancés</h4>
                    <button
                      onClick={removeTabataRound}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Séries</label>
                      <input
                        type="number"
                        value={tabataRound.round}
                        onChange={(e) => updateTabataRound('round', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Récup (min)</label>
                      <input
                        type="number"
                        value={tabataRound.rest}
                        onChange={(e) => updateTabataRound('rest', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="0"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        )

      case 'AMRAP':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <label className="text-sm font-medium text-muted-foreground mb-4 block">
                Autant de tours que possible en
              </label>
              <div className="flex justify-center items-center gap-3">
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 1 })}
                  className={`w-32 px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="1"
                />
                <span className="text-xl font-medium">minutes</span>
              </div>
            </div>

            <motion.button
              onClick={addAMRAPRound}
              className="w-full py-3 px-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CirclePlus className="w-4 h-4" />
              Ajouter un AMRAP supplémentaire
            </motion.button>

            {amrapRounds.map((round, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">AMRAP {index + 2}</h4>
                    <button
                      onClick={() => removeAMRAPRound(index)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Durée (min)</label>
                      <input
                        type="number"
                        value={round.duration}
                        onChange={(e) => updateAMRAPRound(index, 'duration', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Récup (min)</label>
                      <input
                        type="number"
                        value={round.rest}
                        onChange={(e) => updateAMRAPRound(index, 'rest', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="0"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )

      case 'EMOM':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-3">
                <span className="text-lg font-medium">Toutes les</span>
                <input
                  type="number"
                  value={config.intervalMinutes}
                  onChange={(e) => setConfig({ ...config, intervalMinutes: parseInt(e.target.value) || 1 })}
                  className={`w-24 px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                  min="1"
                />
                <span className="text-lg font-medium">minute(s)</span>
              </div>

              {!isDeathBy && (
                <div className="flex justify-center items-center gap-3">
                  <span className="text-lg font-medium">pendant</span>
                  <input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 1 })}
                    className={`w-24 px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                    min="1"
                  />
                  <span className="text-lg font-medium">minute(s)</span>
                </div>
              )}

              {isDeathBy && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500 rounded-full"
                >
                  <InfinityIcon className="w-4 h-4" />
                  <span className="font-semibold">Mode Death By</span>
                  <button
                    onClick={() => setIsDeathBy(false)}
                    className="ml-1 hover:bg-pink-500/30 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </div>

            {!isDeathBy && !emomRound && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={addEmomRound}
                  className="py-3 px-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CirclePlus className="w-4 h-4" />
                  Réglages avancés
                </motion.button>
                <motion.button
                  onClick={() => setIsDeathBy(true)}
                  className="py-3 px-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <InfinityIcon className="w-4 h-4" />
                  Death by
                </motion.button>
              </div>
            )}

            {emomRound && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Réglages avancés</h4>
                    <button
                      onClick={removeEmomRound}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Séries</label>
                      <input
                        type="number"
                        value={emomRound.round}
                        onChange={(e) => updateEmomRound('round', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Récup (min)</label>
                      <input
                        type="number"
                        value={emomRound.rest}
                        onChange={(e) => updateEmomRound('rest', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-muted border ${colorClass} rounded-lg text-center`}
                        min="0"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        )

      case 'FOR_TIME':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <p className="text-lg font-medium">Aussi vite que possible</p>

              {!noTimeCap && (
                <div className="flex justify-center items-center gap-3">
                  <span className="text-base font-medium text-muted-foreground">Temps limite :</span>
                  <input
                    type="number"
                    value={config.timeCap}
                    onChange={(e) => setConfig({ ...config, timeCap: parseInt(e.target.value) || 1 })}
                    className={`w-24 px-4 py-3 bg-muted border-2 ${colorClass} rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary`}
                    min="1"
                  />
                  <span className="text-base font-medium">minute(s)</span>
                </div>
              )}

              {noTimeCap && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full"
                >
                  <InfinityIcon className="w-4 h-4" />
                  <span className="font-semibold">Pas de limite de temps</span>
                  <button
                    onClick={() => setNoTimeCap(false)}
                    className="ml-1 hover:bg-green-500/30 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </div>

            {!noTimeCap && (
              <motion.button
                onClick={() => setNoTimeCap(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <InfinityIcon className="w-4 h-4" />
                Pas de limite de temps
              </motion.button>
            )}
          </div>
        )
    }
  }

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl sm:text-3xl font-black">{getTimerTitle()}</h2>
        </div>

        {/* Configuration */}
        {renderConfig()}

        {/* Start Button */}
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full h-14 text-lg font-bold"
        >
          <Play className="w-5 h-5 mr-2" />
          Démarrer le timer
        </Button>
      </Card>
    </motion.div>
  )
}
