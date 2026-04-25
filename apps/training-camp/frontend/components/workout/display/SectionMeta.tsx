interface SectionMetaProps {
  format?: string
  goal?: string
  focus?: string
}

export function SectionMeta({ format, goal, focus }: SectionMetaProps) {
  return (
    <>
      {format && (
        <div className="text-sm px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <span className="text-slate-400 font-medium">Format:</span> <span className="text-slate-300">{format}</span>
        </div>
      )}

      {goal && (
        <div className="text-sm text-slate-400">
          <span className="text-slate-300 font-medium">Objectif:</span> {goal}
        </div>
      )}

      {focus && (
        <div className="text-sm text-slate-400">
          <span className="text-slate-300 font-medium">Focus:</span> {focus}
        </div>
      )}
    </>
  )
}
