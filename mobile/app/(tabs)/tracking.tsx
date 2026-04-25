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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getWorkoutSessions, WorkoutSession } from '../../services/workouts'
import { getMyOneRepMaxes, OneRepMax, CROSSFIT_LIFTS } from '../../services/one-rep-maxes'
import { Colors } from '../../constants/colors'

const TYPE_LABELS: Record<string, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  STRENGTH: 'Force',
}

const TYPE_COLORS: Record<string, string> = {
  FOR_TIME: Colors.orange,
  AMRAP: Colors.blue,
  EMOM: Colors.violet,
  TABATA: '#ec4899',
  STRENGTH: '#f59e0b',
}

function computeStats(sessions: WorkoutSession[]) {
  const now = new Date()

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const completed = sessions.filter((s) => s.completed_at)
  const thisWeek = completed.filter((s) => new Date(s.started_at) >= startOfWeek)

  const totalDuration = completed.reduce((acc, s) => {
    if (!s.completed_at) return acc
    return acc + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000
  }, 0)

  const weekDuration = thisWeek.reduce((acc, s) => {
    if (!s.completed_at) return acc
    return acc + (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000
  }, 0)

  // Streak
  const dates = [...new Set(completed.map((s) => new Date(s.started_at).toISOString().split('T')[0]))].sort().reverse()
  let streak = 0
  const todayStr = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (dates[0] === todayStr || dates[0] === yesterdayStr) {
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(now)
      expected.setDate(now.getDate() - (dates[0] === todayStr ? i : i + 1))
      if (dates[i] === expected.toISOString().split('T')[0]) streak++
      else break
    }
  }

  // Par type (depuis les sessions enrichies si workout_type dispo, sinon on compte juste total)
  const byType: Record<string, number> = {}
  for (const s of completed) {
    const type = (s as any).workout_type ?? 'AUTRE'
    byType[type] = (byType[type] ?? 0) + 1
  }

  // Activité 30 derniers jours
  const activity: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    activity.push({
      date: dateStr,
      count: completed.filter((s) => new Date(s.started_at).toISOString().split('T')[0] === dateStr).length,
    })
  }

  return { completed, thisWeek, totalDuration, weekDuration, streak, byType, activity }
}

export default function TrackingScreen() {
  const router = useRouter()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [oneRepMaxes, setOneRepMaxes] = useState<OneRepMax[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [sessionsData, ormsData] = await Promise.all([
        getWorkoutSessions(),
        getMyOneRepMaxes().catch(() => [] as OneRepMax[]),
      ])
      setSessions(sessionsData)
      setOneRepMaxes(ormsData)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.orange} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  const { completed, thisWeek, totalDuration, weekDuration, streak, byType, activity } = computeStats(sessions)
  const maxActivity = Math.max(...activity.map((a) => a.count), 1)
  const typeEntries = Object.entries(byType).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const totalByType = typeEntries.reduce((s, [, v]) => s + v, 0)

  const formatDuration = (min: number) => {
    if (min >= 60) return `${Math.round(min / 60)}h${Math.round(min % 60) > 0 ? Math.round(min % 60) + 'm' : ''}`
    return `${Math.round(min)}m`
  }

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 20)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} tintColor={Colors.orange} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Suivi des performances</Text>
          <Text style={styles.subtitle}>Analyse tes progrès</Text>
        </View>

        {/* Stats globales */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completed.length}</Text>
            <Text style={styles.statLabel}>Total workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{thisWeek.length}</Text>
            <Text style={styles.statLabel}>Cette semaine</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak} {streak > 0 ? '🔥' : ''}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
            <Text style={styles.statLabel}>Temps total</Text>
          </View>
        </View>

        {/* Activité 30 jours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Activité — 30 derniers jours</Text>
          <View style={styles.activityChart}>
            {activity.map((day, i) => (
              <View key={i} style={styles.activityBar}>
                <View
                  style={[
                    styles.activityFill,
                    {
                      height: day.count > 0 ? Math.max(4, (day.count / maxActivity) * 48) : 2,
                      backgroundColor: day.count > 0 ? Colors.orange : Colors.border,
                      opacity: day.count > 0 ? 1 : 0.4,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.activityLabels}>
            <Text style={styles.activityLabel}>Il y a 30j</Text>
            <Text style={styles.activityLabel}>Aujourd'hui</Text>
          </View>
        </View>

        {/* Workouts par type */}
        {typeEntries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Répartition par type</Text>
            <View style={styles.typeList}>
              {typeEntries.map(([type, count]) => {
                const pct = totalByType > 0 ? (count / totalByType) * 100 : 0
                const color = TYPE_COLORS[type] ?? Colors.textMuted
                return (
                  <View key={type} style={styles.typeRow}>
                    <Text style={styles.typeLabel}>{TYPE_LABELS[type] ?? type}</Text>
                    <View style={styles.typeBarBg}>
                      <View style={[styles.typeBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.typeCount, { color }]}>{count}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Durée semaine */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱ Durée cette semaine</Text>
          <Text style={styles.durationBig}>{formatDuration(weekDuration)}</Text>
          <Text style={styles.durationSub}>temps actif sur les 7 derniers jours</Text>
        </View>

        {/* 1RM Benchmarks */}
        {oneRepMaxes.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>🏋️ 1RMs actuels</Text>
              <TouchableOpacity onPress={() => router.push('/benchmarks' as any)}>
                <Text style={styles.linkText}>Benchmarks →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ormGrid}>
              {CROSSFIT_LIFTS.filter((lift) => oneRepMaxes.some((o) => o.lift === lift.value)).map((lift) => {
                const orm = oneRepMaxes.find((o) => o.lift === lift.value)
                if (!orm) return null
                return (
                  <View key={lift.value} style={styles.ormCard}>
                    <Text style={styles.ormValue}>{orm.value}<Text style={styles.ormUnit}> kg</Text></Text>
                    <Text style={styles.ormLabel} numberOfLines={1}>{lift.label}</Text>
                    <View style={[styles.ormBadge, { backgroundColor: orm.source === 'real' ? `${Colors.emerald}18` : `${Colors.orange}18` }]}>
                      <Text style={[styles.ormBadgeText, { color: orm.source === 'real' ? Colors.emerald : Colors.orange }]}>
                        {orm.source === 'real' ? 'Réel' : 'Estimé'}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Benchmarks raccourci */}
        <TouchableOpacity style={styles.benchmarkBanner} onPress={() => router.push('/benchmarks' as any)} activeOpacity={0.8}>
          <View style={styles.benchmarkBannerLeft}>
            <Ionicons name="trophy" size={20} color={Colors.orange} />
            <View>
              <Text style={styles.benchmarkBannerTitle}>Workouts Benchmarks</Text>
              <Text style={styles.benchmarkBannerSub}>The Girls, Hero WODs et plus</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />
        </TouchableOpacity>

        {/* Historique complet */}
        <View style={[styles.card, { marginBottom: 32 }]}>
          <Text style={styles.cardTitle}>Historique complet</Text>
          {recentSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune séance enregistrée</Text>
            </View>
          ) : (
            recentSessions.map((s) => {
              const duration = s.completed_at
                ? Math.round((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000)
                : null
              return (
                <View key={s.id} style={styles.historyRow}>
                  <View style={[styles.historyDot, { backgroundColor: s.completed_at ? Colors.emerald : Colors.orange }]} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {new Date(s.started_at).toLocaleDateString('fr-FR', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </Text>
                    {duration !== null && (
                      <Text style={styles.historyDuration}>{duration} min</Text>
                    )}
                  </View>
                  <View style={[styles.historyBadge, {
                    backgroundColor: s.completed_at ? `${Colors.emerald}18` : `${Colors.orange}18`,
                  }]}>
                    <Text style={[styles.historyBadgeText, {
                      color: s.completed_at ? Colors.emerald : Colors.orange,
                    }]}>
                      {s.completed_at ? 'Complété' : 'En cours'}
                    </Text>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginBottom: 8, gap: 8,
  },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  statValue: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },

  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  linkText: { color: Colors.orange, fontSize: 13, fontWeight: '600' },
  ormGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ormCard: {
    width: '30%', backgroundColor: Colors.background, borderRadius: 12,
    padding: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 2,
  },
  ormValue: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  ormUnit: { fontSize: 12, color: Colors.textMuted, fontWeight: '400' },
  ormLabel: { color: Colors.textFaint, fontSize: 10, textAlign: 'center' },
  ormBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  ormBadgeText: { fontSize: 9, fontWeight: '600' },
  benchmarkBanner: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  benchmarkBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benchmarkBannerTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  benchmarkBannerSub: { color: Colors.textFaint, fontSize: 12, marginTop: 1 },

  activityChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 56 },
  activityBar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 56 },
  activityFill: { width: '100%', borderRadius: 2, minHeight: 2 },
  activityLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  activityLabel: { color: Colors.textFaint, fontSize: 10 },

  typeList: { gap: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeLabel: { color: Colors.textMuted, fontSize: 13, width: 80 },
  typeBarBg: { flex: 1, height: 8, backgroundColor: `${Colors.border}`, borderRadius: 4, overflow: 'hidden' },
  typeBarFill: { height: '100%', borderRadius: 4 },
  typeCount: { fontSize: 13, fontWeight: '600', width: 24, textAlign: 'right' },

  durationBig: { color: Colors.orange, fontSize: 42, fontWeight: 'bold' },
  durationSub: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },

  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyInfo: { flex: 1 },
  historyDate: { color: Colors.text, fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  historyDuration: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  historyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  historyBadgeText: { fontSize: 12, fontWeight: '500' },
})
