/**
 * @TASK P6-T6.8 - 업그레이드 배너 데모 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 *
 * 모든 배너 상태를 확인할 수 있는 데모 페이지
 */

'use client';

import { useState } from 'react';
import { UpgradeBanner, LimitWarningBanner, SidebarUpgradeBanner } from '@/components/subscription';
import { Card } from '@/components/ui/card';

// ============================================================
// 데모 상태
// ============================================================

type BannerState = 'default' | 'compact' | 'sidebar' | 'dismissable' | 'non-dismissable';
type LimitState = 'guidebooks-80' | 'guidebooks-100' | 'ai-80' | 'ai-100' | 'none';

const BANNER_STATES = {
  default: { variant: 'default' as const, dismissable: true, label: 'Default (dismissable)' },
  compact: { variant: 'compact' as const, dismissable: true, label: 'Compact (dismissable)' },
  sidebar: { variant: 'sidebar' as const, dismissable: false, label: 'Sidebar (always visible)' },
  dismissable: { variant: 'default' as const, dismissable: true, label: 'Dismissable' },
  'non-dismissable': { variant: 'default' as const, dismissable: false, label: 'Non-dismissable' },
} as const;

const LIMIT_STATES = {
  'guidebooks-80': { type: 'guidebooks' as const, current: 1, limit: 1, label: '가이드북 100%' },
  'guidebooks-100': { type: 'guidebooks' as const, current: 4, limit: 5, label: '가이드북 80%' },
  'ai-80': { type: 'ai' as const, current: 25, limit: 30, label: 'AI 83%' },
  'ai-100': { type: 'ai' as const, current: 3, limit: 3, label: 'AI 100%' },
  none: { type: 'guidebooks' as const, current: 0, limit: 1, label: '제한 없음 (표시 안 됨)' },
} as const;

// ============================================================
// 컴포넌트
// ============================================================

export default function SubscriptionBannersDemo() {
  const [bannerState, setBannerState] = useState<BannerState>('default');
  const [limitState, setLimitState] = useState<LimitState>('guidebooks-100');

  const bannerConfig = BANNER_STATES[bannerState];
  const limitConfig = LIMIT_STATES[limitState];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            P6-T6.8: 업그레이드 배너 데모
          </h1>
          <p className="text-gray-600">
            Free 플랜 사용자를 위한 업그레이드 유도 배너 컴포넌트
          </p>
        </div>

        {/* UpgradeBanner 섹션 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. UpgradeBanner</h2>

          {/* 상태 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">배너 스타일:</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(BANNER_STATES).map((key) => (
                <button
                  key={key}
                  onClick={() => setBannerState(key as BannerState)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bannerState === key
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {BANNER_STATES[key as BannerState].label}
                </button>
              ))}
            </div>
          </div>

          {/* 배너 렌더링 */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <UpgradeBanner
              variant={bannerConfig.variant}
              dismissable={bannerConfig.dismissable}
            />
          </div>

          {/* 상태 정보 */}
          <pre className="mt-4 p-4 bg-gray-100 text-sm rounded-lg overflow-x-auto">
            {JSON.stringify(
              {
                variant: bannerConfig.variant,
                dismissable: bannerConfig.dismissable,
              },
              null,
              2
            )}
          </pre>
        </Card>

        {/* LimitWarningBanner 섹션 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. LimitWarningBanner</h2>

          {/* 상태 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">제한 상태:</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(LIMIT_STATES).map((key) => (
                <button
                  key={key}
                  onClick={() => setLimitState(key as LimitState)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    limitState === key
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {LIMIT_STATES[key as LimitState].label}
                </button>
              ))}
            </div>
          </div>

          {/* 배너 렌더링 */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <LimitWarningBanner
              type={limitConfig.type}
              current={limitConfig.current}
              limit={limitConfig.limit}
            />
            {limitState === 'none' && (
              <p className="text-gray-500 text-center py-8">
                80% 미만이므로 배너가 표시되지 않습니다
              </p>
            )}
          </div>

          {/* 상태 정보 */}
          <pre className="mt-4 p-4 bg-gray-100 text-sm rounded-lg overflow-x-auto">
            {JSON.stringify(
              {
                type: limitConfig.type,
                current: limitConfig.current,
                limit: limitConfig.limit,
                percentage: Math.round((limitConfig.current / limitConfig.limit) * 100),
              },
              null,
              2
            )}
          </pre>
        </Card>

        {/* SidebarUpgradeBanner 섹션 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. SidebarUpgradeBanner</h2>

          {/* 배너 렌더링 (사이드바 크기로 제한) */}
          <div className="border border-gray-200 rounded-lg bg-white" style={{ width: '256px' }}>
            <SidebarUpgradeBanner />
          </div>

          {/* 상태 정보 */}
          <pre className="mt-4 p-4 bg-gray-100 text-sm rounded-lg overflow-x-auto">
            {JSON.stringify(
              {
                variant: 'sidebar',
                dismissable: false,
                alwaysVisible: true,
              },
              null,
              2
            )}
          </pre>
        </Card>

        {/* 통합 시나리오 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 통합 시나리오</h2>

          <div className="space-y-6">
            {/* 시나리오 1: 대시보드 상단 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                시나리오 1: 대시보드 상단 배너
              </h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <UpgradeBanner variant="default" dismissable />
              </div>
            </div>

            {/* 시나리오 2: 가이드북 생성 제한 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                시나리오 2: 가이드북 생성 제한 도달
              </h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white space-y-4">
                <UpgradeBanner variant="compact" dismissable />
                <LimitWarningBanner type="guidebooks" current={1} limit={1} />
              </div>
            </div>

            {/* 시나리오 3: AI 생성 제한 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                시나리오 3: AI 생성 제한 근접
              </h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <LimitWarningBanner type="ai" current={27} limit={30} />
              </div>
            </div>
          </div>
        </Card>

        {/* 개발자 노트 */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📝 개발자 노트</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>UpgradeBanner:</strong> Free 플랜 사용자에게만 표시됩니다. useSubscription
              훅으로 플랜 확인
            </li>
            <li>
              <strong>LimitWarningBanner:</strong> 사용량 80% 이상일 때만 표시됩니다
            </li>
            <li>
              <strong>SidebarUpgradeBanner:</strong> 항상 표시되며 닫기 버튼이 없습니다
            </li>
            <li>
              <strong>useBannerDismiss:</strong> localStorage에 7일간 닫기 상태를 저장합니다
            </li>
            <li>
              <strong>통합 위치:</strong> 대시보드 상단, 사이드바 하단, 에디터, AI 생성 모달
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
