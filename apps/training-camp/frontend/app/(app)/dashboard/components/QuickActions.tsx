'use client'

import { Plus, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      label: 'Créer un workout',
      description: 'Créer manuellement',
      icon: Plus,
      href: '/workouts/new',
      bgClass: 'bg-white/5',
      iconBg: 'bg-gradient-to-br from-orange-500/20 to-rose-500/20',
      hoverClass: 'hover:bg-white/10 hover:border-orange-500/30',
      borderClass: 'border-white/10',
    },
    {
      label: 'Générer avec IA',
      description: 'Workout automatique',
      icon: Sparkles,
      href: '/workouts/generate-ai',
      bgClass: 'bg-gradient-to-r from-orange-500/10 to-rose-500/10',
      iconBg: 'bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-500/30',
      hoverClass: 'hover:from-orange-500/20 hover:to-rose-500/20',
      borderClass: 'border-orange-500/20',
    },
    {
      label: 'Voir mes stats',
      description: 'Suivre ma progression',
      icon: TrendingUp,
      href: '/tracking',
      bgClass: 'bg-white/5',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      hoverClass: 'hover:bg-white/10 hover:border-orange-500/30',
      borderClass: 'border-white/10',
    },
  ]

  return (
    <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border ${action.bgClass} ${action.borderClass} ${action.hoverClass} transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-slate-400">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
