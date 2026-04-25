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
import { api } from '../../services/api'
import { Colors } from '../../constants/colors'

const WORKOUT_TYPES = [
  { key: 'for_time', label: 'For Time' },
  { key: 'amrap', label: 'AMRAP' },
  { key: 'emom', label: 'EMOM' },
  { key: 'strength', label: 'Force' },
  { key: 'tabata', label: 'Tabata' },
  { key: 'interval', label: 'Interval' },
  { key: 'endurance', label: 'Endurance' },
]

const DIFFICULTIES = [
  { key: 'beginner', label: 'Débutant' },
  { key: 'intermediate', label: 'Intermédiaire' },
  { key: 'advanced', label: 'Avancé' },
  { key: 'elite', label: 'Élite' },
]

const DURATIONS = [
  { key: '15', label: '15 min' },
  { key: '20', label: '20 min' },
  { key: '30', label: '30 min' },
  { key: '45', label: '45 min' },
  { key: '60', label: '60 min' },
]

export default function GenerateWorkoutScreen() {
  const router = useRouter()
  const [workoutType, setWorkoutType] = useState('for_time')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [duration, setDuration] = useState('30')
  const [instructions, setInstructions] = useState('')
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await api.post<any>('/workouts/generate-ai-personalized', {
        workoutType,
        difficulty,
        duration: Number(duration),
        additionalInstructions: instructions.trim() || undefined,
      })

      // Sauvegarder comme workout personnalisé
      await api.post('/workouts/personalized', result)

      Alert.alert(
        'Workout généré !',
        `"${result.name}" a été ajouté à tes workouts.`,
        [{ text: 'Super !', onPress: () => router.back() }]
      )
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de générer le workout')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Générer un workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Intro IA */}
        <View style={styles.aiBox}>
          <Ionicons name="sparkles" size={20} color={Colors.orange} />
          <Text style={styles.aiText}>L'IA va créer un workout personnalisé selon tes préférences</Text>
        </View>

        {/* Type de workout */}
        <Text style={styles.label}>Type de workout</Text>
        <View style={styles.chips}>
          {WORKOUT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, workoutType === t.key && styles.chipActive]}
              onPress={() => setWorkoutType(t.key)}
            >
              <Text style={[styles.chipText, workoutType === t.key && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulté */}
        <Text style={styles.label}>Niveau</Text>
        <View style={styles.chips}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.chip, difficulty === d.key && styles.chipActive]}
              onPress={() => setDifficulty(d.key)}
            >
              <Text style={[styles.chipText, difficulty === d.key && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Durée */}
        <Text style={styles.label}>Durée estimée</Text>
        <View style={styles.chips}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.chip, duration === d.key && styles.chipActive]}
              onPress={() => setDuration(d.key)}
            >
              <Text style={[styles.chipText, duration === d.key && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions supplémentaires */}
        <Text style={styles.label}>Instructions (optionnel)</Text>
        <TextInput
          style={styles.textArea}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Ex: sans équipement, focus bras, récupération active..."
          placeholderTextColor={Colors.textFaint}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Bouton générer */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={generating}
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
              <Text style={styles.generateBtnText}>Générer avec l'IA</Text>
            </>
          )}
        </TouchableOpacity>
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

  content: { padding: 20, gap: 16, paddingBottom: 40 },

  aiBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: `${Colors.orange}12`, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${Colors.orange}30`,
  },
  aiText: { color: Colors.textMuted, fontSize: 14, flex: 1, lineHeight: 20 },

  label: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: -8 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: `${Colors.orange}25`, borderColor: Colors.orange },
  chipText: { color: Colors.text, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: Colors.orange, fontWeight: '600' },

  textArea: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, color: Colors.text, fontSize: 14,
    minHeight: 100,
  },

  generateBtn: {
    backgroundColor: Colors.orange, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    marginTop: 8,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
