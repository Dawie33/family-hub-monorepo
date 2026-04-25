'use client'

import { AuthGuard } from '@/components/guards/AuthGuard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  )
}
