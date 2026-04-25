import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getPersonalizedWorkouts, deletePersonalizedWorkout, PersonalizedWorkout } from '../../services/personalized-workouts'
import { Colors } from '../../constants/colors'

const TYPE_LABELS: Record<string, string> = {
  for_time: 'For Time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
  strength: 'Force',
  interval: 'Interval',
  endurance: 'Endurance',
}

const TYPE_COLORS: Record<string, string> = {
  for_time: Colors.orange,
  amrap: Colors.blue,
  emom: Colors.violet,
  tabata: '#ec4899',
  strength: '#f59e0b',
  interval: Colors.emerald,
  endurance: '#06b6d4',
}

const INTENSITY_LABELS: Record<string, { label: string; color: string }> = {
  low:      { label: 'Faible',    color: Colors.emerald },
  moderate: { label: 'Modéré',    color: '#f59e0b' },
  medium:   { label: 'Moyen',     color: '#f59e0b' },
  high:     { label: 'Intense',   color: Colors.rose },
  very_high:{ label: 'Très intense', color: '#dc2626' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PersonalizedWorkoutsScreen() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<PersonalizedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const data = await getPersonalizedWorkouts(50)
      setWorkouts(data)
    } catch {
      setWorkouts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function confirmDelete(workout: PersonalizedWorkout) {
    Alert.alert(
      'Supprimer',
      `Supprimer "${workout.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await deletePersonalizedWorkout(workout.id)
              setWorkouts((prev) => prev.filter((w) => w.id !== workout.id))
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer ce workout')
            }
          },
        },
      ]
    )
  }

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mes Workouts IA</Text>
          <Text style={styles.subtitle}>{workouts.length} workout{workouts.length > 1 ? 's' : ''} généré{workouts.length > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => router.push('/workout/generate' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.generateBtnText}>Générer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData() }}
            tintColor={Colors.orange}
          />
        }
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>Aucun workout généré</Text>
            <Text style={styles.emptyText}>Utilise le générateur IA pour créer un workout personnalisé</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/workout/generate' as any)}
            >
              <Text style={styles.emptyBtnText}>Générer mon premier workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          workouts.map((workout) => {
            const type = workout.workout_type ?? ''
            const typeColor = TYPE_COLORS[type] ?? Colors.textMuted
            const typeLabel = TYPE_LABELS[type] ?? type
            const intensity = workout.intensity ? INTENSITY_LABELS[workout.intensity.toLowerCase()] : undefined

            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.card}
                onPress={() => router.push(`/personalized-workouts/${workout.id}` as any)}
                activeOpacity={0.75}
              >
                <View style={styles.cardHeader}>
                  {type ? (
                    <View style={[styles.badge, { backgroundColor: `${typeColor}22` }]}>
                      <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>
                  ) : null}
                  {intensity && (
                    <View style={[styles.badge, { backgroundColor: `${intensity.color}18` }]}>
                      <Text style={[styles.badgeText, { color: intensity.color }]}>{intensity.label}</Text>
                    </View>
                  )}
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={10} color={Colors.orange} />
                    <Text style={styles.aiBadgeText}>IA</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{workout.name}</Text>
                {workout.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>{workout.description}</Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.cardMeta}>
                    {workout.estimated_duration ? (
                      <Text style={styles.metaText}>⏱ {workout.estimated_duration} min</Text>
                    ) : null}
                    <Text style={styles.metaDate}>{formatDate(workout.created_at)}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(workout)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.rose} />
                    </TouchableOpacity>
                    <Text style={styles.cardArrow}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.orange, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  generateBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: 10,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, padding: 32,
  },
  emptyTitle: { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  emptyText: { color: Colors.textFaint, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 8, backgroundColor: Colors.orange,
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  cardHeader: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: `${Colors.orange}15`, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: `${Colors.orange}30`,
  },
  aiBadgeText: { color: Colors.orange, fontSize: 10, fontWeight: '700' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardMeta: { gap: 2 },
  metaText: { color: Colors.textFaint, fontSize: 12 },
  metaDate: { color: Colors.textFaint, fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: { padding: 4 },
  cardArrow: { color: Colors.orange, fontSize: 16, fontWeight: '600' },
})
