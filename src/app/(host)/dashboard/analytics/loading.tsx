// @TASK P8-S8-T1 - 통계 페이지 로딩 스켈레톤
export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-surface animate-pulse rounded-lg mb-2"></div>
        <div className="h-5 w-64 bg-surface animate-pulse rounded-lg"></div>
      </div>

      {/* 요약 통계 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-surface animate-pulse rounded-xl border border-border"
          ></div>
        ))}
      </div>

      {/* 차트 스켈레톤 */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="h-6 w-32 bg-background animate-pulse rounded-lg mb-4"></div>
        <div className="h-[300px] bg-background animate-pulse rounded-lg"></div>
      </div>

      {/* 가이드북 통계 스켈레톤 */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="h-6 w-40 bg-background animate-pulse rounded-lg mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-background animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
