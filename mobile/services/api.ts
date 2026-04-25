import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'https://training-camp-backend.onrender.com/api'
const TOKEN_KEY = 'access_token'

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Délai dépassé, réessaie')
    throw new Error('Impossible de joindre le serveur')
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(error.message ?? `Erreur ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { TOKEN_KEY }
