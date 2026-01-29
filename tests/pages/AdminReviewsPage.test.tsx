/**
 * Admin Reviews & Inquiries Management Page Test
 *
 * Test Coverage:
 * - 후기 목록 조회 및 필터링
 * - 베스트 후기 선정
 * - 후기 삭제
 * - 문의 목록 조회 및 필터링
 * - 문의 답변 작성
 * - 상태 변경
 * - 일괄 처리
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('Admin Reviews Management', () => {
  const mockReviews = [
    {
      id: 'review-1',
      product_id: 'product-1',
      user_id: 'user-1',
      rating: 5,
      title: '정말 유용합니다',
      content: '상품이 기대 이상이네요.',
      images: ['https://example.com/image1.jpg'],
      like_count: 10,
      view_count: 100,
      is_best: false,
      created_at: '2026-01-20T10:00:00Z',
      profiles: { nickname: '사용자1', avatar_url: null },
      products: { name: '상품1', slug: 'product-1' },
    },
    {
      id: 'review-2',
      product_id: 'product-2',
      user_id: 'user-2',
      rating: 3,
      title: '보통입니다',
      content: '가격 대비 그럭저럭.',
      images: [],
      like_count: 2,
      view_count: 30,
      is_best: true,
      created_at: '2026-01-19T10:00:00Z',
      profiles: { nickname: '사용자2', avatar_url: null },
      products: { name: '상품2', slug: 'product-2' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-1', role: 'admin' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
              count: 2,
            }),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockReviews[0],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('관리자가 후기 목록을 조회할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    render(<AdminReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
      expect(screen.getByText('보통입니다')).toBeInTheDocument();
    });
  });

  it('별점별로 필터링할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    const ratingFilter = await screen.findByLabelText(/별점/i);
    await user.selectOptions(ratingFilter, '5');

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
    });
  });

  it('기간별로 필터링할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    const startDate = await screen.findByLabelText(/시작일/i);
    const endDate = await screen.findByLabelText(/종료일/i);

    await user.type(startDate, '2026-01-19');
    await user.type(endDate, '2026-01-20');

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
    });
  });

  it('베스트 후기를 선정할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
    });

    const reviewCard = screen.getByText('정말 유용합니다').closest('div');
    const setBestButton = within(reviewCard!).getByRole('button', { name: /베스트 선정/i });
    await user.click(setBestButton);

    await waitFor(() => {
      expect(screen.getByText(/베스트 후기로 선정되었습니다/i)).toBeInTheDocument();
    });
  });

  it('후기를 삭제할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
    });

    const reviewCard = screen.getByText('정말 유용합니다').closest('div');
    const deleteButton = within(reviewCard!).getByRole('button', { name: /삭제/i });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: /확인/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/삭제되었습니다/i)).toBeInTheDocument();
    });
  });

  it('일괄 베스트 선정을 할 수 있어야 한다', async () => {
    const AdminReviewsPage = (await import('@/app/admin/reviews/page')).default;
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('정말 유용합니다')).toBeInTheDocument();
    });

    // 체크박스 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // 전체 선택 또는 개별 선택

    const bulkActionButton = screen.getByRole('button', { name: /일괄 처리/i });
    await user.click(bulkActionButton);

    const setBestOption = await screen.findByText(/베스트 선정/i);
    await user.click(setBestOption);

    await waitFor(() => {
      expect(screen.getByText(/일괄 처리되었습니다/i)).toBeInTheDocument();
    });
  });
});

describe('Admin Inquiries Management', () => {
  const mockInquiries = [
    {
      id: 'inquiry-1',
      product_id: 'product-1',
      user_id: 'user-1',
      category: 'product',
      title: '상품 문의드립니다',
      content: '재고가 언제 들어오나요?',
      is_private: false,
      status: 'pending',
      answer: null,
      answered_at: null,
      answered_by: null,
      view_count: 10,
      created_at: '2026-01-20T10:00:00Z',
      author: { nickname: '사용자1', avatar_url: null },
      product: { name: '상품1', slug: 'product-1' },
    },
    {
      id: 'inquiry-2',
      product_id: null,
      user_id: 'user-2',
      category: 'payment',
      title: '결제 오류입니다',
      content: '결제가 안 되네요.',
      is_private: true,
      status: 'answered',
      answer: '확인해보겠습니다.',
      answered_at: '2026-01-21T10:00:00Z',
      answered_by: 'admin-1',
      view_count: 5,
      created_at: '2026-01-19T10:00:00Z',
      author: { nickname: '사용자2', avatar_url: null },
      product: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-1', role: 'admin' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'inquiries') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({
              data: mockInquiries,
              error: null,
              count: 2,
            }),
            update: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockInquiries[0],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('관리자가 문의 목록을 조회할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    render(<AdminInquiriesPage />);

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
      expect(screen.getByText('결제 오류입니다')).toBeInTheDocument();
    });
  });

  it('상태별로 필터링할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    const user = userEvent.setup();
    render(<AdminInquiriesPage />);

    const statusFilter = await screen.findByLabelText(/상태/i);
    await user.selectOptions(statusFilter, 'pending');

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
    });
  });

  it('카테고리별로 필터링할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    const user = userEvent.setup();
    render(<AdminInquiriesPage />);

    const categoryFilter = await screen.findByLabelText(/카테고리/i);
    await user.selectOptions(categoryFilter, 'product');

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
    });
  });

  it('문의에 답변을 작성할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    const user = userEvent.setup();
    render(<AdminInquiriesPage />);

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
    });

    const inquiryCard = screen.getByText('상품 문의드립니다').closest('div');
    const answerButton = within(inquiryCard!).getByRole('button', { name: /답변/i });
    await user.click(answerButton);

    const answerTextarea = await screen.findByLabelText(/답변 내용/i);
    await user.type(answerTextarea, '곧 재고가 입고될 예정입니다.');

    const submitButton = screen.getByRole('button', { name: /답변 등록/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/답변이 등록되었습니다/i)).toBeInTheDocument();
    });
  });

  it('답변 템플릿을 사용할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    const user = userEvent.setup();
    render(<AdminInquiriesPage />);

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
    });

    const inquiryCard = screen.getByText('상품 문의드립니다').closest('div');
    const answerButton = within(inquiryCard!).getByRole('button', { name: /답변/i });
    await user.click(answerButton);

    const templateButton = await screen.findByRole('button', { name: /템플릿/i });
    await user.click(templateButton);

    const template1 = await screen.findByText(/재고 문의/i);
    await user.click(template1);

    const answerTextarea = screen.getByLabelText(/답변 내용/i) as HTMLTextAreaElement;
    expect(answerTextarea.value).toContain('재고가 곧 입고될 예정입니다');
  });

  it('일괄 상태 변경을 할 수 있어야 한다', async () => {
    const AdminInquiriesPage = (await import('@/app/admin/inquiries/page')).default;
    const user = userEvent.setup();
    render(<AdminInquiriesPage />);

    await waitFor(() => {
      expect(screen.getByText('상품 문의드립니다')).toBeInTheDocument();
    });

    // 체크박스 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const bulkActionButton = screen.getByRole('button', { name: /일괄 처리/i });
    await user.click(bulkActionButton);

    const statusOption = await screen.findByText(/상태 변경/i);
    await user.click(statusOption);

    await waitFor(() => {
      expect(screen.getByText(/일괄 처리되었습니다/i)).toBeInTheDocument();
    });
  });
});
