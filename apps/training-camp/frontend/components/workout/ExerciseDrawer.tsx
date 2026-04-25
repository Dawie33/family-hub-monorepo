'use client'

import { getExercises } from "@/services"
import { Exercise } from "@/domain/entities/exercise"
import { slideInRight, backdropVariants, staggerContainer, fadeInUp } from "@/lib/animations"
import { AnimatePresence, motion } from "framer-motion"
import { Search, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface ExerciseDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSelectExercise: (exercise: Exercise) => void
}

export function ExerciseDrawer({ isOpen, onClose, onSelectExercise }: ExerciseDrawerProps) {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')


    const fetchExercises = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getExercises({
                limit: 100,
                search: searchQuery || undefined
            })
            setExercises(response.rows)
        } catch (error) {
            toast.error(`Failed to fetch exercises:${error}`)
        } finally {
            setLoading(false)
        }
    }, [searchQuery])

    useEffect(() => {
        if (isOpen) {
            fetchExercises()
        }
    }, [isOpen, fetchExercises])

    useEffect(() => {
        if (searchQuery) {
            const timer = setTimeout(() => {
                fetchExercises()
            }, 300)
            return () => clearTimeout(timer)
        } else if (isOpen) {
            fetchExercises()
        }
    }, [searchQuery, fetchExercises, isOpen])

    const filteredExercises = exercises.filter(ex => {
        if (categoryFilter === 'all') return true
        return ex.category === categoryFilter
    })

    const categories = Array.from(new Set(exercises.map(ex => ex.category).filter(Boolean)))

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 z-[55]"
                        onClick={onClose}
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    />

                    {/* Drawer */}
                    <motion.div
                        className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-background border-l border-gray-200 dark:border-border shadow-2xl z-[60] flex flex-col"
                        variants={slideInRight}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="border-b border-gray-200 dark:border-border p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">Ajouter un exercice</h3>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-accent rounded-lg transition-colors"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-5 h-5 text-gray-900 dark:text-foreground" />
                                </motion.button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Rechercher un exercice..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-card border border-gray-300 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary text-gray-900 dark:text-foreground placeholder:text-gray-400"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setCategoryFilter('all')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-accent text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-accent/80'
                                        }`}
                                >
                                    Tous
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === cat
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-accent text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-accent/80'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-primary"></div>
                        </div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-muted-foreground">Aucun exercice trouvé</p>
                        </div>
                    ) : (
                        <motion.div
                            className="space-y-2"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredExercises.map((exercise, index) => (
                                <motion.button
                                    key={exercise.id}
                                    onClick={() => {
                                        onSelectExercise(exercise)
                                        onClose()
                                    }}
                                    className="w-full p-4 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg hover:border-blue-400 dark:hover:border-primary hover:shadow-sm transition-all text-left group"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    custom={index}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-foreground group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                                                {exercise.name}
                                            </h4>
                                            {exercise.description && (
                                                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 line-clamp-2">
                                                    {exercise.description}
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {exercise.category && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-accent text-gray-700 dark:text-foreground">
                                                        {exercise.category}
                                                    </span>
                                                )}
                                                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                                        {exercise.muscle_groups.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {exercise.image_url && (
                                            <img
                                                src={exercise.image_url}
                                                alt={exercise.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-border p-4 bg-gray-50 dark:bg-accent/20">
                            <p className="text-xs text-gray-500 dark:text-muted-foreground text-center">
                                {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''} disponible{filteredExercises.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
