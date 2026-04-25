export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 bg-stone-200 rounded-lg w-3/4" />
        <div className="h-6 w-6 bg-stone-200 rounded-lg" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-6 bg-stone-200 rounded-full w-16" />
        <div className="h-6 bg-stone-200 rounded-full w-20" />
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-6 w-6 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-8 bg-stone-200 rounded-xl w-28 mt-2" />
    </div>
  );
}

export function SkeletonFilters() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="h-10 bg-stone-200 rounded-xl" />
      <div className="flex gap-2">
        <div className="h-8 bg-stone-200 rounded-full w-32" />
        <div className="h-8 bg-stone-200 rounded-full w-36" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <SkeletonFilters />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRecipeResult() {
  return (
    <div className="card p-6 space-y-5 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 bg-stone-200 rounded-lg w-1/2" />
        <div className="h-4 bg-stone-100 rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 bg-stone-200 rounded-full w-20" />
        <div className="h-7 bg-stone-200 rounded-full w-24" />
        <div className="h-7 bg-stone-200 rounded-full w-16" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-stone-100 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-5/6" />
        <div className="h-4 bg-stone-100 rounded w-4/5" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-3/4" />
      </div>
    </div>
  );
}
