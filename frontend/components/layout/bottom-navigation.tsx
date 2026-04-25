'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Dumbbell, Flame, Footprints, Home, MoreHorizontal, PenLine, TrendingUp, Trophy, X, Zap, LayoutList } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/calendar', label: 'Calendrier', icon: Calendar },
  { href: '/tracking', label: 'Suivi', icon: TrendingUp },
  { href: '/skills', label: 'Progression', icon: Flame },
]

const moreItems: NavItem[] = [
  { href: '/training-programs', label: 'Programmes', icon: LayoutList },
  { href: '/log-workout', label: 'Enregistrer WOD', icon: PenLine },
  { href: '/running', label: 'Running', icon: Footprints },
  { href: '/hyrox', label: 'HYROX', icon: Trophy },
  { href: '/athx', label: 'ATHX', icon: Zap },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const isMoreActive = moreItems.some(item =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <>
      {/* Menu "More" - Modal fullscreen */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background lg:hidden"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-black">More</h2>
                <motion.button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Menu items */}
              <div className="flex-1 p-4 space-y-2">
                {moreItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMoreMenu(false)}
                    >
                      <motion.div
                        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-accent'
                          }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`p-3 rounded-xl ${isActive ? 'bg-primary/20' : 'bg-accent'
                          }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-semibold">{item.label}</span>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border lg:hidden">
        {/* Safe area for iOS */}
        <div className="pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center flex-1 h-full group"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-1/5 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}

                  {/* Icon with animation */}
                  <motion.div
                    className={`relative ${isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* Background circle on active */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 -m-2 bg-primary/10 rounded-full"
                      />
                    )}

                    <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-105'
                      } transition-transform`} />
                  </motion.div>

                  {/* Label */}
                  <span
                    className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* More button */}
            <button
              onClick={() => setShowMoreMenu(true)}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {/* Active indicator */}
              {isMoreActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                className={`relative ${isMoreActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                {/* Background circle on active */}
                {isMoreActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 -m-2 bg-primary/10 rounded-full"
                  />
                )}

                <MoreHorizontal className={`w-6 h-6 relative z-10 ${isMoreActive ? 'scale-110' : 'group-hover:scale-105'
                  } transition-transform`} />
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs mt-1 font-medium transition-colors ${isMoreActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
