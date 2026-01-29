/**
 * @TASK P6-T6.6 - 사용량 현황 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 가이드북, AI 생성 사용량을 프로그레스 바로 시각화
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import type { PlanLimits } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface UsageItem {
  current: number;
  limit: number;
}

interface UsageOverviewProps {
  guidebooks: UsageItem;
  aiGenerations: UsageItem;
  planLimits: PlanLimits | null;
}

// ============================================================
// 유틸리티 함수
// ============================================================

function getUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0; // 무제한
  return Math.min(Math.round((current / limit) * 100), 100);
}

function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-blue-500';
}

function getUsageLabel(current: number, limit: number): string {
  if (limit === -1) return `${current}개 (무제한)`;
  return `${current} / ${limit}`;
}

function isLimitExceeded(current: number, limit: number): boolean {
  if (limit === -1) return false;
  return current >= limit;
}

// ============================================================
// 컴포넌트
// ============================================================

export function UsageOverview({
  guidebooks,
  aiGenerations,
  planLimits,
}: UsageOverviewProps) {
  // 사용량 계산
  const guidebooksPercentage = getUsagePercentage(guidebooks.current, guidebooks.limit);
  const aiPercentage = getUsagePercentage(aiGenerations.current, aiGenerations.limit);

  const guidebooksColor = getUsageColor(guidebooksPercentage);
  const aiColor = getUsageColor(aiPercentage);

  const guidebooksExceeded = isLimitExceeded(guidebooks.current, guidebooks.limit);
  const aiExceeded = isLimitExceeded(aiGenerations.current, aiGenerations.limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용량 현황</CardTitle>
        <CardDescription>
          이번 달 사용량을 확인하세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 가이드북 사용량 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">가이드북</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {getUsageLabel(guidebooks.current, guidebooks.limit)}
              </span>
              {guidebooksExceeded && (
                <Badge variant="destructive" className="text-xs">
                  한도 초과
                </Badge>
              )}
            </div>
          </div>

          {guidebooks.limit !== -1 && (
            <div className="space-y-2">
              <Progress
                value={guidebooksPercentage}
                className="h-2"
                indicatorClassName={guidebooksColor}
              />
              <p className="text-xs text-muted-foreground">
                {guidebooksPercentage}% 사용 중
              </p>
            </div>
          )}

          {guidebooks.limit === -1 && (
            <p className="text-sm text-muted-foreground">
              무제한으로 가이드북을 생성할 수 있습니다
            </p>
          )}
        </div>

        {/* AI 생성 사용량 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">AI 생성</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {getUsageLabel(aiGenerations.current, aiGenerations.limit)}
              </span>
              {aiExceeded && (
                <Badge variant="destructive" className="text-xs">
                  한도 초과
                </Badge>
              )}
            </div>
          </div>

          {aiGenerations.limit !== -1 && (
            <div className="space-y-2">
              <Progress
                value={aiPercentage}
                className="h-2"
                indicatorClassName={aiColor}
              />
              <p className="text-xs text-muted-foreground">
                {aiPercentage}% 사용 중 (이번 달)
              </p>
            </div>
          )}

          {aiGenerations.limit === -1 && (
            <p className="text-sm text-muted-foreground">
              무제한으로 AI 생성을 사용할 수 있습니다
            </p>
          )}
        </div>

        {/* 한도 초과 경고 */}
        {(guidebooksExceeded || aiExceeded) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium text-red-900">
                  사용량 한도 초과
                </p>
                <p className="text-xs text-red-800">
                  {guidebooksExceeded && aiExceeded ? (
                    '가이드북과 AI 생성 한도를 모두 초과했습니다. 상위 플랜으로 업그레이드하세요.'
                  ) : guidebooksExceeded ? (
                    '가이드북 한도를 초과했습니다. 더 많은 가이드북을 만들려면 상위 플랜으로 업그레이드하세요.'
                  ) : (
                    'AI 생성 한도를 초과했습니다. 더 많은 AI 생성을 사용하려면 상위 플랜으로 업그레이드하세요.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 플랜 정보 */}
        {planLimits && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium">플랜 혜택</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                • 가이드북: {planLimits.maxGuidebooks === -1 ? '무제한' : `최대 ${planLimits.maxGuidebooks}개`}
              </li>
              <li>
                • AI 생성: {planLimits.maxAiGenerationsPerMonth === -1 ? '무제한' : `월 ${planLimits.maxAiGenerationsPerMonth}회`}
              </li>
              {planLimits.watermarkRemoved && (
                <li>• 워터마크 제거</li>
              )}
              {planLimits.customDomain && (
                <li>• 커스텀 도메인</li>
              )}
              {planLimits.prioritySupport && (
                <li>• 우선 지원</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UsageOverview;
