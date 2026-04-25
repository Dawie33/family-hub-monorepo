'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Page de chargement de l'application
 * Redirige vers la page de dashboard si l'utilisateur est connecte ou vers la page de login sinon
 */
export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Chargement...</div>
    </div>
  )
}
