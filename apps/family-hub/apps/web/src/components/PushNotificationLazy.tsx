'use client'

import dynamic from 'next/dynamic'

// Charge Firebase/PushNotificationSetup dans un chunk séparé (~200 Ko)
// ssr: false autorisé uniquement dans un Client Component
const PushNotificationSetup = dynamic(
  () => import('./PushNotificationSetup'),
  { ssr: false }
)

export default function PushNotificationLazy() {
  return <PushNotificationSetup />
}
