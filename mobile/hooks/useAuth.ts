import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getMe, logout as authLogout } from '../services/auth'
import { TOKEN_KEY } from '../services/api'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY)
      if (!token) {
        setLoading(false)
        return
      }
      const me = await getMe()
      setUser(me)
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await authLogout()
    setUser(null)
  }

  return { user, loading, setUser, logout }
}
