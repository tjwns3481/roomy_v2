// @TASK P8-S2-T3 - Upsell 위젯 통합 테스트 (간소화 버전)
// @SPEC specs/screens/guest-viewer.yaml

import { render, screen, waitFor } from '@testing-library/react';
import { UpsellWidget } from '@/components/guest/UpsellWidget';
import type { UpsellItem } from '@/types/upsell';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UpsellWidget Integration', () => {
  const mockItems: UpsellItem[] = [
    {
      id: 'item-1',
      guidebook_id: 'guidebook-1',
      name: '조식 서비스',
      description: '신선한 재료로 만든 건강한 아침식사',
      price: 15000,
      image_url: 'https://example.com/breakfast.jpg',
      is_active: true,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('아이템을 로딩하여 표시해야 함', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockItems, total: 1 }),
    });

    render(<UpsellWidget guidebookId="guidebook-1" />);

    // API 호출 확인
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/guidebooks/guidebook-1/upsell/items'
      );
    });

    // 아이템이 렌더링되는지 확인
    await waitFor(() => {
      expect(screen.getByText('조식 서비스')).toBeInTheDocument();
    });
  });

  it('아이템이 없을 때 위젯을 표시하지 않아야 함', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    });

    const { container } = render(<UpsellWidget guidebookId="guidebook-1" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // 위젯이 렌더링되지 않아야 함
    expect(container.firstChild).toBeNull();
  });

  it('로딩 중 스켈레톤을 표시해야 함', () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // 무한 대기
    );

    render(<UpsellWidget guidebookId="guidebook-1" />);

    // 스켈레톤 요소 확인
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
