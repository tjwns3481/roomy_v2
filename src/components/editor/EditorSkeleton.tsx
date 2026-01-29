// @TASK P7-T7.6 - 에디터 스켈레톤 UI
// @SPEC docs/planning/06-tasks.md#P7-T7.6

import { Skeleton } from '@/components/ui/skeleton';

export function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header Skeleton */}
      <header className="border-b bg-white h-16 flex items-center px-4">
        <Skeleton className="h-8 w-48" />
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block List */}
        <aside className="w-80 border-r bg-gray-50 p-4 overflow-y-auto hidden lg:block">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-3">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </aside>

        {/* Center - Control Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Theme Section */}
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Block Editor Sections */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Mobile Preview */}
        <aside className="w-96 border-l bg-gray-900 p-4 hidden xl:flex items-start justify-center">
          <div className="w-full max-w-[375px]">
            <Skeleton className="h-6 w-32 mb-4 bg-gray-700" />
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Mobile Preview Content */}
              <Skeleton className="h-[667px] w-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
