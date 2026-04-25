export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-700 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-800 rounded-2xl border border-slate-700" />
        ))}
      </div>
      <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-48 bg-slate-800 rounded-2xl border border-slate-700" />
        <div className="h-48 bg-slate-800 rounded-2xl border border-slate-700" />
      </div>
    </div>
  )
}
