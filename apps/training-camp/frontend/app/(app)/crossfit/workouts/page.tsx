'use client'

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpDown, Edit, Eye, MoreHorizontal, Search, Trash2, Trophy } from "lucide-react"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { WorkoutQueryParams, Workouts } from '@/domain/entities/workout'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { workoutsApi } from '@/services/workouts'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 10

const DIFFICULTY_COLORS = {
  beginner: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  intermediate: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  advanced: 'text-red-400 bg-red-500/20 border-red-500/30',
} as const

const STATUS_COLORS = {
  draft: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  published: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  archived: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
} as const

export default function CrossfitWorkoutsPage() {
  const searchParams = useSearchParams()
  const [workouts, setWorkouts] = useState<Workouts[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = ITEMS_PER_PAGE
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [workoutType, setWorkoutType] = useState<string>('')
  const [isBenchmark, setIsBenchmark] = useState<boolean | undefined>(
    searchParams.get('benchmark') === 'true' ? true : undefined
  )
  const [orderBy, setOrderBy] = useState<string>("created_at")
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc")
  const [sorting, setSorting] = React.useState<SortingState>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPageIndex(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const params: WorkoutQueryParams = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: debouncedSearch || undefined,
        status: status || undefined,
        difficulty: difficulty || undefined,
        workout_type: workoutType || undefined,
        is_benchmark: isBenchmark,
        orderBy: orderBy,
        orderDir: orderDir,
      }
      const data = await workoutsApi.getAll(params)
      setWorkouts(data.rows)
      setTotal(data.count)
    } catch (error) {
      console.error('Erreur lors du chargement des workouts', error)
      toast.error('Erreur lors du chargement des workouts')
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, debouncedSearch, status, difficulty, workoutType, isBenchmark, orderBy, orderDir])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const handleBenchmarkToggle = useCallback(() => {
    setIsBenchmark(prev => prev === true ? undefined : true)
    setPageIndex(0)
  }, [])

  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0]
      setOrderBy(sort.id)
      setOrderDir(sort.desc ? "desc" : "asc")
      setPageIndex(0)
    }
  }, [sorting])

  const handleDelete = useCallback(async (id: string, name?: string) => {
    if (!confirm(`Supprimer l'entraînement "${name}" ?`)) return
    try {
      await workoutsApi.delete(id)
      toast.success('Workout supprimé')
      fetchWorkouts()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la suppression du workout')
    }
  }, [fetchWorkouts])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value === 'all' ? '' : value)
    setPageIndex(0)
  }, [])

  const handleDifficultyChange = useCallback((value: string) => {
    setDifficulty(value === 'all' ? '' : value)
    setPageIndex(0)
  }, [])

  const handleWorkoutTypeChange = useCallback((value: string) => {
    setWorkoutType(value === 'all' ? '' : value)
    setPageIndex(0)
  }, [])

  const columns = useMemo<ColumnDef<Workouts>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nom <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.is_benchmark && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              <Trophy className="w-2.5 h-2.5" />
              Benchmark
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "workout_type",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Type <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue("workout_type") as string
        return <div className="capitalize">{type?.replace(/_/g, " ")}</div>
      },
    },
    {
      accessorKey: "difficulty",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Difficulté <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || ''}`}>
            {difficulty}
          </span>
        )
      },
    },
    {
      accessorKey: "intensity",
      header: "Intensité",
      cell: ({ row }) => {
        const intensity = row.getValue("intensity") as string
        return <div className="capitalize">{intensity}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || ''}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const workout = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(workout.id)}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/workouts/${workout.id}`}>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(workout.id, workout.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleDelete])

  const pageCount = Math.ceil(total / pageSize)

  const table = useReactTable({
    data: workouts,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/crossfit" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Bibliothèque</span>
              </h1>
              <p className="text-slate-400 mt-1">Total : {total}</p>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div variants={fadeInUp} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un workout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30"
              />
            </div>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={workoutType} onValueChange={handleWorkoutTypeChange}>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="amrap">AMRAP</SelectItem>
                <SelectItem value="emom">EMOM</SelectItem>
                <SelectItem value="for_time">For Time</SelectItem>
                <SelectItem value="tabata">Tabata</SelectItem>
                <SelectItem value="chipper">Chipper</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={handleBenchmarkToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                isBenchmark
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-yellow-500/40 hover:text-yellow-400'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Benchmarks
            </button>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Précédent
            </Button>
            <div className="text-sm font-medium text-slate-300">
              Page {pageIndex + 1} sur {pageCount || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
              disabled={pageIndex >= pageCount - 1}
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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-white/5">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-300">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-white/10">
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : workouts.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer border-white/10 hover:bg-white/10 transition-colors"
                    onClick={() => { window.location.href = `/workout/${row.original.id}` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-slate-200"
                        onClick={(e) => { if (cell.column.id === 'actions') e.stopPropagation() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10">
                  <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                    Aucun workout trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Vue Mobile - Cards */}
        <motion.div variants={fadeInUp} className="md:hidden space-y-3">
          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
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
                onClick={() => { window.location.href = `/workout/${workout.id}` }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1 text-white">{workout.name}</h3>
                      {workout.is_benchmark && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 flex-shrink-0">
                          <Trophy className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className="text-xs bg-white/10 text-slate-300 border-white/20">
                        {workout.workout_type?.replace(/_/g, ' ') || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/workout/${workout.id}`}>
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

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Difficulté</p>
                    <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[workout.difficulty as keyof typeof DIFFICULTY_COLORS] || 'bg-slate-500/20 text-slate-400'}`}>
                      {workout.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Intensité</p>
                    <p className="text-sm font-medium capitalize text-slate-200">{workout.intensity || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Statut</p>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[workout.status as keyof typeof STATUS_COLORS] || ''}`}>
                      {workout.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-medium text-slate-200">
                      {new Date(workout.created_at).toLocaleDateString()}
                    </p>
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
