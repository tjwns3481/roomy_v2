# Coding Convention & AI Collaboration Guide

> Roomy - Korean Digital Guest Guidebook SaaS 개발을 위한 코딩 컨벤션 및 AI 협업 가이드

---

## MVP Capsule

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 한국형 디지털 게스트 가이드북 SaaS 플랫폼 구축 |
| 2 | 페르소나 | 펜션/에어비앤비 호스트 (비개발자, AI 활용 기대) |
| 3 | 핵심 기능 | 에어비앤비 링크 → AI 가이드북 생성 → 게스트 공유 |
| 4 | 성공 지표 | 유료 전환율 5%, MAU 1,000명 (3개월) |
| 5 | 입력 지표 | 가이드북 생성 수, 게스트 조회수 |
| 6 | 비기능 요구 | Supabase RLS 기반 보안, 모바일 최적화 |
| 7 | Out-of-scope | 카카오톡 알림톡, PMS 연동 (Phase 2) |
| 8 | Top 리스크 | AI 크롤링 정확도, 에어비앤비 페이지 구조 변경 |
| 9 | 완화/실험 | 크롤링 실패 시 수동 입력 폴백 |
| 10 | 다음 단계 | P0 프로젝트 셋업 완료 후 P1 블록 에디터 구현 |

---

## 1. 핵심 원칙

### 1.1 호스트 친화적 코드

이 프로젝트의 최종 사용자는 **비개발자 호스트**입니다:

- **직관적인 UI**: 복잡한 기능도 단순하게
- **한국어 우선**: 에러 메시지, 안내 문구 모두 한국어
- **모바일 우선**: 게스트 뷰는 반드시 모바일 최적화
- **빠른 피드백**: 로딩 상태, 저장 상태 명확히 표시

### 1.2 블록 기반 아키텍처

가이드북은 **블록** 단위로 구성됩니다:

- **8가지 블록 타입**: hero, quickInfo, amenities, rules, map, gallery, notice, custom
- **JSONB 콘텐츠**: 블록별 유연한 데이터 구조
- **순서 관리**: `order_index`로 드래그앤드롭 정렬
- **타입 안전**: 각 블록 타입별 TypeScript 인터페이스

### 1.3 한국 특화 콘텐츠

한국 숙박 환경에 맞는 콘텐츠 제공:

- **분리수거 안내**: 일반/음식물/재활용/대형 쓰레기
- **온돌 사용법**: 보일러 조작 방법
- **디지털 도어락**: 비밀번호 입력 방법
- **응급 연락처**: 119, 112, 1330

### 1.4 신뢰하되, 검증하라

AI 생성 코드 및 크롤링 데이터 검증:

- [ ] AI 생성 가이드북 내용 검토
- [ ] 크롤링 데이터 정확성 확인
- [ ] 보안 검토: 민감 정보 노출 여부
- [ ] 테스트 실행: 자동화 테스트 통과 확인

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
roomy/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (host)/                 # 호스트 페이지 (라우트 그룹)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # 대시보드
│   │   │   │   ├── guidebooks/
│   │   │   │   │   ├── page.tsx    # 가이드북 목록
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx # 새 가이드북
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx    # 통계
│   │   │   ├── editor/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # 블록 에디터
│   │   │   │       ├── settings/
│   │   │   │       │   └── page.tsx # 가이드북 설정
│   │   │   │       └── ai/
│   │   │   │           └── page.tsx # AI 생성
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx        # 설정
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx    # 프로필
│   │   │   │   └── subscription/
│   │   │   │       └── page.tsx    # 구독 관리
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx        # 플랜 비교
│   │   │   └── checkout/
│   │   │       └── page.tsx        # 결제
│   │   │
│   │   ├── (guest)/                # 게스트 페이지
│   │   │   ├── g/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # 게스트 가이드북 뷰
│   │   │   └── s/
│   │   │       └── [code]/
│   │   │           └── page.tsx    # 단축 URL 리다이렉트
│   │   │
│   │   ├── (auth)/                 # 인증 페이지
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── ai/
│   │   │   │   ├── crawl/
│   │   │   │   ├── generate/
│   │   │   │   └── usage/
│   │   │   ├── guidebooks/
│   │   │   │   └── [id]/
│   │   │   │       ├── blocks/
│   │   │   │       ├── share/
│   │   │   │       └── stats/
│   │   │   ├── subscriptions/
│   │   │   └── payments/
│   │   │
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 랜딩 페이지
│   │   └── globals.css             # 전역 스타일
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 기본 컴포넌트
│   │   ├── layout/                 # 레이아웃 컴포넌트
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   ├── editor/                 # 에디터 컴포넌트
│   │   │   ├── EditorLayout.tsx
│   │   │   ├── BlockList.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   └── blocks/
│   │   │       ├── HeroEditor.tsx
│   │   │       ├── QuickInfoEditor.tsx
│   │   │       ├── AmenitiesEditor.tsx
│   │   │       ├── RulesEditor.tsx
│   │   │       ├── MapEditor.tsx
│   │   │       ├── GalleryEditor.tsx
│   │   │       └── NoticeEditor.tsx
│   │   ├── guest/                  # 게스트 뷰 컴포넌트
│   │   │   ├── BlockRenderer.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── blocks/
│   │   │       ├── HeroBlock.tsx
│   │   │       ├── QuickInfoBlock.tsx
│   │   │       └── ...
│   │   ├── dashboard/              # 대시보드 컴포넌트
│   │   ├── ai/                     # AI 관련 컴포넌트
│   │   ├── share/                  # 공유 컴포넌트
│   │   └── landing/                # 랜딩 페이지 컴포넌트
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # 브라우저 클라이언트
│   │   │   ├── server.ts           # 서버 클라이언트
│   │   │   └── middleware.ts       # 미들웨어 클라이언트
│   │   ├── ai/
│   │   │   ├── generator.ts        # GPT-4o 가이드북 생성
│   │   │   └── templates/
│   │   │       └── korean.ts       # 한국 특화 템플릿
│   │   ├── crawler/
│   │   │   └── airbnb.ts           # 에어비앤비 크롤러
│   │   ├── maps/
│   │   │   ├── naver.ts            # 네이버 지도
│   │   │   └── kakao.ts            # 카카오 지도
│   │   ├── toss/
│   │   │   └── payments.ts         # 토스페이먼츠 유틸
│   │   ├── qr/
│   │   │   └── generator.ts        # QR 코드 생성
│   │   ├── theme/
│   │   │   └── presets.ts          # 테마 프리셋
│   │   ├── subscription/
│   │   │   └── limits.ts           # 플랜별 제한
│   │   └── utils/
│   │       ├── format.ts           # 포맷팅
│   │       └── validation.ts       # 유효성 검사
│   │
│   ├── stores/                     # Zustand 스토어
│   │   ├── editor-store.ts         # 에디터 상태
│   │   └── auth-store.ts           # 인증 상태
│   │
│   ├── types/                      # TypeScript 타입
│   │   ├── database.ts             # Supabase 생성 타입
│   │   ├── block.ts                # 블록 타입
│   │   ├── guidebook.ts            # 가이드북 타입
│   │   └── index.ts
│   │
│   └── hooks/                      # 커스텀 훅
│       ├── useAutoSave.ts
│       ├── useGuidebook.ts
│       └── useBlocks.ts
│
├── supabase/
│   ├── migrations/                 # DB 마이그레이션
│   │   ├── 001_core_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── ...
│   └── seed.sql                    # 시드 데이터
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   └── planning/                   # 기획 문서
│
└── public/
    └── images/
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| **파일 (컴포넌트)** | PascalCase | `HeroEditor.tsx` |
| **파일 (유틸/훅)** | camelCase | `useAutoSave.ts` |
| **컴포넌트** | PascalCase | `HeroEditor` |
| **함수** | camelCase | `generateGuidebook` |
| **변수** | camelCase | `blockContent` |
| **상수** | UPPER_SNAKE | `MAX_BLOCKS` |
| **타입/인터페이스** | PascalCase | `Block`, `HeroContent` |
| **블록 타입** | camelCase | `quickInfo`, `amenities` |
| **DB 테이블** | snake_case | `guidebooks`, `blocks` |
| **DB 컬럼** | snake_case | `order_index`, `created_at` |

### 2.3 파일 구조 규칙

**블록 에디터 컴포넌트:**
```tsx
// components/editor/blocks/HeroEditor.tsx

// 1. 임포트 (외부 → 내부 순)
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import type { HeroContent } from '@/types/block';

// 2. Props 타입 정의
interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

// 3. 컴포넌트
export function HeroEditor({ content, onChange }: HeroEditorProps) {
  // 로컬 상태 (필요시)
  const [isUploading, setIsUploading] = useState(false);

  // 핸들러
  const handleTitleChange = (title: string) => {
    onChange({ ...content, title });
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // 업로드 로직
    } finally {
      setIsUploading(false);
    }
  };

  // 렌더링
  return (
    <div className="space-y-4">
      <Input
        label="숙소 이름"
        value={content.title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />
      {/* ... */}
    </div>
  );
}
```

---

## 3. TypeScript 규칙

### 3.1 블록 타입 정의

```typescript
// types/block.ts

// 블록 타입 열거
export type BlockType =
  | 'hero'
  | 'quickInfo'
  | 'amenities'
  | 'rules'
  | 'map'
  | 'gallery'
  | 'notice'
  | 'custom';

// 기본 블록 인터페이스
export interface Block {
  id: string;
  guidebook_id: string;
  type: BlockType;
  order_index: number;
  content: BlockContent;
  created_at: string;
  updated_at: string;
}

// 블록별 콘텐츠 타입
export interface HeroContent {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface QuickInfoContent {
  checkIn: string;
  checkOut: string;
  wifi?: {
    ssid: string;
    password: string;
  };
  doorlock?: {
    password: string;
    instructions?: string;
  };
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AmenitiesContent {
  items: Array<{
    id: string;
    name: string;
    icon: string;
    available: boolean;
    description?: string;
  }>;
}

export interface RulesContent {
  sections: Array<{
    id: string;
    title: string;
    items: string[];
  }>;
  trashGuide?: {
    general: string;
    food: string;
    recyclable: string;
    large?: string;
  };
  checkoutList?: string[];
}

export interface MapContent {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers: Array<{
    id: string;
    name: string;
    type: 'accommodation' | 'convenience' | 'restaurant' | 'attraction';
    lat: number;
    lng: number;
    description?: string;
  }>;
}

export interface GalleryContent {
  images: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  layout: 'grid' | 'slider';
}

export interface NoticeContent {
  title: string;
  content: string;
  level: 'info' | 'warning' | 'danger';
}

export interface CustomContent {
  title: string;
  content: string; // Markdown 지원
}

// 유니온 타입
export type BlockContent =
  | HeroContent
  | QuickInfoContent
  | AmenitiesContent
  | RulesContent
  | MapContent
  | GalleryContent
  | NoticeContent
  | CustomContent;
```

### 3.2 가이드북 타입 정의

```typescript
// types/guidebook.ts

export type GuidebookStatus = 'draft' | 'published' | 'private';

export interface Guidebook {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description?: string;
  status: GuidebookStatus;
  theme: string;
  airbnb_url?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuidebookWithBlocks extends Guidebook {
  blocks: Block[];
}
```

### 3.3 Zod 스키마 (검증)

```typescript
// lib/validations/block.ts
import { z } from 'zod';

export const heroContentSchema = z.object({
  title: z.string().min(1, '숙소 이름을 입력하세요').max(100),
  subtitle: z.string().max(200).optional(),
  backgroundImage: z.string().url().optional(),
  overlayColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
});

export const quickInfoContentSchema = z.object({
  checkIn: z.string().min(1, '체크인 시간을 입력하세요'),
  checkOut: z.string().min(1, '체크아웃 시간을 입력하세요'),
  wifi: z.object({
    ssid: z.string(),
    password: z.string(),
  }).optional(),
  doorlock: z.object({
    password: z.string(),
    instructions: z.string().optional(),
  }).optional(),
  address: z.string().min(1, '주소를 입력하세요'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// 블록 생성 스키마
export const createBlockSchema = z.object({
  type: z.enum(['hero', 'quickInfo', 'amenities', 'rules', 'map', 'gallery', 'notice', 'custom']),
  content: z.record(z.unknown()),
});
```

---

## 4. React/Next.js 규칙

### 4.1 서버 컴포넌트 우선

```tsx
// app/(guest)/g/[slug]/page.tsx (서버 컴포넌트)
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { BlockRenderer } from '@/components/guest/BlockRenderer';
import { ThemeProvider } from '@/components/guest/ThemeProvider';

interface Props {
  params: { slug: string };
}

export default async function GuestGuidebookPage({ params }: Props) {
  const supabase = createServerClient();

  // 가이드북 조회
  const { data: guidebook } = await supabase
    .from('guidebooks')
    .select(`
      *,
      blocks (*)
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!guidebook) {
    notFound();
  }

  // 조회수 증가 (별도 API 호출)
  fetch(`/api/guidebooks/${guidebook.id}/stats`, { method: 'POST' });

  return (
    <ThemeProvider theme={guidebook.theme}>
      <div className="min-h-screen">
        {guidebook.blocks
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
      </div>
    </ThemeProvider>
  );
}
```

### 4.2 클라이언트 컴포넌트 분리

```tsx
// components/guest/blocks/QuickInfoBlock.tsx
'use client';

import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { QuickInfoContent } from '@/types/block';

interface QuickInfoBlockProps {
  content: QuickInfoContent;
}

export function QuickInfoBlock({ content }: QuickInfoBlockProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // 복사 핸들러
  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: '복사되었습니다!' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 지도 앱 열기
  const handleOpenMap = () => {
    const { lat, lng } = content.coordinates || {};
    if (lat && lng) {
      // iOS는 Apple Maps, Android는 Google Maps
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 체크인/아웃 */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon="🔑"
          label="체크인"
          value={content.checkIn}
        />
        <InfoCard
          icon="🚪"
          label="체크아웃"
          value={content.checkOut}
        />
      </div>

      {/* 와이파이 */}
      {content.wifi && (
        <CopyableCard
          icon="📶"
          label="와이파이"
          value={content.wifi.password}
          subLabel={content.wifi.ssid}
          onCopy={() => handleCopy(content.wifi!.password, 'wifi')}
          copied={copiedField === 'wifi'}
        />
      )}

      {/* 도어락 */}
      {content.doorlock && (
        <PasswordCard
          icon="🔐"
          label="도어락 비밀번호"
          value={content.doorlock.password}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          onCopy={() => handleCopy(content.doorlock!.password, 'doorlock')}
          copied={copiedField === 'doorlock'}
        />
      )}

      {/* 주소 */}
      <div
        className="p-4 bg-gray-50 rounded-lg cursor-pointer"
        onClick={handleOpenMap}
      >
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span className="font-medium">주소</span>
        </div>
        <p className="mt-1 text-gray-600">{content.address}</p>
        <p className="mt-1 text-sm text-blue-600">탭하여 지도 열기 →</p>
      </div>
    </div>
  );
}
```

### 4.3 에디터 자동저장 훅

```tsx
// hooks/useAutoSave.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';

interface UseAutoSaveOptions {
  delay?: number; // 디바운스 딜레이 (기본 3초)
  onSave: (data: unknown) => Promise<void>;
}

export function useAutoSave({ delay = 3000, onSave }: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { isDirty, setDirty } = useEditorStore();

  const save = useCallback(async (data: unknown) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onSave(data);
        setSaveStatus('saved');
        setDirty(false);
        // 2초 후 idle로 복귀
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('자동저장 실패:', error);
      }
    }, delay);
  }, [delay, onSave, setDirty]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, saveStatus, isDirty };
}
```

---

## 5. API 라우트 규칙

### 5.1 블록 CRUD API

```typescript
// app/api/guidebooks/[id]/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createBlockSchema } from '@/lib/validations/block';

interface RouteParams {
  params: { id: string };
}

// GET /api/guidebooks/[id]/blocks - 블록 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerClient();

    // 가이드북 소유권 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      );
    }

    const { data: guidebook } = await supabase
      .from('guidebooks')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!guidebook || guidebook.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 블록 조회
    const { data: blocks, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('guidebook_id', params.id)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: blocks });
  } catch (error) {
    console.error('블록 조회 실패:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: '블록을 불러올 수 없습니다' } },
      { status: 500 }
    );
  }
}

// POST /api/guidebooks/[id]/blocks - 블록 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createServerClient();

    // 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      );
    }

    // 요청 본문 검증
    const body = await request.json();
    const validation = createBlockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '입력값이 올바르지 않습니다', details: validation.error.errors } },
        { status: 400 }
      );
    }

    // 최대 order_index 조회
    const { data: maxBlock } = await supabase
      .from('blocks')
      .select('order_index')
      .eq('guidebook_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const newOrderIndex = (maxBlock?.order_index ?? -1) + 1;

    // 블록 생성
    const { data: block, error } = await supabase
      .from('blocks')
      .insert({
        guidebook_id: params.id,
        type: validation.data.type,
        content: validation.data.content,
        order_index: newOrderIndex,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: block }, { status: 201 });
  } catch (error) {
    console.error('블록 생성 실패:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: '블록을 생성할 수 없습니다' } },
      { status: 500 }
    );
  }
}
```

### 5.2 AI 생성 API

```typescript
// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateGuidebook } from '@/lib/ai/generator';
import { checkAiUsageLimit } from '@/lib/subscription/limits';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      );
    }

    // AI 사용량 제한 확인
    const canUse = await checkAiUsageLimit(user.id);
    if (!canUse) {
      return NextResponse.json(
        { error: { code: 'LIMIT_EXCEEDED', message: 'AI 생성 한도를 초과했습니다. Pro 플랜으로 업그레이드하세요.' } },
        { status: 429 }
      );
    }

    const { crawledData, guidebookId } = await request.json();

    // 스트리밍 응답 설정
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 백그라운드에서 AI 생성
    (async () => {
      try {
        for await (const chunk of generateGuidebook(crawledData)) {
          await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: '생성 실패' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI 생성 실패:', error);
    return NextResponse.json(
      { error: { code: 'GENERATE_ERROR', message: 'AI 생성에 실패했습니다' } },
      { status: 500 }
    );
  }
}
```

### 5.3 응답 형식

```typescript
// 성공
{
  data: { ... },
  meta?: { page: 1, total: 100 }
}

// 에러
{
  error: {
    code: 'ERROR_CODE',
    message: '사용자에게 보여줄 메시지 (한국어)',
    details?: [...]
  }
}
```

---

## 6. Supabase 규칙

### 6.1 클라이언트 사용

```typescript
// 서버 컴포넌트에서
import { createServerClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createServerClient();
  const { data } = await supabase.from('guidebooks').select('*');
  // ...
}

// 클라이언트 컴포넌트에서
'use client';
import { createClient } from '@/lib/supabase/client';

export function Component() {
  const supabase = createClient();
  // ...
}
```

### 6.2 RLS 정책 테스트

```sql
-- 테스트: 본인 가이드북만 조회 가능
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

SELECT * FROM guidebooks; -- 본인 것만 반환되어야 함

-- 테스트: 다른 사용자 가이드북 접근 불가
SET LOCAL request.jwt.claims = '{"sub": "other-user-uuid"}';

SELECT * FROM guidebooks WHERE user_id = 'original-user-uuid'; -- 0건 반환
```

---

## 7. 보안 체크리스트

### 7.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키, OpenAI 키)
- [ ] `.env` 파일 커밋 금지
- [ ] 클라이언트에 `SUPABASE_SERVICE_ROLE_KEY` 노출 금지
- [ ] 클라이언트에 `OPENAI_API_KEY` 노출 금지
- [ ] 게스트 뷰에서 에디터 API 호출 금지

### 7.2 필수 적용

- [ ] 모든 호스트 API에서 인증 확인
- [ ] 가이드북/블록 API에서 소유권 확인
- [ ] 구독 제한 체크 (가이드북 생성, AI 사용)
- [ ] 이미지 업로드 시 타입/크기 검증

### 7.3 환경 변수

```bash
# .env.local (커밋 X)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # 서버에서만
OPENAI_API_KEY=sk-...                   # 서버에서만
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...             # 서버에서만
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=...
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. 테스트

### 8.1 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 단위 테스트 |
| React Testing Library | 컴포넌트 테스트 |
| Playwright | E2E 테스트 |

### 8.2 테스트 우선순위

1. **블록 에디터** - 블록 CRUD, 자동저장 (단위/통합)
2. **게스트 뷰** - 블록 렌더링, 복사 기능 (E2E)
3. **AI 생성** - 크롤링, 콘텐츠 생성 (통합)
4. **결제 플로우** - 구독 시작/취소 (E2E)

### 8.3 테스트 명령어

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run e2e

# 테스트 커버리지
npm run test:coverage
```

---

## 9. Git 워크플로우

### 9.1 브랜치 전략

```
main                    # 프로덕션
├── phase-1-editor      # P1: 블록 에디터
├── phase-2-guest       # P2: 게스트 뷰어
├── phase-3-ai          # P3: AI 생성
├── phase-4-dashboard   # P4: 대시보드
├── phase-5-share       # P5: 공유
├── phase-6-subscription # P6: 구독/결제
└── phase-7-launch      # P7: 런칭
```

### 9.2 커밋 메시지

```
<type>(<scope>): <subject>

<body>
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 기타

**스코프 (Roomy):**
- `editor`: 블록 에디터
- `guest`: 게스트 뷰
- `ai`: AI 생성
- `dashboard`: 대시보드
- `share`: 공유
- `subscription`: 구독/결제

**예시:**
```
feat(editor): HeroBlock 에디터 구현

- 숙소명, 서브타이틀 입력
- 배경 이미지 업로드
- 실시간 프리뷰

Closes #12
```

---

## 10. AI 협업 팁

### 10.1 효과적인 프롬프트

**좋은 예:**
```
TASKS.md의 P1-T1.3 "HeroBlock 에디터" 태스크를 구현해주세요.

참조:
- types/block.ts의 HeroContent 타입
- 05-design-system.md의 에디터 컴포넌트 스타일

요구사항:
- 숙소명 입력 (필수)
- 서브타이틀 입력 (선택)
- 배경 이미지 업로드 (드래그앤드롭)
- 오버레이 색상/투명도 조절
```

**나쁜 예:**
```
블록 에디터 만들어줘
```

### 10.2 블록 콘텐츠 수정 요청

```
components/editor/blocks/QuickInfoEditor.tsx의
와이파이 섹션을 수정해주세요.

현재 문제:
- SSID와 비밀번호가 한 줄에 표시됨

원하는 동작:
- SSID와 비밀번호 각각 별도 입력 필드
- 비밀번호 표시/숨김 토글 추가
```

### 10.3 AI 생성 오류 해결 요청

```
## 에러
크롤링된 데이터에서 체크인/체크아웃 시간이 추출되지 않음

## 재현
1. 에어비앤비 URL: https://www.airbnb.co.kr/rooms/12345
2. AI 생성 버튼 클릭
3. QuickInfo 블록에 시간 정보 없음

## 크롤링 결과 (일부)
{ amenities: [...], description: "..." }

## 시도한 것
- 셀렉터 확인 → 페이지 구조 변경된 것 같음
```

---

## Decision Log

- **블록 시스템**: 8가지 타입, JSONB 콘텐츠로 유연성 확보
- **한국 특화**: 분리수거, 온돌, 도어락 콘텐츠 기본 제공
- **자동저장**: 3초 디바운스로 UX 개선
- **게스트 뷰**: 모바일 우선, 터치 친화적 UI
- **지도 연동**: 네이버/카카오 지도 SDK (한국 특화)
- **AI 생성**: GPT-4o 사용, 스트리밍 응답
- **구독 제한**: 플랜별 가이드북 수, AI 사용량 제한
