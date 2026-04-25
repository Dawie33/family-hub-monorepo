'use client'

import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { Activity, Footprints, LayoutDashboard, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'
import { useMultiSportStats } from './_hooks/useMultiSportStats'
import { useOneRepMaxHistory } from './_hooks/useOneRepMaxHistory'
import { useWorkoutProgress } from './_hooks/useWorkoutProgress'
import { useWorkoutStats } from './_hooks/useWorkoutStats'
import { AthxStatsPanel } from './components/AthxStatsPanel'
import { GlobalOverview } from './components/GlobalOverview'
import { HyroxStatsPanel } from './components/HyroxStatsPanel'
import { OneRepMaxChart } from './components/OneRepMaxChart'
import { PersonalRecords } from './components/PersonalRecords'
import { ProgressChart } from './components/ProgressChart'
import { RunningStatsPanel } from './components/RunningStatsPanel'
import { WorkoutHistoryList } from './components/WorkoutHistoryList'
import { WorkoutProgressComparison } from './components/WorkoutProgressComparison'

type Tab = 'global' | 'crossfit' | 'running' | 'hyrox' | 'athx'

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  {
    id: 'global',
    label: 'Vue globale',
    icon: <LayoutDashboard className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-white border-white/60 bg-white/10',
  },
  {
    id: 'crossfit',
    label: 'CrossFit',
    icon: <Activity className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-orange-300 border-orange-500/60 bg-orange-500/10',
  },
  {
    id: 'running',
    label: 'Running',
    icon: <Footprints className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-green-300 border-green-500/60 bg-green-500/10',
  },
  {
    id: 'hyrox',
    label: 'HYROX',
    icon: <Trophy className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-yellow-300 border-yellow-500/60 bg-yellow-500/10',
  },
  {
    id: 'athx',
    label: 'ATHX',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-purple-300 border-purple-500/60 bg-purple-500/10',
  },
]

function TrackingContent() {
  const [activeTab, setActiveTab] = useState<Tab>('global')

  const { workoutStats, workoutSessions } = useWorkoutStats()
  const { progressData, loading: progressLoading } = useWorkoutProgress()
  const { liftsWithHistory, loading: ormsLoading } = useOneRepMaxHistory()
  const { stats: multiStats, loading: multiLoading } = useMultiSportStats()

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <motion.section variants={fadeInUp} className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              Suivi des performances
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Analyse tes progrès sur toutes tes disciplines</p>
        </motion.section>

        {/* Onglets */}
        <motion.div variants={fadeInUp}>
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? `${tab.activeColor} border-current`
                      : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Contenu de l'onglet */}
        <motion.div variants={fadeInUp}>

          {/* Vue globale */}
          {activeTab === 'global' && (
            <GlobalOverview
              workoutStats={workoutStats}
              runningStats={multiStats.running}
              hyroxStats={multiStats.hyrox}
              athxStats={multiStats.athx}
              onTabChange={(tab) => setActiveTab(tab as Tab)}
            />
          )}

          {/* CrossFit */}
          {activeTab === 'crossfit' && (
            <div className="space-y-6">
              {(progressLoading || progressData.length > 0) && (
                <WorkoutProgressComparison progressData={progressData} loading={progressLoading} />
              )}

              <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">📈</span>
                  <h2 className="text-2xl font-bold text-white">Activité & Progression</h2>
                </div>
                {workoutSessions.length > 0 ? (
                  <ProgressChart sessions={workoutSessions} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-slate-400">Complète tes premiers workouts pour voir ta progression</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">🏋️</span>
                  <h2 className="text-2xl font-bold text-white">Évolution des 1RMs</h2>
                </div>
                {ormsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
                  </div>
                ) : liftsWithHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-slate-400">Enregistre tes 1RMs dans ton profil pour suivre ta progression</p>
                  </div>
                ) : (
                  <OneRepMaxChart liftsWithHistory={liftsWithHistory} />
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⚡</span>
                    <h2 className="text-xl font-bold text-white">Workouts par Type</h2>
                  </div>
                  {workoutStats && workoutStats.totalWorkouts > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(workoutStats.workoutsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="font-medium text-slate-200">{type.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all"
                                style={{
                                  width: `${workoutStats.totalWorkouts > 0 ? (count / workoutStats.totalWorkouts) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-slate-400 w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm py-4">Aucun workout complété pour le moment</p>
                  )}
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🏆</span>
                    <h2 className="text-xl font-bold text-white">Records Personnels</h2>
                  </div>
                  {workoutStats && workoutStats.personalRecords.length > 0 ? (
                    <PersonalRecords records={workoutStats.personalRecords} />
                  ) : (
                    <p className="text-slate-400 text-sm py-4">Complète des workouts pour établir tes records</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">Historique Complet</h2>
                <WorkoutHistoryList />
              </div>
            </div>
          )}

          {/* Running */}
          {activeTab === 'running' && (
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🏃</span>
                <h2 className="text-2xl font-bold text-white">Running</h2>
              </div>
              <RunningStatsPanel stats={multiStats.running} loading={multiLoading} />
            </div>
          )}

          {/* HYROX */}
          {activeTab === 'hyrox' && (
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🏟️</span>
                <h2 className="text-2xl font-bold text-white">HYROX</h2>
              </div>
              <HyroxStatsPanel stats={multiStats.hyrox} loading={multiLoading} />
            </div>
          )}

          {/* ATHX */}
          {activeTab === 'athx' && (
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">⚡</span>
                <h2 className="text-2xl font-bold text-white">ATHX</h2>
              </div>
              <AthxStatsPanel stats={multiStats.athx} loading={multiLoading} />
            </div>
          )}

        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TrackingPage() {
  return <TrackingContent />
}
