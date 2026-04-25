import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../hooks/useAuth'

export default function RootLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard')
    }
  }, [user, loading, segments])

  if (loading) return null

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" />
        <Stack.Screen name="workout/generate" />
        <Stack.Screen name="workout/timer" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="personalized-workouts/index" />
        <Stack.Screen name="personalized-workouts/[id]" />
        <Stack.Screen name="benchmarks" />
        <Stack.Screen name="skills/new" />
      </Stack>
    </>
  )
}
