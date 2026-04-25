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
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../services/api'
import { getWorkoutSessions, WorkoutSession } from '../../services/workouts'
import { Colors } from '../../constants/colors'

interface Schedule {
  id: string
  workout_id?: string
  workout_name?: string
  scheduled_date: string
  status: string
  estimated_duration?: number
  intensity?: string
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function CalendarScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  // Log modal
  const [logTarget, setLogTarget] = useState<Schedule | null>(null)
  const [logResult, setLogResult] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [logging, setLogging] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [schedulesRes, sessionsData] = await Promise.all([
        api.get<{ rows: Schedule[]; count: number } | Schedule[]>('/workout-schedule'),
        getWorkoutSessions(),
      ])
      // Gérer les deux formats possibles (tableau direct ou { rows, count })
      const schedulesArr = Array.isArray(schedulesRes)
        ? schedulesRes
        : (schedulesRes as any).rows ?? []
      setSchedules(schedulesArr)
      setSessions(sessionsData)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function getDaysInMonth(year: number, month: number) {
    // Commence la semaine le lundi (0 = lundi)
    const firstDayRaw = new Date(year, month, 1).getDay()
    const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  function dateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getEventsForDate(date: string) {
    const scheduled = schedules.filter((s) => {
      const d = new Date(s.scheduled_date)
      const adjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      return adjusted.toISOString().split('T')[0] === date && s.status === 'scheduled'
    })
    const completed = sessions.filter(
      (s) => new Date(s.started_at).toISOString().split('T')[0] === date && s.completed_at
    )
    const inProgress = sessions.filter(
      (s) => new Date(s.started_at).toISOString().split('T')[0] === date && !s.completed_at
    )
    return { scheduled, completed, inProgress }
  }

  const today = new Date().toISOString().split('T')[0]
  const days = getDaysInMonth(currentMonth.year, currentMonth.month)
  const selectedEvents = getEventsForDate(selectedDate)
  const totalEvents = selectedEvents.completed.length + selectedEvents.scheduled.length + selectedEvents.inProgress.length

  function prevMonth() {
    setCurrentMonth((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  }
  function nextMonth() {
    setCurrentMonth((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })
  }
  function goToToday() {
    const d = new Date()
    setCurrentMonth({ year: d.getFullYear(), month: d.getMonth() })
    setSelectedDate(today)
  }

  function openLog(schedule: Schedule) {
    setLogTarget(schedule)
    setLogResult('')
    setLogNotes('')
  }

  async function handleLog() {
    if (!logTarget) return
    setLogging(true)
    try {
      const now = new Date()
      const session = await api.post<{ id: string }>('/workout-sessions', {
        workout_id: logTarget.workout_id,
        started_at: now.toISOString(),
      })
      await api.patch(`/workout-sessions/${session.id}`, {
        completed_at: now.toISOString(),
        notes: [logResult.trim() ? `Résultat : ${logResult.trim()}` : '', logNotes.trim()].filter(Boolean).join('\n') || undefined,
      })
      setLogTarget(null)
      Alert.alert('Séance enregistrée !', `"${logTarget.workout_name ?? 'Workout'}" logué.`, [{ text: 'Super !' }])
      // Rafraîchir les données
      loadData()
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} tintColor={Colors.orange} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calendrier</Text>
            <Text style={styles.subtitle}>Planning & historique</Text>
          </View>
          <TouchableOpacity style={styles.todayBtn} onPress={goToToday}>
            <Text style={styles.todayBtnText}>Aujourd'hui</Text>
          </TouchableOpacity>
        </View>

        {/* Calendrier */}
        <View style={styles.calendarCard}>
          {/* Navigation mois */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Jours de la semaine */}
          <View style={styles.weekDaysRow}>
            {DAY_NAMES.map((d, i) => (
              <Text key={i} style={styles.weekDay}>{d}</Text>
            ))}
          </View>

          {/* Grille */}
          <View style={styles.grid}>
            {days.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />
              const dateStr = dateKey(currentMonth.year, currentMonth.month, day)
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const { scheduled, completed } = getEventsForDate(dateStr)
              const hasCompleted = completed.length > 0
              const hasScheduled = scheduled.length > 0

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                    isToday && !isSelected && styles.dayNumberToday,
                  ]}>
                    {day}
                  </Text>
                  <View style={styles.dotRow}>
                    {hasCompleted && <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : Colors.emerald }]} />}
                    {hasScheduled && <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : Colors.orange }]} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Légende */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.emerald }]} />
              <Text style={styles.legendText}>Complété</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
              <Text style={styles.legendText}>Planifié</Text>
            </View>
          </View>
        </View>

        {/* Détail du jour sélectionné */}
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle} numberOfLines={1}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </Text>

          {totalEvents === 0 ? (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyDayEmoji}>🧘</Text>
              <Text style={styles.emptyDayText}>Jour de repos</Text>
              <Text style={styles.emptyDaySub}>Aucun workout ce jour</Text>
            </View>
          ) : (
            <>
              {selectedEvents.completed.map((s) => (
                <View key={s.id} style={[styles.eventCard, { borderLeftColor: Colors.emerald }]}>
                  <View style={[styles.eventDot, { backgroundColor: Colors.emerald }]} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>Workout complété</Text>
                    {s.completed_at && (
                      <Text style={styles.eventMeta}>
                        ⏱ {Math.round((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min
                      </Text>
                    )}
                  </View>
                  <View style={[styles.eventBadge, { backgroundColor: `${Colors.emerald}18` }]}>
                    <Text style={[styles.eventBadgeText, { color: Colors.emerald }]}>Complété</Text>
                  </View>
                </View>
              ))}
              {selectedEvents.inProgress.map((s) => (
                <View key={s.id} style={[styles.eventCard, { borderLeftColor: Colors.blue }]}>
                  <View style={[styles.eventDot, { backgroundColor: Colors.blue }]} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>Workout en cours</Text>
                  </View>
                  <View style={[styles.eventBadge, { backgroundColor: `${Colors.blue}18` }]}>
                    <Text style={[styles.eventBadgeText, { color: Colors.blue }]}>En cours</Text>
                  </View>
                </View>
              ))}
              {selectedEvents.scheduled.map((s) => (
                <View key={s.id} style={[styles.eventCard, { borderLeftColor: Colors.orange }]}>
                  <View style={[styles.eventDot, { backgroundColor: Colors.orange }]} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{s.workout_name ?? 'Workout planifié'}</Text>
                    {s.estimated_duration ? (
                      <Text style={styles.eventMeta}>⏱ {s.estimated_duration} min</Text>
                    ) : null}
                  </View>
                  {s.workout_id ? (
                    <TouchableOpacity
                      style={styles.logEventBtn}
                      onPress={() => openLog(s)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={14} color={Colors.emerald} />
                      <Text style={styles.logEventBtnText}>Logger</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.eventBadge, { backgroundColor: `${Colors.orange}18` }]}>
                      <Text style={[styles.eventBadgeText, { color: Colors.orange }]}>Planifié</Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de log depuis le calendrier */}
      <Modal visible={logTarget !== null} transparent animationType="slide" onRequestClose={() => setLogTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Logger : {logTarget?.workout_name ?? 'Workout'}</Text>
            <Text style={styles.modalDate}>
              {logTarget ? new Date(logTarget.scheduled_date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            </Text>

            <Text style={styles.inputLabel}>Résultat (temps, rounds, kg…)</Text>
            <TextInput
              style={styles.input}
              value={logResult}
              onChangeText={setLogResult}
              placeholder="Ex: 14:32, 8 rounds+5, 80kg..."
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogTarget(null)}>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  todayBtn: {
    backgroundColor: `${Colors.orange}20`, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: `${Colors.orange}40`,
  },
  todayBtnText: { color: Colors.orange, fontSize: 13, fontWeight: '600' },

  calendarCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.orange}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  navArrow: { color: Colors.orange, fontSize: 22, lineHeight: 26 },
  monthTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },

  weekDaysRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', color: Colors.textFaint, fontSize: 12, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 4,
  },
  dayCellSelected: { backgroundColor: Colors.orange },
  dayCellToday: { backgroundColor: `${Colors.orange}20`, borderWidth: 1, borderColor: `${Colors.orange}50` },
  dayNumber: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  dayNumberSelected: { color: '#fff', fontWeight: 'bold' },
  dayNumberToday: { color: Colors.orange, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2, height: 5 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  legend: {
    flexDirection: 'row', gap: 16, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textMuted, fontSize: 12 },

  detailSection: { paddingHorizontal: 16, paddingBottom: 32 },
  detailTitle: {
    color: Colors.text, fontSize: 17, fontWeight: '700',
    marginBottom: 12, textTransform: 'capitalize',
  },

  emptyDay: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    gap: 6,
  },
  emptyDayEmoji: { fontSize: 32 },
  emptyDayText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptyDaySub: { color: Colors.textFaint, fontSize: 13 },

  eventCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventInfo: { flex: 1 },
  eventName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  eventMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  eventBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  eventBadgeText: { fontSize: 12, fontWeight: '500' },
  logEventBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.emerald}15`, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: `${Colors.emerald}35`,
  },
  logEventBtnText: { color: Colors.emerald, fontSize: 12, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  modalDate: { color: Colors.textMuted, fontSize: 13, marginTop: -4, marginBottom: 4, textTransform: 'capitalize' },
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
