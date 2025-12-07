export default function ConnectLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-accent mb-6">Connect</h1>

        {/* Search Skeleton */}
        <div className="relative mb-6">
          <div className="w-full bg-primary/30 border border-primary/50 rounded-lg px-4 py-3 h-10 animate-pulse" />
        </div>

        {/* Create Group Skeleton */}
        <div className="w-full bg-primary/50 border border-primary/50 rounded-lg p-4 flex items-center gap-3 mb-6 animate-pulse h-14" />

        {/* Suggested Users Skeleton */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Suggested for You</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-primary/20 border border-primary/50 rounded-lg p-4 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-primary/50 rounded w-24" />
                    <div className="h-3 bg-primary/30 rounded w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/50" />
                  <div className="w-20 h-10 rounded-lg bg-accent/30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
