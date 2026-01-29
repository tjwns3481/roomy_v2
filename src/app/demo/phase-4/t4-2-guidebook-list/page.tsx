// @TASK P4-T4.2 - 가이드북 목록 데모 페이지
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import { useState } from 'react';
import { GuidebookCard } from '@/components/dashboard/GuidebookCard';
import { GuidebookGrid } from '@/components/dashboard/GuidebookGrid';
import { EmptyState } from '@/components/dashboard/EmptyState';
import type { Guidebook } from '@/types/guidebook';

// Mock 데이터
const MOCK_GUIDEBOOKS: Guidebook[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: '서울 강남 아파트',
    slug: 'seoul-gangnam-apt',
    description: '강남역 도보 5분 거리의 깔끔한 아파트입니다',
    airbnb_url: 'https://airbnb.com/rooms/123',
    property_type: 'apartment',
    address: '서울시 강남구',
    latitude: 37.4979,
    longitude: 127.0276,
    status: 'published',
    is_password_protected: false,
    theme: 'modern',
    primary_color: '#2563EB',
    secondary_color: '#F97316',
    hero_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=450&fit=crop',
    og_image_url: null,
    view_count: 128,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-28T15:30:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    title: '제주 오션뷰 펜션',
    slug: 'jeju-ocean-view',
    description: '바다가 보이는 제주 펜션',
    airbnb_url: null,
    property_type: 'pension',
    address: '제주시',
    latitude: 33.4996,
    longitude: 126.5312,
    status: 'draft',
    is_password_protected: false,
    theme: 'nature',
    primary_color: '#10B981',
    secondary_color: '#3B82F6',
    hero_image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=450&fit=crop',
    og_image_url: null,
    view_count: 45,
    created_at: '2024-01-25T14:00:00Z',
    updated_at: '2024-01-27T09:15:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    title: '부산 해운대 스튜디오',
    slug: 'busan-haeundae-studio',
    description: '해운대 해수욕장 앞 스튜디오',
    airbnb_url: 'https://airbnb.com/rooms/456',
    property_type: 'studio',
    address: '부산시 해운대구',
    latitude: 35.1584,
    longitude: 129.1600,
    status: 'archived',
    is_password_protected: false,
    theme: 'cozy',
    primary_color: '#F59E0B',
    secondary_color: '#EF4444',
    hero_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=450&fit=crop',
    og_image_url: null,
    view_count: 89,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-26T18:45:00Z',
  },
  {
    id: '4',
    user_id: 'user-1',
    title: '경주 한옥 게스트하우스',
    slug: 'gyeongju-hanok',
    description: '전통 한옥 스테이',
    airbnb_url: null,
    property_type: 'house',
    address: '경주시',
    latitude: 35.8562,
    longitude: 129.2247,
    status: 'published',
    is_password_protected: false,
    theme: 'minimal',
    primary_color: '#6B7280',
    secondary_color: '#D97706',
    hero_image_url: null, // 이미지 없는 케이스
    og_image_url: null,
    view_count: 234,
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2024-01-28T11:20:00Z',
  },
];

const DEMO_STATES = {
  normal: {
    guidebooks: MOCK_GUIDEBOOKS,
    isLoading: false,
  },
  empty: {
    guidebooks: [],
    isLoading: false,
  },
  loading: {
    guidebooks: [],
    isLoading: true,
  },
  singleCard: {
    guidebooks: [MOCK_GUIDEBOOKS[0]],
    isLoading: false,
  },
} as const;

export default function GuidebookListDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('normal');
  const currentState = DEMO_STATES[state];

  const handleAction = (action: string, id?: string) => {
    console.log(`Action: ${action}`, id);
    alert(`${action} 실행됨 ${id ? `(ID: ${id})` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 상태 선택기 */}
      <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">데모 상태 선택</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(DEMO_STATES).map((s) => (
            <button
              key={s}
              onClick={() => setState(s as keyof typeof DEMO_STATES)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                state === s
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 상태 정보 */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">현재 상태: {state}</h3>
        <pre className="text-xs text-blue-800 overflow-auto">
          {JSON.stringify(
            {
              guidebooksCount: currentState.guidebooks.length,
              isLoading: currentState.isLoading,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* 컴포넌트 렌더링 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">GuidebookGrid 컴포넌트</h2>
        <GuidebookGrid
          guidebooks={currentState.guidebooks}
          isLoading={currentState.isLoading}
          onEdit={(id) => handleAction('수정', id)}
          onPreview={(slug) => handleAction('미리보기', slug)}
          onShare={(guidebook) => handleAction('공유', guidebook.id)}
          onDuplicate={(id) => handleAction('복제', id)}
          onSettings={(id) => handleAction('설정', id)}
          onArchive={(id) => handleAction('보관', id)}
          onDelete={(id) => handleAction('삭제', id)}
          onCreateNew={() => handleAction('새 가이드북 만들기')}
        />
      </div>

      {/* 단일 카드 프리뷰 */}
      {state === 'singleCard' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">GuidebookCard (단일)</h2>
          <div className="max-w-sm">
            <GuidebookCard
              guidebook={currentState.guidebooks[0]}
              onEdit={(id) => handleAction('수정', id)}
              onPreview={(slug) => handleAction('미리보기', slug)}
              onShare={(guidebook) => handleAction('공유', guidebook.id)}
              onDuplicate={(id) => handleAction('복제', id)}
              onSettings={(id) => handleAction('설정', id)}
              onArchive={(id) => handleAction('보관', id)}
              onDelete={(id) => handleAction('삭제', id)}
            />
          </div>
        </div>
      )}

      {/* EmptyState 프리뷰 */}
      {state === 'empty' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">EmptyState (단독)</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <EmptyState onCreateNew={() => handleAction('새 가이드북 만들기')} />
          </div>
        </div>
      )}

      {/* 상태 설명 */}
      <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">상태 설명</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>normal:</strong> 4개의 가이드북 (published, draft, archived 포함)
          </li>
          <li>
            <strong>empty:</strong> 가이드북이 없을 때 (EmptyState 표시)
          </li>
          <li>
            <strong>loading:</strong> 로딩 중 (스켈레톤 UI 표시)
          </li>
          <li>
            <strong>singleCard:</strong> 단일 카드 프리뷰
          </li>
        </ul>
      </div>
    </div>
  );
}
