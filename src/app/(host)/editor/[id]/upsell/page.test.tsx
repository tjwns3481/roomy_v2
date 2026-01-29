// @TASK P8-S13-T1: Upsell 설정 페이지 테스트
// @SPEC TDD: RED → GREEN → REFACTOR

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import UpsellSettingsPage from './page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({ id: 'test-guidebook-id' }),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: 'item-1',
                guidebook_id: 'test-guidebook-id',
                name: '조식 서비스',
                description: '맛있는 아침 식사',
                price: 15000,
                image_url: 'https://example.com/breakfast.jpg',
                is_active: true,
                sort_order: 0,
                created_at: '2024-01-29T00:00:00Z',
                updated_at: '2024-01-29T00:00:00Z',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })
      ),
    },
  }),
}));

describe('UpsellSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Business 플랜이 아니면 업그레이드 안내 표시', async () => {
    render(await UpsellSettingsPage({ params: Promise.resolve({ id: 'test-guidebook-id' }) }));

    await waitFor(() => {
      expect(
        screen.getByText(/Upsell 기능은 Business 플랜에서만 사용할 수 있습니다/i)
      ).toBeInTheDocument();
    });
  });

  it('아이템 목록이 카드 형태로 표시됨', async () => {
    // TODO: Business 플랜 mock 추가
    render(await UpsellSettingsPage({ params: Promise.resolve({ id: 'test-guidebook-id' }) }));

    await waitFor(() => {
      expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      expect(screen.getByText('맛있는 아침 식사')).toBeInTheDocument();
      expect(screen.getByText('₩15,000')).toBeInTheDocument();
    });
  });

  it('추가 버튼 클릭 시 폼 모달 열림', async () => {
    render(await UpsellSettingsPage({ params: Promise.resolve({ id: 'test-guidebook-id' }) }));

    const addButton = screen.getByText(/아이템 추가/i);
    await addButton.click();

    await waitFor(() => {
      expect(screen.getByText(/새 Upsell 아이템/i)).toBeInTheDocument();
    });
  });
});
