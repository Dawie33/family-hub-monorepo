'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import { BottomNavigation } from './bottom-navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  // Pages qui ne doivent pas afficher la navigation
  const noNavRoutes = ['/login', '/signup', '/']

  // Pages en fullscreen (pas de bottom nav ni sidebar)
  const fullscreenRoutes = ['/workout/', '/personalized-workout/']

  const shouldShowNav = !noNavRoutes.includes(pathname)
  const isFullscreen = fullscreenRoutes.some(route => pathname.includes(route))

  if (!shouldShowNav) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - masquée sur mobile */}
      {!isFullscreen && (
        <div className="hidden lg:block">
          <AppSidebar isOpen={true} />
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto w-full ${!isFullscreen ? 'lg:ml-56' : ''} ${!isFullscreen ? 'pb-20 lg:pb-0' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation - masquée sur desktop et en fullscreen */}
      {!isFullscreen && <BottomNavigation />}
    </div>
  )
}
