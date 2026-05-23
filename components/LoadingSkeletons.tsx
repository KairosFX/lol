export function ChampionGridSkeleton() {
  return (
    <div className="rift-shell py-10">
      <div className="mb-6 h-9 w-56 rounded-lg skeleton-shimmer" />
      <div className="mb-8 h-14 rounded-lg skeleton-shimmer" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-lg skeleton-shimmer" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-2/3 rounded skeleton-shimmer" />
                <div className="h-4 w-1/2 rounded skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuideSkeleton() {
  return (
    <div className="rift-shell py-10">
      <div className="mb-8 h-36 rounded-lg skeleton-shimmer" />
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <div className="hidden h-96 rounded-lg skeleton-shimmer lg:block" />
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
              <div className="mb-5 h-8 w-64 rounded skeleton-shimmer" />
              <div className="space-y-3">
                <div className="h-4 rounded skeleton-shimmer" />
                <div className="h-4 w-11/12 rounded skeleton-shimmer" />
                <div className="h-4 w-9/12 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
