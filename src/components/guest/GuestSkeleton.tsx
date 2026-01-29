// @TASK P7-T7.6 - 게스트 뷰 스켈레톤 UI
// @SPEC docs/planning/06-tasks.md#P7-T7.6

import { Skeleton } from '@/components/ui/skeleton';

export function GuestSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image Skeleton */}
      <div className="relative">
        <Skeleton className="h-64 md:h-80 w-full rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <Skeleton className="h-8 w-3/4 bg-white/20 mb-2" />
          <Skeleton className="h-4 w-1/2 bg-white/20" />
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-4 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Notice Block */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <section key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              {i === 1 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Map Block */}
        <section className="border rounded-lg p-6 mt-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </section>

        {/* Gallery Block */}
        <section className="border rounded-lg p-6 mt-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </section>
      </div>

      {/* AI Chat Button Skeleton */}
      <div className="fixed bottom-6 right-6">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
