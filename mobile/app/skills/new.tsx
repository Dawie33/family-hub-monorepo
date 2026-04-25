import { useState } from 'react'
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
import { generateSkillWithAI, createSkill, GeneratedSkillProgram } from '../../services/skills-service'
import { Colors } from '../../constants/colors'

const CATEGORIES = [
  { value: 'gymnastics', label: 'Gymnastique' },
  { value: 'weightlifting', label: 'Haltérophilie' },
  { value: 'conditioning', label: 'Conditionnement' },
  { value: 'mobility', label: 'Mobilité' },
  { value: 'strength', label: 'Force' },
]

const CATEGORY_COLORS: Record<string, string> = {
  gymnastics: Colors.violet,
  weightlifting: '#f59e0b',
  conditioning: Colors.emerald,
  mobility: '#06b6d4',
  strength: Colors.orange,
}

export default function NewSkillScreen() {
  const router = useRouter()
  const [skillName, setSkillName] = useState('')
  const [category, setCategory] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [constraints, setConstraints] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<GeneratedSkillProgram | null>(null)

  async function handleGenerate() {
    if (!skillName.trim()) {
      Alert.alert('Champ requis', 'Indique le skill que tu veux travailler')
      return
    }
    if (!category) {
      Alert.alert('Champ requis', 'Sélectionne une catégorie')
      return
    }
    setGenerating(true)
    setGenerated(null)
    try {
      const result = await generateSkillWithAI({
        skillName: skillName.trim(),
        skillCategory: category,
        currentCapabilities: capabilities.trim() || undefined,
        constraints: constraints.trim() || undefined,
      })
      setGenerated(result)
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de générer le programme')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!generated) return
    setSaving(true)
    try {
      await createSkill({
        skill_name: generated.skill_name,
        skill_category: generated.skill_category,
        description: generated.description,
        estimated_weeks: generated.estimated_weeks,
        progression_notes: generated.progression_notes,
        safety_notes: generated.safety_notes,
        steps: generated.steps,
      })
      Alert.alert(
        'Programme créé !',
        `"${generated.skill_name}" a été ajouté à tes programmes.`,
        [{ text: 'Voir mes skills', onPress: () => router.replace('/(tabs)/skills' as any) }]
      )
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de sauvegarder')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau programme skill</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.infoBox}>
          <Ionicons name="sparkles" size={18} color={Colors.orange} />
          <Text style={styles.infoText}>
            L'IA va créer un programme de progression personnalisé étape par étape pour ton skill.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Skill à travailler *</Text>
          <TextInput
            style={styles.input}
            value={skillName}
            onChangeText={setSkillName}
            placeholder="Ex: Muscle-up, Handstand, Snatch..."
            placeholderTextColor={Colors.textFaint}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value
              const color = CATEGORY_COLORS[cat.value] ?? Colors.orange
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.chip,
                    isActive && { backgroundColor: `${color}25`, borderColor: color },
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[styles.chipText, isActive && { color }]}>{cat.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Niveau actuel (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={capabilities}
            onChangeText={setCapabilities}
            placeholder="Ex: Je fais des dips et tractions mais pas encore de muscle-up..."
            placeholderTextColor={Colors.textFaint}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Contraintes (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={constraints}
            onChangeText={setConstraints}
            placeholder="Ex: Blessure épaule droite, pas de barre traction..."
            placeholderTextColor={Colors.textFaint}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton générer */}
        {!generated && (
          <TouchableOpacity
            style={[styles.generateBtn, (generating || !skillName.trim() || !category) && styles.btnDisabled]}
            onPress={handleGenerate}
            disabled={generating || !skillName.trim() || !category}
            activeOpacity={0.85}
          >
            {generating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateBtnText}>Génération en cours...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.generateBtnText}>Générer le programme</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Résultat généré */}
        {generated && (
          <View style={styles.generatedSection}>
            <View style={styles.generatedHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.emerald} />
              <Text style={styles.generatedTitle}>{generated.skill_name}</Text>
            </View>

            {generated.description ? (
              <Text style={styles.generatedDesc}>{generated.description}</Text>
            ) : null}

            {generated.estimated_weeks ? (
              <Text style={styles.generatedMeta}>⏱ ~{generated.estimated_weeks} semaines estimées</Text>
            ) : null}

            {/* Étapes */}
            <Text style={styles.stepsTitle}>{generated.steps.length} étapes de progression</Text>
            {generated.steps.map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.step_number}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {step.description ? (
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  ) : null}
                  {step.coaching_tips ? (
                    <View style={styles.tipBox}>
                      <Ionicons name="bulb-outline" size={12} color={Colors.orange} />
                      <Text style={styles.tipText}>{step.coaching_tips}</Text>
                    </View>
                  ) : null}
                  {step.estimated_duration_weeks ? (
                    <Text style={styles.stepMeta}>⏱ ~{step.estimated_duration_weeks} semaine{step.estimated_duration_weeks > 1 ? 's' : ''}</Text>
                  ) : null}
                </View>
              </View>
            ))}

            {/* Safety notes */}
            {generated.safety_notes ? (
              <View style={styles.safetyBox}>
                <Ionicons name="warning-outline" size={14} color={Colors.rose} />
                <Text style={styles.safetyText}>{generated.safety_notes}</Text>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={() => { setGenerated(null); handleGenerate() }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color={Colors.textMuted} />
                <Text style={styles.regenerateBtnText}>Regénérer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Sauvegarder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  content: { padding: 20, paddingBottom: 48, gap: 4 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: `${Colors.orange}12`, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: `${Colors.orange}30`, marginBottom: 16,
  },
  infoText: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, flex: 1 },

  formSection: { marginBottom: 20 },
  label: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, color: Colors.text, fontSize: 14,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { color: Colors.text, fontSize: 13, fontWeight: '500' },

  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.orange, borderRadius: 16,
    paddingVertical: 15, marginTop: 8,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },

  generatedSection: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
    gap: 12, marginTop: 8,
  },
  generatedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  generatedTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold', flex: 1 },
  generatedDesc: { color: Colors.textMuted, fontSize: 14, lineHeight: 20 },
  generatedMeta: { color: Colors.textFaint, fontSize: 13 },
  stepsTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },

  stepCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.background, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${Colors.orange}25`,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
    borderWidth: 1, borderColor: `${Colors.orange}50`,
  },
  stepNumText: { color: Colors.orange, fontSize: 12, fontWeight: '700' },
  stepContent: { flex: 1, gap: 4 },
  stepTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  stepDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },
  stepMeta: { color: Colors.textFaint, fontSize: 11 },
  tipBox: {
    flexDirection: 'row', gap: 5, alignItems: 'flex-start',
    backgroundColor: `${Colors.orange}10`, borderRadius: 8, padding: 7,
  },
  tipText: { color: Colors.textMuted, fontSize: 11, lineHeight: 15, flex: 1 },

  safetyBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: `${Colors.rose}10`, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: `${Colors.rose}25`,
  },
  safetyText: { color: Colors.rose, fontSize: 12, lineHeight: 17, flex: 1 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  regenerateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 12, paddingVertical: 12,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  regenerateBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 12, paddingVertical: 12, backgroundColor: Colors.emerald,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
})
