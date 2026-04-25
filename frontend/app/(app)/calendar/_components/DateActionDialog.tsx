import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Building2, Dumbbell, Instagram, Search } from 'lucide-react'

interface DateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  onScheduleWorkout: () => void
  onParseBoxWod: () => void
  onLookupWod: () => void
  onMarkBoxDay: () => void
}

export function DateActionDialog({ open, onOpenChange, selectedDate, onScheduleWorkout, onParseBoxWod, onLookupWod, onMarkBoxDay }: DateActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px] bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-base">
            {format(selectedDate, 'EEEE dd MMMM')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => { onOpenChange(false); onScheduleWorkout() }}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-left"
          >
            <Dumbbell className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">Chercher un workout existant</div>
              <div className="text-xs text-slate-400">Parcourir la bibliothèque</div>
            </div>
          </button>
          <button
            onClick={() => { onOpenChange(false); onLookupWod() }}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-left"
          >
            <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">Rechercher un WOD connu</div>
              <div className="text-xs text-slate-400">Fran, Murph, Open 18.1, Hero WOD...</div>
            </div>
          </button>
          <button
            onClick={() => { onOpenChange(false); onParseBoxWod() }}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left"
          >
            <Instagram className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">Coller depuis Instagram</div>
              <div className="text-xs text-slate-400">L&apos;IA parse la légende du WOD</div>
            </div>
          </button>
          <button
            onClick={() => { onOpenChange(false); onMarkBoxDay() }}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left"
          >
            <Building2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">Jour Box CrossFit</div>
              <div className="text-xs text-slate-400">Marquer ce jour comme entraînement en box</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
