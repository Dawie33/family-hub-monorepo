import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../hooks/useAuth'
import { getUserProfile, updateMe, UserProfile } from '../services/users'
import { getMyOneRepMaxes, upsertOneRepMax, CROSSFIT_LIFTS, OneRepMax } from '../services/one-rep-maxes'
import { Colors } from '../constants/colors'

type Tab = 'profile' | 'equipment' | '1rms'

// ─── Données équipements ──────────────────────────────────────────────────────

const EQUIPMENT_CATEGORIES = [
  {
    category: 'Basique',
    items: [
      { value: 'bodyweight', label: 'Poids du corps' },
      { value: 'mat', label: 'Tapis' },
      { value: 'band', label: 'Élastique' },
    ],
  },
  {
    category: 'Haltérophilie',
    items: [
      { value: 'barbell', label: 'Barre olympique' },
      { value: 'plates', label: 'Disques' },
      { value: 'rack', label: 'Rack' },
      { value: 'bench', label: 'Banc' },
      { value: 'dumbbell', label: 'Haltères' },
      { value: 'kettlebell', label: 'Kettlebell' },
    ],
  },
  {
    category: 'CrossFit',
    items: [
      { value: 'box', label: 'Box' },
      { value: 'pull-up-bar', label: 'Barre traction' },
      { value: 'jump-rope', label: 'Corde à sauter' },
      { value: 'wall-ball', label: 'Wall ball' },
      { value: 'rings', label: 'Anneaux' },
      { value: 'ghd', label: 'GHD' },
    ],
  },
  {
    category: 'Cardio',
    items: [
      { value: 'rower', label: 'Rameur' },
      { value: 'assault-bike', label: 'Assault bike' },
      { value: 'ski-erg', label: 'Ski erg' },
      { value: 'treadmill', label: 'Tapis course' },
    ],
  },
]

const EQUIPMENT_PRESETS = [
  { label: 'Minimal', items: ['bodyweight', 'mat'] },
  { label: 'Home gym', items: ['bodyweight', 'mat', 'band', 'dumbbell', 'kettlebell', 'pull-up-bar', 'jump-rope'] },
  { label: 'Box CrossFit', items: ['barbell', 'plates', 'rack', 'dumbbell', 'kettlebell', 'box', 'pull-up-bar', 'jump-rope', 'rower', 'assault-bike', 'wall-ball', 'rings', 'ghd'] },
]

const SPORT_LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'elite', label: 'Elite' },
]

// ─── Onglet Profil ────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: UserProfile | null }) {
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [sportLevel, setSportLevel] = useState(user?.sport_level ?? '')
  const [height, setHeight] = useState(user?.height != null ? String(user.height) : '')
  const [weight, setWeight] = useState(user?.weight != null ? String(user.weight) : '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setSportLevel(user.sport_level ?? '')
      setHeight(user.height != null ? String(user.height) : '')
      setWeight(user.weight != null ? String(user.weight) : '')
    }
  }, [user])

  async function save() {
    try {
      setSaving(true)
      await updateMe({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        sport_level: sportLevel as any || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
      })
      Alert.alert('Succès', 'Profil mis à jour')
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabDesc}>Gérez vos informations personnelles</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Ton prénom"
          placeholderTextColor={Colors.textFaint}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Nom</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Ton nom"
          placeholderTextColor={Colors.textFaint}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Niveau</Text>
        <View style={styles.levelRow}>
          {SPORT_LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl.value}
              style={[styles.levelChip, sportLevel === lvl.value && styles.levelChipActive]}
              onPress={() => setSportLevel(lvl.value)}
            >
              <Text style={[styles.levelText, sportLevel === lvl.value && styles.levelTextActive]}>
                {lvl.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Taille (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="175"
            placeholderTextColor={Colors.textFaint}
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Poids (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="75"
            placeholderTextColor={Colors.textFaint}
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Onglet Équipements ───────────────────────────────────────────────────────

function EquipmentTab({ equipment, setEquipment }: { equipment: string[]; setEquipment: (e: string[]) => void }) {
  const [saving, setSaving] = useState(false)

  function toggle(item: string) {
    setEquipment(equipment.includes(item) ? equipment.filter((e) => e !== item) : [...equipment, item])
  }

  async function save() {
    try {
      setSaving(true)
      await updateMe({ equipment_available: equipment })
      Alert.alert('Succès', 'Équipement mis à jour')
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour l'équipement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabDesc}>Renseignez l'équipement disponible pour calibrer les workouts IA</Text>

      {/* Presets */}
      <View style={styles.presetRow}>
        {EQUIPMENT_PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={styles.presetChip}
            onPress={() => setEquipment(p.items)}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
        {equipment.length > 0 && (
          <TouchableOpacity style={styles.clearChip} onPress={() => setEquipment([])}>
            <Text style={styles.clearText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Catégories */}
      {EQUIPMENT_CATEGORIES.map((group) => (
        <View key={group.category} style={styles.eqGroup}>
          <Text style={styles.eqGroupTitle}>{group.category}</Text>
          <View style={styles.eqItems}>
            {group.items.map((item) => {
              const selected = equipment.includes(item.value)
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.eqChip, selected && styles.eqChipActive]}
                  onPress={() => toggle(item.value)}
                >
                  <Text style={[styles.eqChipText, selected && styles.eqChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      ))}

      {equipment.length > 0 && (
        <Text style={styles.eqCount}>
          {equipment.length} équipement{equipment.length > 1 ? 's' : ''} sélectionné{equipment.length > 1 ? 's' : ''}
        </Text>
      )}

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde...' : "Sauvegarder l'équipement"}</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Onglet 1RMs ─────────────────────────────────────────────────────────────

function OneRepMaxTab() {
  const [oneRepMaxes, setOneRepMaxes] = useState<OneRepMax[]>([])
  const [values, setValues] = useState<Record<string, { value: string; source: 'real' | 'estimated' }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOneRepMaxes()
      .then((data) => {
        setOneRepMaxes(data)
        const init: Record<string, { value: string; source: 'real' | 'estimated' }> = {}
        for (const lift of CROSSFIT_LIFTS) {
          const ex = data.find((r) => r.lift === lift.value)
          init[lift.value] = { value: ex ? String(ex.value) : '', source: ex?.source ?? 'real' }
        }
        setValues(init)
      })
      .catch(() => {
        const init: Record<string, { value: string; source: 'real' | 'estimated' }> = {}
        for (const lift of CROSSFIT_LIFTS) init[lift.value] = { value: '', source: 'real' }
        setValues(init)
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveLift(liftValue: string) {
    const entry = values[liftValue]
    if (!entry?.value) return
    try {
      setSaving(liftValue)
      const result = await upsertOneRepMax(liftValue, { value: Number(entry.value), source: entry.source })
      setOneRepMaxes((prev) => [...prev.filter((r) => r.lift !== liftValue), result])
      Alert.alert('Succès', '1RM sauvegardé')
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le 1RM')
    } finally {
      setSaving(null)
    }
  }

  function setEntry(liftValue: string, patch: Partial<{ value: string; source: 'real' | 'estimated' }>) {
    setValues((prev) => ({ ...prev, [liftValue]: { ...prev[liftValue], ...patch } }))
  }

  if (loading) return <ActivityIndicator color={Colors.orange} style={{ marginTop: 32 }} />

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabDesc}>Renseignez vos maximums pour calibrer les charges de l'IA</Text>

      {CROSSFIT_LIFTS.map((lift) => {
        const entry = values[lift.value] ?? { value: '', source: 'real' as const }
        const existing = oneRepMaxes.find((r) => r.lift === lift.value)
        const isSaving = saving === lift.value

        return (
          <View key={lift.value} style={styles.liftRow}>
            <View style={styles.liftInfo}>
              <Text style={styles.liftName}>{lift.label}</Text>
              {existing && (
                <Text style={styles.liftPrev}>
                  Dernier : {existing.value} kg · {existing.source === 'real' ? 'Réel' : 'Estimé'}
                </Text>
              )}
            </View>

            {/* Source toggle */}
            <View style={styles.sourceToggle}>
              {(['real', 'estimated'] as const).map((src) => (
                <TouchableOpacity
                  key={src}
                  style={[styles.sourceBtn, entry.source === src && styles.sourceBtnActive]}
                  onPress={() => setEntry(lift.value, { source: src })}
                >
                  <Text style={[styles.sourceBtnText, entry.source === src && styles.sourceBtnTextActive]}>
                    {src === 'real' ? 'Réel' : 'Estimé'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.liftInput}
              value={entry.value}
              onChangeText={(v) => setEntry(lift.value, { value: v })}
              keyboardType="numeric"
              placeholder="kg"
              placeholderTextColor={Colors.textFaint}
            />

            <TouchableOpacity
              style={[styles.liftSaveBtn, (!entry.value || isSaving) && { opacity: 0.4 }]}
              onPress={() => saveLift(lift.value)}
              disabled={!entry.value || isSaving}
            >
              <Text style={styles.liftSaveBtnText}>{isSaving ? '...' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        )
      })}
    </View>
  )
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [equipment, setEquipment] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserProfile()
      .then((u) => {
        setUserProfile(u)
        setEquipment(u.equipment_available ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profil' },
    { key: 'equipment', label: 'Équipement' },
    { key: '1rms', label: '1RMs' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mon Profil</Text>
          <Text style={styles.subtitle}>{authUser?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Déco</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.orange} style={{ flex: 1 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {activeTab === 'profile' && <ProfileTab user={userProfile} />}
          {activeTab === 'equipment' && <EquipmentTab equipment={equipment} setEquipment={setEquipment} />}
          {activeTab === '1rms' && <OneRepMaxTab />}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  logoutBtn: {
    backgroundColor: `${Colors.rose}18`, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: `${Colors.rose}30`,
  },
  logoutText: { color: Colors.rose, fontSize: 13, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row', margin: 16, padding: 4,
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.orange },
  tabBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  tabBtnTextActive: { color: '#fff' },

  tabContent: { paddingHorizontal: 16, gap: 16 },
  tabDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 },

  // Profil
  fieldGroup: { gap: 6 },
  fieldLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: Colors.text, fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 12 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  levelChipActive: { backgroundColor: `${Colors.orange}25`, borderColor: Colors.orange },
  levelText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  levelTextActive: { color: Colors.orange },
  saveBtn: {
    backgroundColor: Colors.orange, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Équipements
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  presetText: { color: Colors.textMuted, fontSize: 13 },
  clearChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: `${Colors.rose}12`, borderWidth: 1, borderColor: `${Colors.rose}30`,
  },
  clearText: { color: Colors.rose, fontSize: 13 },
  eqGroup: { gap: 8 },
  eqGroupTitle: { color: Colors.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  eqItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eqChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  eqChipActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  eqChipText: { color: Colors.textMuted, fontSize: 13 },
  eqChipTextActive: { color: '#fff', fontWeight: '600' },
  eqCount: { color: Colors.orange, fontSize: 13, fontWeight: '600' },

  // 1RMs
  liftRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  liftInfo: { flex: 1 },
  liftName: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  liftPrev: { color: Colors.textFaint, fontSize: 11, marginTop: 2 },
  sourceToggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  sourceBtn: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Colors.surface },
  sourceBtnActive: { backgroundColor: Colors.orange },
  sourceBtnText: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },
  sourceBtnTextActive: { color: '#fff' },
  liftInput: {
    width: 52, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
    color: Colors.text, fontSize: 13, textAlign: 'center',
  },
  liftSaveBtn: {
    backgroundColor: Colors.orange, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  liftSaveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
})
