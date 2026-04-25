import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getWorkouts, Workout } from '../../services/workouts'
import { Colors } from '../../constants/colors'

const TYPE_LABELS: Record<string, string> = {
  for_time: 'For Time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
  strength: 'Force',
  interval: 'Interval',
  endurance: 'Endurance',
  tempo: 'Tempo',
}

const TYPE_COLORS: Record<string, string> = {
  for_time: Colors.orange,
  amrap: Colors.blue,
  emom: Colors.violet,
  tabata: '#ec4899',
  strength: '#f59e0b',
  interval: Colors.emerald,
  endurance: '#06b6d4',
  tempo: '#8b5cf6',
}

const INTENSITY_LABELS: Record<string, { label: string; color: string }> = {
  low:       { label: 'Faible',    color: Colors.emerald },
  moderate:  { label: 'Modéré',    color: '#f59e0b' },
  medium:    { label: 'Moyen',     color: '#f59e0b' },
  high:      { label: 'Intense',   color: Colors.rose },
  very_high: { label: 'Très intense', color: '#dc2626' },
  recovery:  { label: 'Récup',     color: Colors.emerald },
}

function WorkoutCard({ workout, onPress }: { workout: Workout; onPress: () => void }) {
  const type = workout.workout_type ?? ''
  const typeColor = TYPE_COLORS[type] ?? Colors.textMuted
  const typeLabel = TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
  const intensity = workout.intensity ? INTENSITY_LABELS[workout.intensity.toLowerCase()] : undefined

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        {type ? (
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}22` }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        ) : null}
        {intensity && (
          <View style={[styles.intensityBadge, { backgroundColor: `${intensity.color}18` }]}>
            <Text style={[styles.intensityText, { color: intensity.color }]}>{intensity.label}</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{workout.name}</Text>

      {workout.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{workout.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        {workout.estimated_duration ? (
          <Text style={styles.cardMeta}>⏱ {workout.estimated_duration} min</Text>
        ) : null}
        <Text style={styles.cardArrow}>→</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function WorkoutsScreen() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filtered, setFiltered] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<string | null>(null)

  useEffect(() => { loadWorkouts() }, [])

  useEffect(() => {
    let result = workouts
    if (search.trim()) {
      result = result.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (activeType) {
      result = result.filter((w) => w.workout_type === activeType)
    }
    setFiltered(result)
  }, [search, activeType, workouts])

  async function loadWorkouts() {
    setError(null)
    try {
      const data = await getWorkouts(50)
      setWorkouts(data)
      setFiltered(data)
    } catch (e: any) {
      setError(e.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Types présents dans les workouts chargés
  const availableTypes = [...new Set(workouts.map((w) => w.workout_type).filter(Boolean))] as string[]

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.orange} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>{filtered.length} disponible{filtered.length > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.iaBtn}
          onPress={() => router.push('/personalized-workouts' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles-outline" size={15} color={Colors.orange} />
          <Text style={styles.iaBtnText}>Mes IA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => router.push('/workout/generate' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.generateBtnText}>Générer</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un workout..."
          placeholderTextColor={Colors.textFaint}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, !activeType && styles.filterChipActive]}
          onPress={() => setActiveType(null)}
        >
          <Text style={[styles.filterText, !activeType && styles.filterTextActive]}>Tous</Text>
        </TouchableOpacity>
        {availableTypes.map((type) => {
          const color = TYPE_COLORS[type] ?? Colors.textMuted
          const isActive = activeType === type
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, isActive && { backgroundColor: `${color}25`, borderColor: color }]}
              onPress={() => setActiveType(isActive ? null : type)}
            >
              <Text style={[styles.filterText, isActive && { color }]}>
                {TYPE_LABELS[type] ?? type}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Erreur */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Liste */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadWorkouts() }}
            tintColor={Colors.orange}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏋️</Text>
            <Text style={styles.emptyText}>Aucun workout trouvé</Text>
            {(search || activeType) && (
              <TouchableOpacity onPress={() => { setSearch(''); setActiveType(null) }}>
                <Text style={styles.emptyReset}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => router.push(`/workout/${workout.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  iaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${Colors.orange}15`, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
    borderWidth: 1, borderColor: `${Colors.orange}35`,
  },
  iaBtnText: { color: Colors.orange, fontSize: 13, fontWeight: '600' },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.orange, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 4,
  },
  generateBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 14, gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 13 },
  searchClear: { color: Colors.textFaint, fontSize: 14, padding: 4 },

  filtersScroll: { flexGrow: 0, flexShrink: 0, height: 52 },
  filters: { paddingHorizontal: 20, paddingBottom: 8, paddingTop: 4, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    flexShrink: 0,
  },
  filterChipActive: { backgroundColor: `${Colors.orange}25`, borderColor: Colors.orange },
  filterText: { color: Colors.text, fontSize: 13, fontWeight: '500', flexShrink: 0 },
  filterTextActive: { color: Colors.orange },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: 12, fontWeight: '600' },
  intensityBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  intensityText: { fontSize: 12, fontWeight: '500' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardMeta: { color: Colors.textFaint, fontSize: 12 },
  cardArrow: { color: Colors.orange, fontSize: 16, fontWeight: '600' },

  errorBox: {
    margin: 16, padding: 14, borderRadius: 12,
    backgroundColor: `${Colors.rose}15`, borderWidth: 1, borderColor: `${Colors.rose}40`,
  },
  errorText: { color: Colors.rose, fontSize: 13, textAlign: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  emptyReset: { color: Colors.orange, fontSize: 14, marginTop: 4 },
})
