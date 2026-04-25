import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { getWorkoutSessions, getDailyWorkout, Workout, WorkoutSession } from '../../services/workouts'
import { api } from '../../services/api'
import { Colors } from '../../constants/colors'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkillProgram {
  id: string
  skill_name: string
  total_steps: number
  completed_steps: number
}

const TYPE_LABELS: Record<string, string> = {
  for_time: 'For Time', FOR_TIME: 'For Time',
  amrap: 'AMRAP', AMRAP: 'AMRAP',
  emom: 'EMOM', EMOM: 'EMOM',
  tabata: 'Tabata', TABATA: 'Tabata',
  strength: 'Force', STRENGTH: 'Force',
  interval: 'Interval', endurance: 'Endurance', tempo: 'Tempo',
}

const TYPE_COLORS: Record<string, string> = {
  for_time: Colors.orange, FOR_TIME: Colors.orange,
  amrap: Colors.blue, AMRAP: Colors.blue,
  emom: Colors.violet, EMOM: Colors.violet,
  tabata: '#ec4899', TABATA: '#ec4899',
  strength: '#f59e0b', STRENGTH: '#f59e0b',
  interval: Colors.emerald, endurance: '#06b6d4', tempo: '#8b5cf6',
}

const INTENSITY_COLORS: Record<string, string> = {
  low: Colors.emerald, faible: Colors.emerald,
  medium: '#f59e0b', moderate: '#f59e0b', moyen: '#f59e0b',
  high: Colors.rose, intense: Colors.rose, very_high: '#dc2626',
}

// ─── Workout du jour ─────────────────────────────────────────────────────────

function DailyWorkoutCard({ workout, onPress }: { workout: Workout | null; onPress: () => void }) {
  if (!workout) {
    return (
      <View style={styles.dailyEmpty}>
        <Text style={styles.dailyLabel}>Workout du jour</Text>
        <Text style={styles.dailyEmptyText}>Aucun workout disponible aujourd'hui</Text>
      </View>
    )
  }

  const intensityColor = workout.intensity
    ? (INTENSITY_COLORS[workout.intensity.toLowerCase()] ?? Colors.textMuted)
    : Colors.textMuted

  return (
    <View style={styles.dailyCard}>
      <View style={styles.dailyBadgeRow}>
        <View style={styles.dailyBadge}>
          <Text style={styles.dailyBadgeText}>Workout du jour</Text>
        </View>
        <View style={styles.dailyBadgeToday}>
          <Text style={styles.dailyBadgeTodayText}>Aujourd'hui</Text>
        </View>
      </View>

      <Text style={styles.dailyTitle}>{workout.name}</Text>
      {workout.description ? (
        <Text style={styles.dailyDesc} numberOfLines={2}>{workout.description}</Text>
      ) : null}

      <View style={styles.dailyMeta}>
        {workout.estimated_duration ? (
          <View style={styles.dailyMetaItem}>
            <Text style={styles.dailyMetaLabel}>Durée</Text>
            <Text style={styles.dailyMetaValue}>{workout.estimated_duration} min</Text>
          </View>
        ) : null}
        {workout.intensity ? (
          <View style={styles.dailyMetaItem}>
            <Text style={styles.dailyMetaLabel}>Intensité</Text>
            <Text style={[styles.dailyMetaValue, { color: intensityColor }]}>
              {workout.intensity}
            </Text>
          </View>
        ) : null}
        {workout.workout_type ? (
          <View style={styles.dailyMetaItem}>
            <Text style={styles.dailyMetaLabel}>Type</Text>
            <Text style={styles.dailyMetaValue}>{TYPE_LABELS[workout.workout_type] ?? workout.workout_type}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.dailyBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.dailyBtnText}>Voir le workout</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

// ─── Vue d'ensemble ──────────────────────────────────────────────────────────

function TrainingOverview({
  sessions,
  skills,
}: {
  sessions: WorkoutSession[]
  skills: SkillProgram[]
}) {
  const [skillIndex, setSkillIndex] = useState(0)
  const now = new Date()

  // Semaine courante (lundi)
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfPrevWeek = new Date(startOfWeek)
  startOfPrevWeek.setDate(startOfWeek.getDate() - 7)

  const thisWeek = sessions.filter((s) => new Date(s.started_at) >= startOfWeek)
  const prevWeek = sessions.filter((s) => {
    const d = new Date(s.started_at)
    return d >= startOfPrevWeek && d < startOfWeek
  })

  const weekDuration = thisWeek.reduce((acc, s) => {
    if (!s.completed_at) return acc
    return acc + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000
  }, 0)

  const durationLabel = weekDuration >= 60
    ? `${Math.round(weekDuration / 60)}h`
    : `${Math.round(weekDuration)}m`

  // Streak
  const completedDates = [...new Set(
    sessions.filter((s) => s.completed_at)
      .map((s) => new Date(s.started_at).toISOString().split('T')[0])
  )].sort().reverse()

  let streak = 0
  const todayStr = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (completedDates[0] === todayStr || completedDates[0] === yesterdayStr) {
    for (let i = 0; i < completedDates.length; i++) {
      const expected = new Date(now)
      expected.setDate(now.getDate() - (completedDates[0] === todayStr ? i : i + 1))
      if (completedDates[i] === expected.toISOString().split('T')[0]) streak++
      else break
    }
  }

  // Trend
  const delta = thisWeek.length - prevWeek.length
  const trendColor = delta > 0 ? Colors.emerald : delta < 0 ? Colors.rose : Colors.textMuted
  const trendText = delta > 0 ? `+${delta} vs S-1` : delta < 0 ? `${delta} vs S-1` : '= vs S-1'

  // Type distribution (depuis sessions si disponible)
  const typeCounts: Record<string, number> = {}
  sessions.forEach((s) => {
    const t = (s as any).workout_type
    if (t) typeCounts[t] = (typeCounts[t] ?? 0) + 1
  })
  const typeTotal = Object.values(typeCounts).reduce((a, b) => a + b, 0)
  const typeDistrib = Object.entries(typeCounts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([type, count]) => ({ type, count, pct: Math.round((count / typeTotal) * 100) }))

  return (
    <View style={styles.overviewCard}>
      <Text style={styles.sectionTitle}>Vue d'ensemble</Text>

      {/* Stats 3 colonnes */}
      <View style={styles.overviewRow}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>{thisWeek.length}</Text>
          <Text style={styles.overviewLabel}>Cette semaine</Text>
          {prevWeek.length > 0 && (
            <Text style={[styles.overviewTrend, { color: trendColor }]}>{trendText}</Text>
          )}
        </View>
        <View style={[styles.overviewStat, styles.overviewStatBorder]}>
          <Text style={styles.overviewValue}>{durationLabel}</Text>
          <Text style={styles.overviewLabel}>Durée semaine</Text>
          <Text style={styles.overviewTrend}> </Text>
        </View>
        <View style={styles.overviewStat}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.overviewValue}>{streak}</Text>
            {streak > 0 && <Ionicons name="flame" size={18} color={Colors.orange} />}
          </View>
          <Text style={styles.overviewLabel}>Streak</Text>
          <Text style={styles.overviewTrend}>jours consécutifs</Text>
        </View>
      </View>

      {/* Distribution des types */}
      {typeDistrib.length > 0 && (
        <View style={styles.typeSection}>
          <Text style={styles.typeSectionTitle}>Répartition des types</Text>
          {typeDistrib.map(({ type, count, pct }) => {
            const color = TYPE_COLORS[type] ?? Colors.textFaint
            return (
              <View key={type} style={styles.typeRow}>
                <Text style={styles.typeLabel}>{TYPE_LABELS[type] ?? type}</Text>
                <View style={styles.typeBar}>
                  <View style={[styles.typeBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Skills actifs — carrousel */}
      <View style={styles.skillsSection}>
        {skills.length > 0 ? (
          <>
            <View style={styles.skillsHeader}>
              <Text style={styles.typeSectionTitle}>Progressions actives</Text>
            </View>
            <View style={styles.skillCarousel}>
              <TouchableOpacity
                onPress={() => setSkillIndex((i) => (i - 1 + skills.length) % skills.length)}
                disabled={skills.length <= 1}
                style={[styles.carouselArrow, skills.length <= 1 && { opacity: 0.2 }]}
              >
                <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <View style={styles.skillCarouselTop}>
                  <Text style={styles.skillName} numberOfLines={1}>
                    {skills[skillIndex].skill_name}
                  </Text>
                  <Text style={styles.skillSteps}>
                    {skills[skillIndex].completed_steps}/{skills[skillIndex].total_steps} étapes
                  </Text>
                </View>
                <View style={styles.skillBar}>
                  <View style={[styles.skillBarFill, {
                    width: skills[skillIndex].total_steps > 0
                      ? `${Math.round((skills[skillIndex].completed_steps / skills[skillIndex].total_steps) * 100)}%`
                      : '0%',
                  }]} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSkillIndex((i) => (i + 1) % skills.length)}
                disabled={skills.length <= 1}
                style={[styles.carouselArrow, skills.length <= 1 && { opacity: 0.2 }]}
              >
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {skills.length > 1 && (
              <View style={styles.carouselDots}>
                {skills.map((_, i) => (
                  <View key={i} style={[styles.carouselDot, i === skillIndex && styles.carouselDotActive]} />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noSkill}>
            <Ionicons name="barbell-outline" size={16} color={Colors.textFaint} />
            <Text style={styles.noSkillText}>Aucune progression active</Text>
          </View>
        )}
      </View>
    </View>
  )
}

// ─── Planning hebdomadaire ───────────────────────────────────────────────────

function WeeklyCalendar({ sessions }: { sessions: WorkoutSession[] }) {
  const today = new Date()
  const currentDay = today.getDay() === 0 ? 7 : today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + 1)
  monday.setHours(0, 0, 0, 0)

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const isToday = dateStr === today.toISOString().split('T')[0]
    const daySessions = sessions.filter(
      (s) => new Date(s.started_at).toISOString().split('T')[0] === dateStr
    )
    const hasCompleted = daySessions.some((s) => s.completed_at)
    return { date, dateStr, isToday, hasCompleted, count: daySessions.length }
  })

  return (
    <View style={styles.calendarCard}>
      <Text style={styles.sectionTitle}>Planning hebdomadaire</Text>
      <View style={styles.calendarRow}>
        {days.map((day, i) => (
          <View key={i} style={[styles.calendarDay, day.isToday && styles.calendarDayToday]}>
            <Text style={[styles.calendarDayName, day.isToday && { color: Colors.orange }]}>
              {dayNames[i]}
            </Text>
            <Text style={[styles.calendarDayNum, day.isToday && { color: Colors.orange }]}>
              {day.date.getDate()}
            </Text>
            <View style={[
              styles.calendarDot,
              day.hasCompleted && styles.calendarDotCompleted,
              !day.hasCompleted && day.count > 0 && styles.calendarDotScheduled,
            ]} />
          </View>
        ))}
      </View>
      <View style={styles.calendarLegend}>
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
  )
}

// ─── Actions rapides ─────────────────────────────────────────────────────────

function QuickActions({
  onWorkouts,
  onGenerate,
  onCalendar,
}: {
  onWorkouts: () => void
  onGenerate: () => void
  onCalendar: () => void
}) {
  const actions = [
    {
      label: 'Bibliothèque',
      sub: 'Tous les workouts',
      icon: 'barbell-outline' as const,
      iconColor: Colors.orange,
      bg: 'rgba(249,115,22,0.15)',
      onPress: onWorkouts,
    },
    {
      label: 'Générer avec l\'IA',
      sub: 'Workout automatique',
      icon: 'sparkles' as const,
      iconColor: '#a78bfa',
      bg: 'rgba(139,92,246,0.15)',
      onPress: onGenerate,
    },
    {
      label: 'Calendrier',
      sub: 'Planning & historique',
      icon: 'calendar-outline' as const,
      iconColor: Colors.blue,
      bg: 'rgba(59,130,246,0.15)',
      onPress: onCalendar,
    },
  ]

  return (
    <View style={styles.actionsCard}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      {actions.map((action, i) => (
        <TouchableOpacity
          key={action.label}
          style={[styles.actionItem, i === actions.length - 1 && { borderBottomWidth: 0 }]}
          onPress={action.onPress}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
            <Ionicons name={action.icon} size={22} color={action.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionSub}>{action.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

// ─── Dashboard principal ─────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [dailyWorkout, setDailyWorkout] = useState<Workout | null>(null)
  const [activeSkills, setActiveSkills] = useState<SkillProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [sessionsData, daily, skills] = await Promise.all([
        getWorkoutSessions(),
        getDailyWorkout(),
        api.get<SkillProgram[]>('/skills?status=active').catch(() => []),
      ])
      setSessions(sessionsData)
      setDailyWorkout(daily)
      setActiveSkills(Array.isArray(skills) ? skills : [])
    } catch {
      // silencieux
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 5)

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
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Mon compte'}
            </Text>
            <Text style={styles.headerDate}>{dateLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile' as any)} style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={32} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Workout du jour */}
        <View style={styles.section}>
          <DailyWorkoutCard
            workout={dailyWorkout}
            onPress={() => dailyWorkout ? router.push(`/workout/${dailyWorkout.id}` as any) : router.push('/(tabs)/workouts')}
          />
        </View>

        {/* Vue d'ensemble */}
        <View style={styles.section}>
          <TrainingOverview sessions={sessions} skills={activeSkills} />
        </View>

        {/* Planning hebdomadaire */}
        <View style={styles.section}>
          <WeeklyCalendar sessions={sessions} />
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <QuickActions
            onWorkouts={() => router.push('/(tabs)/workouts')}
            onGenerate={() => router.push('/workout/generate' as any)}
            onCalendar={() => router.push('/(tabs)/calendar')}
          />
        </View>

        {/* Séances récentes */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Séances récentes</Text>
          {recentSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune séance pour l'instant</Text>
              <Text style={styles.emptySubText}>Lance ton premier workout !</Text>
            </View>
          ) : (
            recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionDot, { backgroundColor: session.completed_at ? Colors.emerald : Colors.orange }]} />
                  <View>
                    <Text style={styles.sessionDate}>
                      {new Date(session.started_at).toLocaleDateString('fr-FR', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </Text>
                    {session.completed_at && (
                      <Text style={styles.sessionDuration}>
                        {Math.round(
                          (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000
                        )} min
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.badge, {
                  backgroundColor: session.completed_at ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)',
                }]}>
                  <Text style={[styles.badgeText, {
                    color: session.completed_at ? Colors.emerald : Colors.orange,
                  }]}>
                    {session.completed_at ? 'Complété' : 'En cours'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { color: Colors.textMuted, fontSize: 14 },
  userName: { fontSize: 28, fontWeight: 'bold', marginTop: 2, color: Colors.text },
  headerDate: { color: Colors.textFaint, fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  profileBtn: { marginTop: 4 },

  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '600', marginBottom: 12 },

  // Workout du jour
  dailyCard: {
    borderRadius: 20, padding: 20,
    backgroundColor: 'rgba(249,115,22,0.08)',
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
  },
  dailyEmpty: {
    borderRadius: 20, padding: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  dailyLabel: { color: Colors.orange, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  dailyEmptyText: { color: Colors.textMuted, fontSize: 14 },
  dailyBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dailyBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.2)',
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
  },
  dailyBadgeText: { color: Colors.orange, fontSize: 12, fontWeight: '600' },
  dailyBadgeToday: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dailyBadgeTodayText: { color: Colors.textMuted, fontSize: 12 },
  dailyTitle: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  dailyDesc: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  dailyMeta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  dailyMetaItem: {},
  dailyMetaLabel: { color: Colors.textFaint, fontSize: 11, marginBottom: 2 },
  dailyMetaValue: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  dailyBtn: {
    backgroundColor: Colors.orange, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  dailyBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Vue d'ensemble
  overviewCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.border, gap: 16,
  },
  overviewRow: { flexDirection: 'row' },
  overviewStat: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  overviewStatBorder: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border,
  },
  overviewValue: { color: Colors.text, fontSize: 26, fontWeight: 'bold' },
  overviewLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  overviewTrend: { color: Colors.textFaint, fontSize: 10, marginTop: 3, textAlign: 'center' },

  // Type distribution
  typeSection: { gap: 8 },
  typeSectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '500', marginBottom: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeLabel: { color: Colors.textMuted, fontSize: 12, width: 70 },
  typeBar: {
    flex: 1, height: 6, backgroundColor: Colors.border,
    borderRadius: 3, overflow: 'hidden',
  },
  typeBarFill: { height: 6, borderRadius: 3 },
  typeCount: { color: Colors.textFaint, fontSize: 11, width: 20, textAlign: 'right' },

  // Skills carrousel
  skillsSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14, gap: 8 },
  skillsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillCarousel: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.border}60`, borderRadius: 12, padding: 12,
  },
  carouselArrow: { padding: 4 },
  skillCarouselTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  skillName: { color: Colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  skillSteps: { color: Colors.textFaint, fontSize: 12, marginLeft: 8 },
  skillBar: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  skillBarFill: {
    height: 5, borderRadius: 3,
    backgroundColor: Colors.orange,
  },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  carouselDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  carouselDotActive: { width: 16, backgroundColor: Colors.orange },
  noSkill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.border}60`, borderRadius: 12, padding: 12,
  },
  noSkillText: { color: Colors.textFaint, fontSize: 13 },

  // Calendrier
  calendarCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarDay: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 12, gap: 4,
  },
  calendarDayToday: { backgroundColor: 'rgba(249,115,22,0.15)' },
  calendarDayName: { color: Colors.textMuted, fontSize: 11 },
  calendarDayNum: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  calendarDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent' },
  calendarDotCompleted: { backgroundColor: Colors.emerald },
  calendarDotScheduled: { backgroundColor: Colors.orange },
  calendarLegend: {
    flexDirection: 'row', gap: 16, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textMuted, fontSize: 12 },

  // Actions rapides
  actionsCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  actionSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  // Séances
  emptyState: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  emptySubText: { color: Colors.textFaint, fontSize: 13, marginTop: 4 },
  sessionCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionDate: { color: Colors.text, fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  sessionDuration: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '500' },
})
