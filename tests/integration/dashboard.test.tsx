// @TASK P8-S5-T1 - 대시보드 통합 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/(host)/dashboard/page';

// Clerk 모킹
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
  }),
}));

// Next.js 라우터 모킹
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Fetch 모킹
global.fetch = vi.fn();

describe('Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('대시보드가 정상적으로 렌더링되어야 함', async () => {
    // API 응답 모킹
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        guidebooks: [
          {
            id: '1',
            title: '서울 게스트하우스',
            slug: 'seoul-guesthouse',
            status: 'published',
            view_count: 123,
            hero_image_url: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
          },
        ],
      }),
    });

    render(<DashboardPage />);

    // 환영 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('환영합니다!')).toBeInTheDocument();
    });

    // 통계 카드 확인
    expect(screen.getByText('총 가이드북')).toBeInTheDocument();
    expect(screen.getByText('총 조회수')).toBeInTheDocument();
    expect(screen.getByText('공개 중')).toBeInTheDocument();
    expect(screen.getByText('플랜')).toBeInTheDocument();

    // 가이드북 목록 확인
    await waitFor(() => {
      expect(screen.getByText('서울 게스트하우스')).toBeInTheDocument();
    });
  });

  it('가이드북이 없을 때 빈 상태를 표시해야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        guidebooks: [],
      }),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('아직 가이드북이 없습니다')).toBeInTheDocument();
    });

    expect(screen.getByText(/첫 가이드북을 만들어 게스트에게 공유해보세요/)).toBeInTheDocument();
  });

  it('통계가 정확하게 계산되어야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        guidebooks: [
          { id: '1', status: 'published', view_count: 100, title: 'G1', slug: 's1', created_at: '', updated_at: '' },
          { id: '2', status: 'published', view_count: 200, title: 'G2', slug: 's2', created_at: '', updated_at: '' },
          { id: '3', status: 'draft', view_count: 50, title: 'G3', slug: 's3', created_at: '', updated_at: '' },
        ],
      }),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // 총 가이드북: 3
      expect(screen.getByText('3')).toBeInTheDocument();

      // 총 조회수: 350 (100 + 200 + 50)
      expect(screen.getByText('350')).toBeInTheDocument();

      // 공개 중: 2
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
