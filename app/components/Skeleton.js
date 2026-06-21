export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`${width} ${height} rounded-xl bg-surface-2 animate-pulse`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-3xl border border-line p-4 space-y-3">
      <SkeletonLine width="w-24" height="h-3" />
      <SkeletonLine width="w-full" height="h-8" />
      <SkeletonLine width="w-3/4" height="h-3" />
    </div>
  )
}

export function SkeletonStatGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface rounded-3xl border border-line p-3 space-y-2">
          <SkeletonLine width="w-16" height="h-3" />
          <SkeletonLine width="w-20" height="h-6" />
          <SkeletonLine width="w-12" height="h-2" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2.5">
          <div className="w-9 h-9 rounded-full bg-surface-2 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-32" height="h-3" />
            <SkeletonLine width="w-24" height="h-2" />
          </div>
          <SkeletonLine width="w-16" height="h-3" />
        </div>
      ))}
    </div>
  )
}