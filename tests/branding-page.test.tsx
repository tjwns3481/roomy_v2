// @TASK P8-S11-T1: 브랜딩 설정 페이지 테스트
// @SPEC specs/screens/editor-branding.yaml

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BrandingPage from '@/app/(host)/editor/[id]/branding/page';
import { createServerClient } from '@/lib/supabase/server';

// Mocks
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({ id: 'test-guidebook-id' }),
}));

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  single: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

describe('P8-S11-T1: 브랜딩 설정 페이지', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockReturnValue(mockSupabaseClient);
  });

  describe('AC1: Free 플랜 접근 제한', () => {
    it('Free 플랜 사용자는 업그레이드 안내를 봐야 한다', async () => {
      // Given: Free 플랜 사용자
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          // guidebook 조회
          data: {
            id: 'test-guidebook-id',
            title: '테스트 가이드북',
            slug: 'test-slug',
            user_id: 'user-1',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          // users 조회
          data: { id: 'user-1', plan: 'free' },
          error: null,
        });

      // When: 브랜딩 페이지 접속
      const params = Promise.resolve({ id: 'test-guidebook-id' });
      render(await BrandingPage({ params }));

      // Then: 업그레이드 안내 표시
      await waitFor(() => {
        expect(screen.getByText(/Pro 플랜부터/i)).toBeInTheDocument();
      });
    });
  });

  describe('AC2: Pro+ 플랜 접근', () => {
    it('Pro 플랜 사용자는 브랜딩 폼을 볼 수 있다', async () => {
      // Given: Pro 플랜 사용자 + 기존 브랜딩
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          // guidebook 조회
          data: {
            id: 'test-guidebook-id',
            title: '테스트 가이드북',
            slug: 'test-slug',
            user_id: 'user-1',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          // users 조회
          data: { id: 'user-1', plan: 'pro' },
          error: null,
        })
        .mockResolvedValueOnce({
          // branding 조회
          data: {
            id: 'branding-1',
            guidebook_id: 'test-guidebook-id',
            logo_url: null,
            favicon_url: null,
            primary_color: '#FF385C',
            secondary_color: '#00A699',
            font_preset: 'pretendard',
            custom_css: null,
          },
          error: null,
        });

      // When: 브랜딩 페이지 접속
      const params = Promise.resolve({ id: 'test-guidebook-id' });
      render(await BrandingPage({ params }));

      // Then: 폼 표시
      await waitFor(() => {
        expect(screen.getByText(/로고/i)).toBeInTheDocument();
        expect(screen.getByText(/색상/i)).toBeInTheDocument();
        expect(screen.getByText(/글꼴/i)).toBeInTheDocument();
      });
    });
  });

  describe('AC3: 브랜딩 없을 때 기본값', () => {
    it('브랜딩이 없으면 기본값으로 초기화된다', async () => {
      // Given: 브랜딩 없음 (404)
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          // guidebook 조회
          data: {
            id: 'test-guidebook-id',
            title: '테스트 가이드북',
            slug: 'test-slug',
            user_id: 'user-1',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          // users 조회
          data: { id: 'user-1', plan: 'pro' },
          error: null,
        })
        .mockResolvedValueOnce({
          // branding 조회 실패 (PGRST116 = Not Found)
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        });

      // When: 페이지 렌더링
      const params = Promise.resolve({ id: 'test-guidebook-id' });
      render(await BrandingPage({ params }));

      // Then: 기본값으로 초기화
      await waitFor(() => {
        expect(screen.getByText(/로고/i)).toBeInTheDocument();
      });
    });
  });

  describe('AC4: 인증 및 권한 검증', () => {
    it('로그인하지 않은 사용자는 리다이렉트된다', async () => {
      // Given: 미인증 사용자
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      // When/Then: 리다이렉트 (실제로는 미들웨어에서 처리)
      const params = Promise.resolve({ id: 'test-guidebook-id' });
      await expect(async () => {
        await BrandingPage({ params });
      }).rejects.toThrow();
    });

    it('다른 사용자의 가이드북은 접근 불가', async () => {
      // Given: 다른 사용자 소유 가이드북
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }, // RLS로 차단
      });

      // When/Then: 404 에러
      const params = Promise.resolve({ id: 'other-user-guidebook' });
      await expect(async () => {
        await BrandingPage({ params });
      }).rejects.toThrow();
    });
  });
});
