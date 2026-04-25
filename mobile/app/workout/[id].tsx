import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getWorkoutById, Workout } from '../../services/workouts'
import { api } from '../../services/api'
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
  low:       { label: 'Faible',       color: Colors.emerald },
  moderate:  { label: 'Modéré',       color: '#f59e0b' },
  medium:    { label: 'Moyen',        color: '#f59e0b' },
  high:      { label: 'Intense',      color: Colors.rose },
  very_high: { label: 'Très intense', color: '#dc2626' },
  recovery:  { label: 'Récupération', color: Colors.emerald },
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Log
  const [logModal, setLogModal] = useState(false)
  const [logNotes, setLogNotes] = useState('')
  const [logging, setLogging] = useState(false)

  useEffect(() => {
    if (!id) return
    getWorkoutById(id)
      .then(setWorkout)
      .catch((e) => setError(e.message ?? 'Erreur'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleLog() {
    if (!workout) return
    setLogging(true)
    try {
      const now = new Date()
      const session = await api.post<{ id: string }>('/workout-sessions', {
        workout_id: workout.id,
        started_at: now.toISOString(),
      })
      await api.patch(`/workout-sessions/${session.id}`, {
        completed_at: now.toISOString(),
        notes: logNotes.trim() || undefined,
      })

      setLogModal(false)
      setLogNotes('')
      Alert.alert('Workout logué !', 'Ta séance a été enregistrée.', [{ text: 'Top !' }])
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de logger la séance')
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

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error ?? 'Workout introuvable'}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const type = workout.workout_type ?? ''
  const typeColor = TYPE_COLORS[type] ?? Colors.textMuted
  const typeLabel = TYPE_LABELS[type] ?? type.replace(/_/g, ' ')
  const intensity = workout.intensity ? INTENSITY_LABELS[workout.intensity.toLowerCase()] : undefined
  const sections = workout.blocks?.sections ?? []

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Badges */}
        <View style={styles.badges}>
          {type ? (
            <View style={[styles.badge, { backgroundColor: `${typeColor}22` }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>🔥 {typeLabel}</Text>
            </View>
          ) : null}
          {intensity && (
            <View style={[styles.badge, { backgroundColor: `${intensity.color}18` }]}>
              <Text style={[styles.badgeText, { color: intensity.color }]}>{intensity.label}</Text>
            </View>
          )}
        </View>

        {/* Titre */}
        <Text style={styles.title}>{workout.name}</Text>

        {/* Description */}
        {workout.description ? (
          <Text style={styles.description}>{workout.description}</Text>
        ) : null}

        {/* Méta */}
        {workout.estimated_duration ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Durée estimée</Text>
              <Text style={styles.metaValue}>{workout.estimated_duration} min</Text>
            </View>
          </View>
        ) : null}

        {/* Blocs / Sections */}
        {sections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Structure du workout</Text>
            {sections.map((sec: any, i: number) => (
              <View key={i} style={styles.sectionCard}>
                <Text style={styles.sectionName}>{sec.title ?? `Bloc ${i + 1}`}</Text>
                {sec.description ? (
                  <Text style={styles.sectionDesc}>{sec.description}</Text>
                ) : null}
                {sec.exercises && sec.exercises.length > 0 && (
                  <View style={styles.exerciseList}>
                    {sec.exercises.map((ex: any, j: number) => (
                      <View key={j} style={styles.exerciseRow}>
                        <View style={styles.exerciseDot} />
                        <Text style={styles.exerciseName}>
                          {ex.reps ?? ex.duration ?? ex.distance ? (
                            <Text style={styles.exerciseReps}>
                              {ex.reps ? `${ex.reps} reps ` : ''}
                              {ex.duration ? `${ex.duration}s ` : ''}
                              {ex.distance ? `${ex.distance}m ` : ''}
                            </Text>
                          ) : null}
                          {ex.name ?? ex.exercise_name ?? ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Exercices directs (si pas de blocs) */}
        {sections.length === 0 && (workout as any).exercises?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercices</Text>
            {(workout as any).exercises.map((ex: any, i: number) => (
              <View key={i} style={styles.exerciseRow}>
                <View style={styles.exerciseDot} />
                <Text style={styles.exerciseName}>{ex.exercise_name ?? ex.name ?? ''}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push({
              pathname: '/workout/timer' as any,
              params: {
                type: workout.workout_type ?? '',
                duration: String(workout.estimated_duration ?? 20),
                name: workout.name,
                workoutId: workout.id,
              },
            })}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Démarrer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logBtnSecondary} onPress={() => setLogModal(true)} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.emerald} />
            <Text style={styles.logBtnSecondaryText}>Logger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de log */}
      <Modal visible={logModal} transparent animationType="slide" onRequestClose={() => setLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Logger ce workout</Text>
            <Text style={styles.modalSubtitle}>{workout.name}</Text>


            <Text style={styles.inputLabel}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={logNotes}
              onChangeText={setLogNotes}
              placeholder="Ton ressenti, performance, RX/scalé..."
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
                {logging ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Enregistrer</Text>
                )}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },

  content: { padding: 20, paddingBottom: 40 },

  badges: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  badge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 13, fontWeight: '600' },

  title: { color: Colors.text, fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  description: { color: Colors.textMuted, fontSize: 15, lineHeight: 22, marginBottom: 16 },

  metaRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  metaItem: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, flex: 1,
  },
  metaLabel: { color: Colors.textFaint, fontSize: 12, marginBottom: 4 },
  metaValue: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },

  section: { marginTop: 8 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },

  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 10,
  },
  sectionName: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 8 },

  exerciseList: { gap: 6 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  exerciseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.orange },
  exerciseName: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  exerciseReps: { color: Colors.orange, fontWeight: '600' },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textMuted, fontSize: 15 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  startBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.orange, borderRadius: 16, paddingVertical: 15,
  },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logBtnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 16, paddingVertical: 15,
    backgroundColor: `${Colors.emerald}15`, borderWidth: 1, borderColor: `${Colors.emerald}40`,
  },
  logBtnSecondaryText: { color: Colors.emerald, fontSize: 15, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  modalSubtitle: { color: Colors.textMuted, fontSize: 14, marginTop: -4, marginBottom: 4 },
  modalTimerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.emerald}12`, borderRadius: 10, padding: 10,
  },
  modalTimerText: { color: Colors.emerald, fontSize: 14, fontWeight: '500' },
  inputLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: Colors.background, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 12, color: Colors.text, fontSize: 14,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textMuted, fontSize: 15 },
  confirmBtn: {
    flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    backgroundColor: Colors.emerald,
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
