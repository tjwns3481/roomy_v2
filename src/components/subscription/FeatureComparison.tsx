/**
 * @TASK P6-T6.4 - 기능 비교 테이블
 * @SPEC docs/planning/06-tasks.md#P6-T6.4
 *
 * 플랜별 기능 비교 테이블 (반응형)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface PlanInfo {
  plan: SubscriptionPlan;
  name: string;
  limits: {
    maxGuidebooks: number;
    maxAiGenerationsPerMonth: number;
    watermarkRemoved: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
  };
}

interface FeatureComparisonProps {
  plans: PlanInfo[];
}

// ============================================================
// 헬퍼 함수
// ============================================================

function formatLimit(value: number): string {
  if (value === -1) return '무제한';
  return value.toString();
}

// ============================================================
// 컴포넌트
// ============================================================

export function FeatureComparison({ plans }: FeatureComparisonProps) {
  // 비교 항목 정의
  const features = [
    {
      category: '가이드북',
      items: [
        {
          label: '가이드북 개수',
          getValue: (p: PlanInfo) => formatLimit(p.limits.maxGuidebooks),
        },
      ],
    },
    {
      category: 'AI 생성',
      items: [
        {
          label: 'AI 생성 횟수 (월간)',
          getValue: (p: PlanInfo) => formatLimit(p.limits.maxAiGenerationsPerMonth),
        },
      ],
    },
    {
      category: '브랜딩',
      items: [
        {
          label: '워터마크 제거',
          getValue: (p: PlanInfo) => p.limits.watermarkRemoved,
        },
        {
          label: '커스텀 도메인',
          getValue: (p: PlanInfo) => p.limits.customDomain,
        },
      ],
    },
    {
      category: '지원',
      items: [
        {
          label: '우선 지원',
          getValue: (p: PlanInfo) => p.limits.prioritySupport,
        },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>기능 비교</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 데스크톱 뷰 (테이블) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">기능</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.plan} className="text-center">
                    {plan.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((category) =>
                category.items.map((item, itemIndex) => (
                  <TableRow key={`${category.category}-${itemIndex}`}>
                    <TableCell className="font-medium">
                      {itemIndex === 0 && (
                        <div className="text-xs text-muted-foreground mb-1">{category.category}</div>
                      )}
                      {item.label}
                    </TableCell>
                    {plans.map((plan) => {
                      const value = item.getValue(plan);
                      return (
                        <TableCell key={plan.plan} className="text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 모바일 뷰 (카드) */}
        <div className="md:hidden space-y-6">
          {plans.map((plan) => (
            <div key={plan.plan} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">{plan.name}</h3>
              <div className="space-y-3">
                {features.map((category) =>
                  category.items.map((item, itemIndex) => {
                    const value = item.getValue(plan);
                    return (
                      <div key={`${category.category}-${itemIndex}`} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{value}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
