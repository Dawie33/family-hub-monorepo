import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../services/api'
import { Colors } from '../../constants/colors'

function fmt(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ─── For Time ─────────────────────────────────────────────────────────────────
function ForTimeTimer({ cap, onFinish }: { cap?: number; onFinish: (elapsed: number) => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const capSec = cap ? cap * 60 : null

  useEffect(() => {
    if (countdown === null || countdown === 0) return
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null
        if (c <= 1) { Vibration.vibrate(200); setRunning(true); return null }
        Vibration.vibrate(50)
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [countdown])

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        if (capSec && next >= capSec) {
          setRunning(false); setDone(true)
          Vibration.vibrate([0, 300, 100, 300])
          return capSec
        }
        return next
      })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, capSec])

  const handleStart = () => {
    if (elapsed === 0 && !running) setCountdown(5)
    else setRunning((r) => !r)
  }
  const reset = () => {
    if (ref.current) clearInterval(ref.current)
    setElapsed(0); setRunning(false); setCountdown(null); setDone(false)
  }

  const pct = capSec ? Math.min(elapsed / capSec, 1) : 0
  const circumference = 2 * Math.PI * 80

  if (countdown !== null && countdown > 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.prepText}>Préparez-vous...</Text>
        <Text style={[styles.countdownNum, { color: Colors.orange }]}>{countdown}</Text>
        <Text style={styles.prepSub}>Get Ready!</Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <View style={[styles.typeBadge, { borderColor: `${Colors.orange}40`, backgroundColor: `${Colors.orange}15` }]}>
        <Text style={[styles.typeLabel, { color: Colors.orange }]}>FOR TIME</Text>
      </View>

      {/* Ring + timer */}
      <View style={styles.ringContainer}>
        {capSec ? (
          <View style={styles.svgWrap}>
            <View style={[styles.ringBg, { borderColor: 'rgba(148,163,184,0.1)' }]} />
            <View style={[styles.ringFill, {
              borderColor: done ? Colors.emerald : Colors.orange,
              borderTopColor: 'transparent',
              transform: [{ rotate: `${pct * 360 - 90}deg` }],
              opacity: pct > 0 ? 1 : 0,
            }]} />
          </View>
        ) : null}
        <Text style={styles.mainTimer}>{fmt(elapsed)}</Text>
      </View>

      {capSec && (
        <Text style={styles.capText}>
          Cap : <Text style={{ color: Colors.text, fontWeight: '600' }}>{fmt(capSec)}</Text>
        </Text>
      )}

      {done && (
        <View style={[styles.statusBox, { backgroundColor: `${Colors.rose}20`, borderColor: `${Colors.rose}40` }]}>
          <Text style={[styles.statusText, { color: Colors.rose }]}>Time Cap atteint !</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.orange }]} onPress={handleStart} disabled={done}>
          <Ionicons name={running ? 'pause' : 'play'} size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtnSecondary} onPress={reset}>
          <Ionicons name="refresh" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        {!running && elapsed > 0 && (
          <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.emerald }]} onPress={() => onFinish(elapsed)}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!running && elapsed === 0 && (
        <Text style={styles.hint}>Appuie sur play pour démarrer</Text>
      )}
    </View>
  )
}

// ─── AMRAP ────────────────────────────────────────────────────────────────────
function AMRAPTimer({ duration, onFinish }: { duration: number; onFinish: (elapsed: number) => void }) {
  const totalSec = duration * 60
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [rounds, setRounds] = useState(0)
  const [done, setDone] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown === null || countdown === 0) return
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null
        if (c <= 1) { Vibration.vibrate(200); setRunning(true); return null }
        Vibration.vibrate(50); return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [countdown])

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        if (next >= totalSec) {
          setRunning(false); setDone(true)
          Vibration.vibrate([0, 300, 100, 300])
          return totalSec
        }
        if (totalSec - next === 10) Vibration.vibrate([0, 100, 100, 100])
        return next
      })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, totalSec])

  const remaining = totalSec - elapsed
  const pct = elapsed / totalSec

  const handleStart = () => {
    if (elapsed === 0 && !running) setCountdown(5)
    else setRunning((r) => !r)
  }
  const reset = () => {
    if (ref.current) clearInterval(ref.current)
    setElapsed(0); setRunning(false); setCountdown(null); setRounds(0); setDone(false)
  }

  if (countdown !== null && countdown > 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.prepText}>Préparez-vous...</Text>
        <Text style={[styles.countdownNum, { color: Colors.orange }]}>{countdown}</Text>
        <Text style={styles.prepSub}>Get Ready!</Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <View style={[styles.typeBadge, { borderColor: `${Colors.orange}40`, backgroundColor: `${Colors.orange}15` }]}>
        <Text style={[styles.typeLabel, { color: Colors.orange }]}>AMRAP</Text>
      </View>

      <View style={styles.ringContainer}>
        <View style={styles.svgWrap}>
          <View style={[styles.ringBg, { borderColor: 'rgba(148,163,184,0.1)' }]} />
          <View style={[styles.ringFill, {
            borderColor: Colors.orange,
            borderTopColor: 'transparent',
            transform: [{ rotate: `${pct * 360 - 90}deg` }],
            opacity: pct > 0 ? 1 : 0,
          }]} />
        </View>
        <Text style={styles.mainTimer}>{fmt(remaining)}</Text>
      </View>

      <Text style={styles.capText}>
        Durée : <Text style={{ color: Colors.text, fontWeight: '600' }}>{fmt(totalSec)}</Text>
      </Text>

      {/* Rounds */}
      <View style={styles.roundBox}>
        <Text style={styles.roundLabel}>Rounds complétés</Text>
        <Text style={[styles.roundValue, { color: Colors.orange }]}>{rounds}</Text>
        <TouchableOpacity
          style={[styles.roundBtn, !running && { opacity: 0.4 }]}
          onPress={() => setRounds((r) => r + 1)}
          disabled={!running}
        >
          <Text style={styles.roundBtnText}>+ Round</Text>
        </TouchableOpacity>
      </View>

      {done && (
        <View style={[styles.statusBox, { backgroundColor: `${Colors.emerald}20`, borderColor: `${Colors.emerald}40` }]}>
          <Text style={[styles.statusText, { color: Colors.emerald }]}>AMRAP Terminé ! {rounds} round{rounds !== 1 ? 's' : ''}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.orange }]} onPress={handleStart} disabled={done}>
          <Ionicons name={running ? 'pause' : 'play'} size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtnSecondary} onPress={reset}>
          <Ionicons name="refresh" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        {done && (
          <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.emerald }]} onPress={() => onFinish(elapsed)}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!running && elapsed === 0 && (
        <Text style={styles.hint}>Appuie sur play pour démarrer</Text>
      )}
    </View>
  )
}

// ─── EMOM ─────────────────────────────────────────────────────────────────────
function EMOMTimer({ duration, onFinish }: { duration: number; onFinish: (elapsed: number) => void }) {
  const totalSec = duration * 60
  const intervalSec = 60
  const totalRounds = Math.ceil(totalSec / intervalSec)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentRound = Math.floor(elapsed / intervalSec) + 1
  const roundElapsed = elapsed % intervalSec
  const roundRemaining = intervalSec - roundElapsed
  const totalProgress = elapsed / totalSec

  useEffect(() => {
    if (countdown === null || countdown === 0) return
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null
        if (c <= 1) { Vibration.vibrate(200); setRunning(true); return null }
        Vibration.vibrate(50); return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [countdown])

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        const nextRoundElapsed = next % intervalSec
        if (nextRoundElapsed === 0 && next < totalSec) Vibration.vibrate([0, 200, 100, 200])
        if (intervalSec - nextRoundElapsed === 10 && next < totalSec) Vibration.vibrate([0, 100, 100, 100])
        if (next >= totalSec) {
          setRunning(false); setDone(true)
          Vibration.vibrate([0, 300, 100, 300])
          return totalSec
        }
        return next
      })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, totalSec])

  const handleStart = () => {
    if (elapsed === 0 && !running) setCountdown(5)
    else setRunning((r) => !r)
  }
  const reset = () => {
    if (ref.current) clearInterval(ref.current)
    setElapsed(0); setRunning(false); setCountdown(null); setDone(false)
  }
  const skipRound = () => setElapsed(currentRound * intervalSec)

  const ringPct = roundElapsed / intervalSec

  if (countdown !== null && countdown > 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.prepText}>Préparez-vous...</Text>
        <Text style={[styles.countdownNum, { color: Colors.violet }]}>{countdown}</Text>
        <Text style={styles.prepSub}>Get Ready!</Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <View style={[styles.typeBadge, { borderColor: `${Colors.violet}40`, backgroundColor: `${Colors.violet}15` }]}>
        <Text style={[styles.typeLabel, { color: Colors.violet }]}>EMOM</Text>
      </View>

      <Text style={styles.roundIndicator}>
        Round <Text style={{ color: Colors.text, fontWeight: 'bold', fontSize: 22 }}>{Math.min(currentRound, totalRounds)}</Text> / {totalRounds}
      </Text>

      <View style={styles.ringContainer}>
        <View style={styles.svgWrap}>
          <View style={[styles.ringBg, { borderColor: 'rgba(148,163,184,0.1)' }]} />
          <View style={[styles.ringFill, {
            borderColor: Colors.violet,
            borderTopColor: 'transparent',
            transform: [{ rotate: `${ringPct * 360 - 90}deg` }],
            opacity: ringPct > 0 ? 1 : 0,
          }]} />
        </View>
        <Text style={[styles.mainTimer, { color: Colors.violet }]}>{fmt(roundRemaining)}</Text>
      </View>

      {/* Progression totale */}
      <View style={styles.totalProgress}>
        <View style={styles.totalProgressRow}>
          <Text style={styles.totalProgressLabel}>Total : {fmt(elapsed)}</Text>
          <Text style={styles.totalProgressLabel}>{fmt(totalSec)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${totalProgress * 100}%`, backgroundColor: `${Colors.violet}80` }]} />
        </View>
      </View>

      {done && (
        <View style={[styles.statusBox, { backgroundColor: `${Colors.emerald}20`, borderColor: `${Colors.emerald}40` }]}>
          <Text style={[styles.statusText, { color: Colors.emerald }]}>EMOM Terminé ! {totalRounds} rounds</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.violet }]} onPress={handleStart} disabled={done}>
          <Ionicons name={running ? 'pause' : 'play'} size={26} color="#fff" />
        </TouchableOpacity>
        {running && currentRound < totalRounds && (
          <TouchableOpacity style={styles.ctrlBtnSecondary} onPress={skipRound}>
            <Ionicons name="play-skip-forward" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ctrlBtnSecondary} onPress={reset}>
          <Ionicons name="refresh" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        {done && (
          <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.emerald }]} onPress={() => onFinish(elapsed)}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!running && elapsed === 0 && (
        <Text style={styles.hint}>Appuie sur play pour démarrer</Text>
      )}
    </View>
  )
}

// ─── Chrono générique (Strength, Tabata, autres) ───────────────────────────────
function ChronoTimer({ type, onFinish }: { type: string; onFinish: (elapsed: number) => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])

  const reset = () => {
    if (ref.current) clearInterval(ref.current)
    setElapsed(0); setRunning(false)
  }
  const label = type?.toUpperCase().replace('_', ' ') || 'CHRONO'
  const color = type === 'strength' ? '#f59e0b' : Colors.orange

  return (
    <View style={styles.center}>
      <View style={[styles.typeBadge, { borderColor: `${color}40`, backgroundColor: `${color}15` }]}>
        <Text style={[styles.typeLabel, { color }]}>{label}</Text>
      </View>

      <Text style={[styles.mainTimer, { marginVertical: 32 }]}>{fmt(elapsed)}</Text>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: color }]} onPress={() => setRunning((r) => !r)}>
          <Ionicons name={running ? 'pause' : 'play'} size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtnSecondary} onPress={reset}>
          <Ionicons name="refresh" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        {!running && elapsed > 0 && (
          <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: Colors.emerald }]} onPress={() => onFinish(elapsed)}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!running && elapsed === 0 && (
        <Text style={styles.hint}>Appuie sur play pour démarrer</Text>
      )}
    </View>
  )
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function TimerScreen() {
  const { type, duration, name, workoutId } = useLocalSearchParams<{
    type: string; duration: string; name: string; workoutId: string
  }>()
  const router = useRouter()
  const [logged, setLogged] = useState(false)
  const startedAtRef = useRef(new Date())

  async function handleFinish(elapsedSec: number) {
    try {
      const session = await api.post<{ id: string }>('/workout-sessions', {
        workout_id: workoutId,
        started_at: startedAtRef.current.toISOString(),
      })
      await api.patch(`/workout-sessions/${session.id}`, {
        completed_at: new Date().toISOString(),
      })
      setLogged(true)
      Alert.alert(
        'Workout logué !',
        `Durée : ${fmt(elapsedSec)}`,
        [{ text: 'Top !', onPress: () => router.back() }]
      )
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la séance')
    }
  }

  const dur = Number(duration) || 20
  const t = type ?? ''

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name ?? 'Timer'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Timer adapté au type */}
      {(t === 'for_time' || t === 'FOR_TIME') && (
        <ForTimeTimer cap={dur} onFinish={handleFinish} />
      )}
      {(t === 'amrap' || t === 'AMRAP') && (
        <AMRAPTimer duration={dur} onFinish={handleFinish} />
      )}
      {(t === 'emom' || t === 'EMOM') && (
        <EMOMTimer duration={dur} onFinish={handleFinish} />
      )}
      {!['for_time', 'FOR_TIME', 'amrap', 'AMRAP', 'emom', 'EMOM'].includes(t) && (
        <ChronoTimer type={t} onFinish={handleFinish} />
      )}
    </SafeAreaView>
  )
}

const RING_SIZE = 180

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },

  typeBadge: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 50, borderWidth: 1,
  },
  typeLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 2 },

  // Countdown
  prepText: { color: Colors.textMuted, fontSize: 14 },
  countdownNum: { fontSize: 96, fontWeight: 'bold' },
  prepSub: { color: Colors.textMuted, fontSize: 14 },

  // Ring + timer
  ringContainer: { width: RING_SIZE + 40, height: RING_SIZE + 40, alignItems: 'center', justifyContent: 'center' },
  svgWrap: { position: 'absolute', width: RING_SIZE + 40, height: RING_SIZE + 40, alignItems: 'center', justifyContent: 'center' },
  ringBg: {
    position: 'absolute',
    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
    borderWidth: 4, borderColor: 'rgba(148,163,184,0.1)',
  },
  ringFill: {
    position: 'absolute',
    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
    borderWidth: 4,
  },
  mainTimer: { color: Colors.text, fontSize: 64, fontWeight: '200', letterSpacing: 2 },

  capText: { color: Colors.textMuted, fontSize: 16 },
  roundIndicator: { color: Colors.textMuted, fontSize: 16 },

  // Rounds (AMRAP)
  roundBox: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 4,
    minWidth: 160,
  },
  roundLabel: { color: Colors.textMuted, fontSize: 13 },
  roundValue: { fontSize: 40, fontWeight: 'bold' },
  roundBtn: {
    marginTop: 6, backgroundColor: `${Colors.orange}20`,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8,
  },
  roundBtnText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },

  // Total progress (EMOM)
  totalProgress: { width: '100%', gap: 4 },
  totalProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalProgressLabel: { color: Colors.textFaint, fontSize: 12 },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  // Status
  statusBox: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1 },
  statusText: { fontSize: 14, fontWeight: '600' },

  // Controls
  controls: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  ctrlBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlBtnSecondary: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  hint: { color: Colors.textFaint, fontSize: 13 },
})
