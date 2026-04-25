export default function SkillsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-slate-700 rounded-lg" />
        <div className="h-10 w-40 bg-slate-700 rounded-xl" />
      </div>
      <div className="h-4 w-64 bg-slate-700 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 bg-slate-800 rounded-2xl border border-slate-700" />
        ))}
      </div>
    </div>
  )
}
