'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAdmin?: boolean
}

/**
 * Composant de protection pour les routes authentifiées
 * - Redirige vers /login si l'utilisateur n'est pas authentifié
 * - Si requireAdmin=true, vérifie aussi que l'utilisateur est admin
 *   et redirige vers /dashboard si ce n'est pas le cas
 */
export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Si pas authentifié, rediriger vers login
      if (!isAuthenticated) {
        const currentPath = window.location.pathname
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // Si authentifié mais admin requis et pas admin, rediriger vers dashboard
      if (requireAdmin && user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }
  }, [user, isAuthenticated, loading, requireAdmin, router])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            {requireAdmin ? 'Vérification des permissions...' : 'Chargement...'}
          </p>
        </div>
      </div>
    )
  }

  // Si pas authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    return null
  }

  // Si admin requis mais pas admin, ne rien afficher (la redirection est en cours)
  if (requireAdmin && user?.role !== 'admin') {
    return null
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
}
