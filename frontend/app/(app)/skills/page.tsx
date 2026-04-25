'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SkillProgram } from '@/domain/entities/skill'

import { skillsService } from '@/services/skills'
import { motion } from 'framer-motion'
import { Flame, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const categoryLabels: Record<string, string> = {
  gymnastics: 'Gymnastique',
  olympic_lifting: 'Halterophilie',
  strength: 'Force',
  mobility: 'Mobilite',
}

const categoryColors: Record<string, string> = {
  gymnastics: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  olympic_lifting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  strength: 'bg-red-500/20 text-red-300 border-red-500/30',
  mobility: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const statusLabels: Record<string, string> = {
  active: 'Actif',
  completed: 'Termine',
  paused: 'En pause',
  abandoned: 'Abandonne',
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  completed: 'bg-blue-500/20 text-blue-300',
  paused: 'bg-yellow-500/20 text-yellow-300',
  abandoned: 'bg-slate-500/20 text-slate-300',
}

function SkillsContent() {
  const [programs, setPrograms] = useState<SkillProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true)
      const data = await skillsService.getAll(statusFilter === 'all' ? undefined : statusFilter)
      console.log('Skills data:', data)
      setPrograms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Skills fetch error:', err)
      toast.error('Erreur lors du chargement des programmes')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  const getProgressPercent = (program: SkillProgram) => {
    if (!program.total_steps || program.total_steps === 0) return 0
    return Math.round(((program.completed_steps || 0) / program.total_steps) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            Progressions
          </h1>
          <p className="text-slate-400 mt-1">Suivez votre progression sur les skills CrossFit</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
          <Link href="/skills/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau programme
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="completed">Termines</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="abandoned">Abandonnes</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20">
          <Flame className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun programme</h3>
          <p className="text-slate-400 mb-6">Commencez par creer un programme de progression</p>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500">
            <Link href="/skills/new">
              <Plus className="w-4 h-4 mr-2" />
              Creer un programme
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => {
            const progress = getProgressPercent(program)
            return (
              <div key={program.id}>
                <Link href={`/skills/${program.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 p-6 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                        {program.skill_name}
                      </h3>
                      <Badge className={statusColors[program.status] || ''}>
                        {statusLabels[program.status]}
                      </Badge>
                    </div>

                    <Badge variant="outline" className={`mb-4 ${categoryColors[program.skill_category] || ''}`}>
                      {categoryLabels[program.skill_category]}
                    </Badge>

                    {program.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{program.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {program.completed_steps || 0} / {program.total_steps || 0} etapes
                        </span>
                        <span className="text-orange-400 font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {program.estimated_weeks && (
                      <p className="text-xs text-slate-500 mt-3">
                        Duree estimee : {program.estimated_weeks} semaines
                      </p>
                    )}
                  </Card>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SkillsPage() {
  return     <SkillsContent />
}
