'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { workoutsService } from '@/services'
import { Workouts } from '@/domain/entities/workout'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 10

function PersonalizedWorkoutsContent() {
  const [workouts, setWorkouts] = useState<Workouts[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(0)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const fetchPersonalizedWorkouts = async () => {
      try {
        setLoading(true)
        const offset = currentPage * ITEMS_PER_PAGE

        const response = await workoutsService.getPersonalizedWorkouts(
          ITEMS_PER_PAGE,
          offset,
          debouncedSearch || undefined
        )

        // Parser les workouts depuis plan_json
        const parsedWorkouts = response.rows.map((workout) => {
          const parsedWorkout = typeof workout.plan_json === 'string'
            ? JSON.parse(workout.plan_json)
            : workout.plan_json
          return {
            ...parsedWorkout,
            id: workout.id,
          }
        })

        setWorkouts(parsedWorkouts)
        setTotalWorkouts(response.count)
      } catch (error) {
        toast.error(`Erreur lors du chargement des workouts personnalisés: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonalizedWorkouts()
  }, [currentPage, debouncedSearch])

  const handleDelete = async (id: string, name?: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le workout "${name || 'ce workout'}" ?`)) {
      return
    }

    try {
      await workoutsService.deletePersonalizedWorkout(id)
      toast.success('Workout supprimé avec succès')

      // Rafraîchir la liste
      const offset = currentPage * ITEMS_PER_PAGE
      const response = await workoutsService.getPersonalizedWorkouts(
        ITEMS_PER_PAGE,
        offset,
        debouncedSearch || undefined
      )

      const parsedWorkouts = response.rows.map((workout) => {
        const parsedWorkout = typeof workout.plan_json === 'string'
          ? JSON.parse(workout.plan_json)
          : workout.plan_json
        return {
          ...parsedWorkout,
          id: workout.id,
        }
      })

      setWorkouts(parsedWorkouts)
      setTotalWorkouts(response.count)
    } catch (error) {
      toast.error(`Erreur lors de la suppression: ${error}`)
    }
  }

  const pageCount = Math.ceil(totalWorkouts / ITEMS_PER_PAGE)

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-white/10 text-slate-300 border-white/20'
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Button */}
        <motion.div variants={fadeInUp}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Retour au dashboard
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Mes Workouts Personnalisés</span>
            </h1>
            <p className="text-slate-400 mt-1">Total: {totalWorkouts}</p>
          </div>
        </motion.div>

        {/* Filters & Controls */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un workout..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30"
            />
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Précédent
            </Button>
            <div className="text-sm font-medium text-slate-300">
              Page {currentPage + 1} sur {pageCount || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1))}
              disabled={currentPage >= pageCount - 1}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </motion.div>

        {/* Vue Desktop - Table */}
        <motion.div variants={fadeInUp} className="hidden md:block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-300">Nom</TableHead>
                <TableHead className="text-slate-300">Difficulté</TableHead>
                <TableHead className="text-slate-300">Intensité</TableHead>
                <TableHead className="text-slate-300">Durée</TableHead>
                <TableHead className="text-right text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-white/10">
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : workouts.length === 0 ? (
                <TableRow className="border-white/10">
                  <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                    Aucun workout trouvé
                  </TableCell>
                </TableRow>
              ) : (
                workouts.map((workout) => (
                  <TableRow
                    key={workout.id}
                    className="cursor-pointer border-white/10 hover:bg-white/10 transition-colors"
                    onClick={() => {
                      window.location.href = `/personalized-workout/${workout.id}`
                    }}
                  >
                    <TableCell className="font-medium text-white">{workout.name}</TableCell>
                    <TableCell>
                      <Badge className={`${getDifficultyStyle(workout.difficulty)} border`}>
                        {workout.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-slate-300">{workout.intensity}</TableCell>
                    <TableCell className="text-slate-300">{workout.estimated_duration || 'N/A'} min</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Link href={`/personalized-workout/${workout.id}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(workout.id, workout.name)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Vue Mobile - Cards */}
        <motion.div variants={fadeInUp} className="md:hidden space-y-3">
          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              </div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center text-slate-400">
              Aucun workout trouvé
            </div>
          ) : (
            workouts.map((workout) => (
              <motion.div
                key={workout.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => {
                  window.location.href = `/personalized-workout/${workout.id}`
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Header avec nom et actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-white line-clamp-1">{workout.name}</h3>
                  </div>
                  <div
                    className="flex gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/personalized-workout/${workout.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(workout.id, workout.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Difficulté</p>
                    <Badge className={`text-xs ${getDifficultyStyle(workout.difficulty)} border`}>
                      {workout.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Intensité</p>
                    <p className="text-sm font-medium capitalize text-slate-300">{workout.intensity || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Durée</p>
                    <p className="text-sm font-medium text-slate-300">{workout.estimated_duration || 'N/A'} min</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function PersonalizedWorkoutsPage() {
  return     <PersonalizedWorkoutsContent />
}
