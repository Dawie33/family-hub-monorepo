import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../services/api'
import { Colors } from '../constants/colors'

interface BenchmarkWorkout {
  id: string
  name: string
  workout_type?: string
  description?: string
  estimated_duration?: number
  intensity?: string
  blocks?: any
}

const TYPE_LABELS: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', emom: 'EMOM',
  tabata: 'Tabata', strength: 'Force',
}
const TYPE_COLORS: Record<string, string> = {
  for_time: Colors.orange, amrap: Colors.blue, emom: Colors.violet,
  tabata: '#ec4899', strength: '#f59e0b',
}

export default function BenchmarksScreen() {
  const router = useRouter()
  const [benchmarks, setBenchmarks] = useState<BenchmarkWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<BenchmarkWorkout | null>(null)
  const [logModal, setLogModal] = useState(false)
  const [logTarget, setLogTarget] = useState<BenchmarkWorkout | null>(null)
  const [logResult, setLogResult] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [logging, setLogging] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await api.get<{ rows: BenchmarkWorkout[]; count: number } | BenchmarkWorkout[]>('/workouts/benchmark')
      const rows = Array.isArray(res) ? res : (res as any).rows ?? []
      setBenchmarks(rows)
    } catch {
      setBenchmarks([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function openLog(workout: BenchmarkWorkout) {
    setLogTarget(workout)
    setLogResult('')
    setLogNotes('')
    setLogModal(true)
  }

  async function handleLog() {
    if (!logTarget) return
    setLogging(true)
    try {
      const now = new Date()
      const session = await api.post<{ id: string }>('/workout-sessions', {
        workout_id: logTarget.id,
        started_at: now.toISOString(),
      })
      await api.patch(`/workout-sessions/${session.id}`, {
        completed_at: now.toISOString(),
        notes: [logResult.trim() ? `Résultat : ${logResult.trim()}` : '', logNotes.trim()].filter(Boolean).join('\n') || undefined,
      })
      setLogModal(false)
      Alert.alert('Séance enregistrée !', `Benchmark "${logTarget.name}" logué.`, [{ text: 'Super !' }])
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de logger')
    } finally {
      setLogging(false)
    }
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
          <Text style={styles.title}>Benchmarks</Text>
          <Text style={styles.subtitle}>Workouts de référence</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} tintColor={Colors.orange} />
        }
      >
        {benchmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>Aucun benchmark</Text>
            <Text style={styles.emptyText}>Les workouts de référence apparaîtront ici</Text>
          </View>
        ) : (
          benchmarks.map((b) => {
            const type = b.workout_type ?? ''
            const typeColor = TYPE_COLORS[type] ?? Colors.textMuted
            const typeLabel = TYPE_LABELS[type] ?? type

            return (
              <TouchableOpacity
                key={b.id}
                style={styles.card}
                onPress={() => setSelected(selected?.id === b.id ? null : b)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardBadges}>
                      {type ? (
                        <View style={[styles.badge, { backgroundColor: `${typeColor}22` }]}>
                          <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.cardTitle}>{b.name}</Text>
                    {b.description && selected?.id === b.id ? (
                      <Text style={styles.cardDesc}>{b.description}</Text>
                    ) : null}
                    {b.estimated_duration ? (
                      <Text style={styles.cardMeta}>⏱ {b.estimated_duration} min</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={selected?.id === b.id ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textFaint}
                  />
                </View>

                {selected?.id === b.id && (
                  <View style={styles.cardExpanded}>
                    {/* Blocs si présents */}
                    {b.blocks?.sections?.map((sec: any, i: number) => (
                      <View key={i} style={styles.sectionBox}>
                        <Text style={styles.sectionTitle}>{sec.title ?? `Bloc ${i + 1}`}</Text>
                        {sec.description ? <Text style={styles.sectionDesc}>{sec.description}</Text> : null}
                        {sec.exercises?.map((ex: any, j: number) => (
                          <View key={j} style={styles.exRow}>
                            <View style={styles.exDot} />
                            <Text style={styles.exText}>
                              {ex.reps ? <Text style={{ color: Colors.orange, fontWeight: '600' }}>{ex.reps} reps </Text> : null}
                              {ex.name ?? ex.exercise_name ?? ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.logBtn} onPress={() => openLog(b)} activeOpacity={0.85}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.logBtnText}>Logger ce benchmark</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Modal log benchmark */}
      <Modal visible={logModal} transparent animationType="slide" onRequestClose={() => setLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Logger : {logTarget?.name}</Text>

            <Text style={styles.inputLabel}>Résultat (temps, rounds…)</Text>
            <TextInput
              style={styles.input}
              value={logResult}
              onChangeText={setLogResult}
              placeholder="Ex: 18:42, 8 rounds+5, 85kg..."
              placeholderTextColor={Colors.textFaint}
            />

            <Text style={styles.inputLabel}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={logNotes}
              onChangeText={setLogNotes}
              placeholder="Ton ressenti, RX ou scalé..."
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogModal(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, logging && { opacity: 0.6 }]}
                onPress={handleLog}
                disabled={logging}
              >
                {logging
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmBtnText}>Enregistrer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: 10,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, padding: 32,
  },
  emptyTitle: { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  emptyText: { color: Colors.textFaint, fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardBadges: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  cardMeta: { color: Colors.textFaint, fontSize: 12, marginTop: 2 },
  cardExpanded: { marginTop: 14, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 },
  sectionBox: { gap: 4 },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sectionDesc: { color: Colors.textMuted, fontSize: 13 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 1 },
  exDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.orange },
  exText: { color: Colors.textMuted, fontSize: 13, flex: 1 },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.emerald, borderRadius: 12, paddingVertical: 12, marginTop: 4,
  },
  logBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  inputLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: Colors.background, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 12, color: Colors.text, fontSize: 14,
  },
  inputMulti: { minHeight: 70, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textMuted, fontSize: 15 },
  confirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.emerald },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
