'use client'

import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface RunningViewProps {
  children: ReactNode
  onClose: () => void
}

export function RunningView({ children, onClose }: RunningViewProps) {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Header with close button */}
        <div className="flex items-center justify-end">
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Timer content */}
        <div className="w-full">
          {children}
        </div>
      </Card>
    </motion.div>
  )
}
