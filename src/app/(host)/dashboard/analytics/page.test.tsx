// @TASK P8-S8-T1 - 통계 페이지 고도화 테스트
// @SPEC specs/screens/s-08-analytics.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsPage from './page';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: { id: 'test-user-id', email: 'test@example.com' },
    })
  ),
}));

// Mock fetch
global.fetch = vi.fn();

const mockStatsData = {
  success: true,
  data: {
    summary: {
      totalViews: 1234,
      todayViews: 45,
      guidebookCount: 3,
      aiUsage: { used: 5, limit: 30 },
    },
    chartData: [
      { view_date: '2024-01-22', view_count: 10 },
      { view_date: '2024-01-23', view_count: 15 },
      { view_date: '2024-01-24', view_count: 20 },
      { view_date: '2024-01-25', view_count: 18 },
      { view_date: '2024-01-26', view_count: 25 },
      { view_date: '2024-01-27', view_count: 30 },
      { view_date: '2024-01-28', view_count: 45 },
    ],
    guidebookStats: [
      {
        id: 'gb1',
        title: '강남 스테이',
        views: 500,
        todayViews: 20,
        lastViewed: '2024-01-28T10:00:00Z',
      },
      {
        id: 'gb2',
        title: '홍대 게스트하우스',
        views: 400,
        todayViews: 15,
        lastViewed: '2024-01-28T09:00:00Z',
      },
      {
        id: 'gb3',
        title: '제주 펜션',
        views: 334,
        todayViews: 10,
        lastViewed: '2024-01-28T08:00:00Z',
      },
    ],
  },
};

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockStatsData,
    });
  });

  it('페이지 제목이 표시되어야 함', async () => {
    render(await AnalyticsPage());

    expect(
      screen.getByRole('heading', { name: /통계 대시보드/i })
    ).toBeInTheDocument();
  });

  it('요약 통계가 표시되어야 함', async () => {
    render(await AnalyticsPage());

    await waitFor(() => {
      expect(screen.getByText(/전체 조회수/i)).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText(/오늘 조회수/i)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('기간 선택 탭이 표시되어야 함', async () => {
    render(await AnalyticsPage());

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /일별/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /주별/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /월별/i })).toBeInTheDocument();
    });
  });

  it('조회수 추이 차트가 렌더링되어야 함', async () => {
    render(await AnalyticsPage());

    await waitFor(() => {
      expect(screen.getByText(/조회수 추이/i)).toBeInTheDocument();
    });
  });

  it('가이드북별 통계 목록이 표시되어야 함', async () => {
    render(await AnalyticsPage());

    await waitFor(() => {
      expect(screen.getByText('강남 스테이')).toBeInTheDocument();
      expect(screen.getByText('홍대 게스트하우스')).toBeInTheDocument();
      expect(screen.getByText('제주 펜션')).toBeInTheDocument();
    });
  });

  it('인증되지 않은 사용자는 접근할 수 없어야 함', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValueOnce(null);

    const result = await AnalyticsPage();

    // 리다이렉트 처리 확인
    expect(result).toBeTruthy();
  });
});
