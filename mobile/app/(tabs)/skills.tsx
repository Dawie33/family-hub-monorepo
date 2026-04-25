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
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../services/api'
import { updateSkillStep } from '../../services/skills-service'
import { Colors } from '../../constants/colors'

interface SkillStep {
  id: string
  step_number: number
  title: string
  description?: string
  status: 'locked' | 'in_progress' | 'completed' | 'skipped'
  coaching_tips?: string
  estimated_duration_weeks?: number
}

interface SkillProgram {
  id: string
  skill_name: string
  skill_category?: string
  description?: string
  status: 'active' | 'completed' | 'paused'
  estimated_weeks?: number
  total_steps: number
  completed_steps: number
  steps?: SkillStep[]
}

const CATEGORY_COLORS: Record<string, string> = {
  gymnastics: Colors.violet,
  weightlifting: '#f59e0b',
  conditioning: Colors.emerald,
  mobility: '#06b6d4',
  strength: Colors.orange,
}

const STATUS_COLORS: Record<string, string> = {
  active: Colors.emerald,
  completed: Colors.blue,
  paused: Colors.textFaint,
}

const STEP_STATUS_COLORS: Record<string, string> = {
  locked: Colors.textFaint,
  in_progress: Colors.orange,
  completed: Colors.emerald,
  skipped: Colors.textMuted,
}

const STEP_STATUS_LABELS: Record<string, string> = {
  locked: 'Verrouillé',
  in_progress: 'En cours',
  completed: 'Complété',
  skipped: 'Sauté',
}

export default function SkillsScreen() {
  const router = useRouter()
  const [programs, setPrograms] = useState<SkillProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<SkillProgram | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingStep, setUpdatingStep] = useState<string | null>(null)

  useEffect(() => { loadPrograms() }, [])

  async function loadPrograms() {
    try {
      const data = await api.get<SkillProgram[]>('/skills')
      setPrograms(Array.isArray(data) ? data : [])
    } catch {
      setPrograms([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function openProgram(program: SkillProgram) {
    setSelectedProgram(program)
    if (!program.steps) {
      setDetailLoading(true)
      try {
        const detail = await api.get<SkillProgram>(`/skills/${program.id}`)
        setSelectedProgram(detail)
      } catch {
        // garder les données de base
      } finally {
        setDetailLoading(false)
      }
    }
  }

  async function handleUpdateStep(program: SkillProgram, step: SkillStep, newStatus: SkillStep['status']) {
    setUpdatingStep(step.id)
    try {
      await updateSkillStep(program.id, step.id, { status: newStatus, manually_overridden: true })
      // Mise à jour locale
      const updatedSteps = program.steps?.map((s) =>
        s.id === step.id ? { ...s, status: newStatus } : s
      )
      const completedCount = updatedSteps?.filter((s) => s.status === 'completed').length ?? 0
      const updatedProgram = { ...program, steps: updatedSteps, completed_steps: completedCount }
      setSelectedProgram(updatedProgram)
      setPrograms((prev) => prev.map((p) => p.id === program.id ? { ...p, completed_steps: completedCount } : p))
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de mettre à jour l\'étape')
    } finally {
      setUpdatingStep(null)
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPrograms() }} tintColor={Colors.orange} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Skills</Text>
            <Text style={styles.subtitle}>Programmes de progression</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/skills/new' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.newBtnText}>Nouveau</Text>
          </TouchableOpacity>
        </View>

        {/* Stats globales */}
        {programs.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{programs.length}</Text>
              <Text style={styles.statLabel}>Programmes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{programs.filter(p => p.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{programs.filter(p => p.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>Complétés</Text>
            </View>
          </View>
        )}

        {/* Liste des programmes */}
        <View style={styles.list}>
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color={Colors.textFaint} />
              <Text style={styles.emptyTitle}>Aucun programme</Text>
              <Text style={styles.emptyText}>Crée ton premier programme de progression</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/skills/new' as any)}
              >
                <Ionicons name="sparkles" size={14} color="#fff" />
                <Text style={styles.emptyBtnText}>Créer avec l'IA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            programs.map((program) => {
              const progress = program.total_steps > 0
                ? program.completed_steps / program.total_steps
                : 0
              const catColor = CATEGORY_COLORS[program.skill_category?.toLowerCase() ?? ''] ?? Colors.orange
              const statusColor = STATUS_COLORS[program.status] ?? Colors.textFaint

              return (
                <TouchableOpacity
                  key={program.id}
                  style={styles.card}
                  onPress={() => openProgram(program)}
                  activeOpacity={0.75}
                >
                  {/* Header de la carte */}
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.badges}>
                        {program.skill_category ? (
                          <View style={[styles.badge, { backgroundColor: `${catColor}20` }]}>
                            <Text style={[styles.badgeText, { color: catColor }]}>
                              {program.skill_category}
                            </Text>
                          </View>
                        ) : null}
                        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
                          <Text style={[styles.badgeText, { color: statusColor }]}>
                            {program.status === 'active' ? 'Actif' : program.status === 'completed' ? 'Complété' : 'Pausé'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle}>{program.skill_name}</Text>
                      {program.description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>{program.description}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />
                  </View>

                  {/* Barre de progression */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>
                        {program.completed_steps} / {program.total_steps} étapes
                      </Text>
                      <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: catColor }]} />
                    </View>
                  </View>

                  {program.estimated_weeks ? (
                    <Text style={styles.cardMeta}>⏱ ~{program.estimated_weeks} semaines</Text>
                  ) : null}
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Modal détail */}
      <Modal
        visible={selectedProgram !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProgram(null)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedProgram(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>{selectedProgram?.skill_name}</Text>
            <View style={{ width: 40 }} />
          </View>

          {detailLoading ? (
            <ActivityIndicator color={Colors.orange} size="large" style={{ flex: 1 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {/* Description */}
              {selectedProgram?.description ? (
                <Text style={styles.modalDesc}>{selectedProgram.description}</Text>
              ) : null}

              {/* Progression globale */}
              {selectedProgram && (
                <View style={styles.modalProgress}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      {selectedProgram.completed_steps} / {selectedProgram.total_steps} étapes complétées
                    </Text>
                    <Text style={styles.progressPct}>
                      {selectedProgram.total_steps > 0
                        ? Math.round((selectedProgram.completed_steps / selectedProgram.total_steps) * 100)
                        : 0}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {
                      width: selectedProgram.total_steps > 0
                        ? `${(selectedProgram.completed_steps / selectedProgram.total_steps) * 100}%`
                        : '0%',
                      backgroundColor: Colors.orange,
                    }]} />
                  </View>
                </View>
              )}

              {/* Étapes */}
              {selectedProgram?.steps && selectedProgram.steps.length > 0 ? (
                <View style={styles.stepsSection}>
                  <Text style={styles.stepsSectionTitle}>Étapes de progression</Text>
                  {selectedProgram.steps.map((step, index) => {
                    const stepColor = STEP_STATUS_COLORS[step.status] ?? Colors.textFaint
                    const isLocked = step.status === 'locked'
                    return (
                      <View key={step.id} style={[styles.stepCard, isLocked && styles.stepCardLocked]}>
                        <View style={[styles.stepNum, { backgroundColor: `${stepColor}25`, borderColor: `${stepColor}60` }]}>
                          {step.status === 'completed' ? (
                            <Ionicons name="checkmark" size={14} color={stepColor} />
                          ) : (
                            <Text style={[styles.stepNumText, { color: stepColor }]}>{step.step_number}</Text>
                          )}
                        </View>
                        <View style={styles.stepContent}>
                          <View style={styles.stepTop}>
                            <Text style={[styles.stepTitle, isLocked && { color: Colors.textFaint }]}>
                              {step.title}
                            </Text>
                            <View style={[styles.badge, { backgroundColor: `${stepColor}20` }]}>
                              <Text style={[styles.badgeText, { color: stepColor }]}>
                                {STEP_STATUS_LABELS[step.status]}
                              </Text>
                            </View>
                          </View>
                          {step.description ? (
                            <Text style={styles.stepDesc}>{step.description}</Text>
                          ) : null}
                          {step.coaching_tips && !isLocked ? (
                            <View style={styles.tipBox}>
                              <Ionicons name="bulb-outline" size={13} color={Colors.orange} />
                              <Text style={styles.tipText}>{step.coaching_tips}</Text>
                            </View>
                          ) : null}
                          {step.estimated_duration_weeks ? (
                            <Text style={styles.stepMeta}>⏱ ~{step.estimated_duration_weeks} semaine{step.estimated_duration_weeks > 1 ? 's' : ''}</Text>
                          ) : null}
                          {/* Boutons de statut */}
                          {!isLocked && (
                            <View style={styles.stepActions}>
                              {step.status !== 'in_progress' && (
                                <TouchableOpacity
                                  style={styles.stepActionBtn}
                                  onPress={() => handleUpdateStep(selectedProgram!, step, 'in_progress')}
                                  disabled={updatingStep === step.id}
                                >
                                  {updatingStep === step.id
                                    ? <ActivityIndicator size="small" color={Colors.orange} />
                                    : <Text style={[styles.stepActionText, { color: Colors.orange }]}>En cours</Text>
                                  }
                                </TouchableOpacity>
                              )}
                              {step.status !== 'completed' && (
                                <TouchableOpacity
                                  style={[styles.stepActionBtn, { backgroundColor: `${Colors.emerald}15`, borderColor: `${Colors.emerald}40` }]}
                                  onPress={() => handleUpdateStep(selectedProgram!, step, 'completed')}
                                  disabled={updatingStep === step.id}
                                >
                                  <Text style={[styles.stepActionText, { color: Colors.emerald }]}>✓ Complété</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    )
                  })}
                </View>
              ) : null}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  title: { color: Colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.orange, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 4,
  },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { color: Colors.text, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: Colors.textFaint, fontSize: 11, marginTop: 2 },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: 10,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 32,
  },
  emptyTitle: { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  emptyText: { color: Colors.textFaint, fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 4, backgroundColor: Colors.orange,
    borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
  cardMeta: { color: Colors.textFaint, fontSize: 12 },

  progressSection: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: Colors.textMuted, fontSize: 12 },
  progressPct: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  progressBar: {
    height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  modalContent: { padding: 20, paddingBottom: 40, gap: 16 },
  modalDesc: { color: Colors.textMuted, fontSize: 15, lineHeight: 22 },
  modalProgress: { gap: 8 },

  stepsSection: { gap: 10 },
  stepsSectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  stepCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  stepCardLocked: { opacity: 0.6 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0, marginTop: 2,
  },
  stepNumText: { fontSize: 13, fontWeight: '700' },
  stepContent: { flex: 1, gap: 6 },
  stepTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  stepTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  stepDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
  stepMeta: { color: Colors.textFaint, fontSize: 12 },
  tipBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: `${Colors.orange}12`, borderRadius: 8, padding: 8,
  },
  tipText: { color: Colors.textMuted, fontSize: 12, lineHeight: 16, flex: 1 },
  stepActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  stepActionBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    backgroundColor: `${Colors.orange}15`, borderWidth: 1, borderColor: `${Colors.orange}40`,
  },
  stepActionText: { fontSize: 12, fontWeight: '600' },
})
