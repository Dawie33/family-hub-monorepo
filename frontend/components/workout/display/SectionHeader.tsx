import { Check } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  description?: string
  duration_min?: number
  isSectionCompleted?: boolean
}

export function SectionHeader({ title, description, duration_min, isSectionCompleted }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <div className="flex-1">
          <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2">
            <span>{title}</span>
            {isSectionCompleted && (
              <span className="ml-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Terminé
              </span>
            )}
          </h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {duration_min && (
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs lg:text-sm font-semibold">
            {duration_min} min
          </span>
        )}
      </div>
    </div>
  )
}
