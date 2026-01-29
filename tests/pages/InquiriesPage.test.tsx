/**
 * Inquiries Page Tests
 *
 * Tests for:
 * - Inquiries list page with filters
 * - Inquiry detail page with answer display
 * - Inquiry creation form
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/inquiries',
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
          },
          error: null,
        })
      ),
    },
  }),
}));

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any;

describe('Inquiries List Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it.skip('should display inquiry list with filters', async () => {
    const mockInquiries = [
      {
        id: 'inq-1',
        product_id: 'prod-1',
        user_id: 'user-1',
        category: 'product',
        title: '상품 사이즈 문의',
        content: '사이즈가 어떻게 되나요?',
        is_private: false,
        status: 'pending',
        answer: null,
        answered_by: null,
        answered_at: null,
        view_count: 5,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        author: {
          id: 'user-1',
          email: 'user1@test.com',
          nickname: '사용자1',
          avatar_url: null,
        },
        product: {
          id: 'prod-1',
          name: '테스트 상품',
          slug: 'test-product',
          thumbnail_url: '/test.jpg',
        },
      },
      {
        id: 'inq-2',
        product_id: 'prod-2',
        user_id: 'user-2',
        category: 'shipping',
        title: '배송 문의',
        content: '배송은 언제 되나요?',
        is_private: true,
        status: 'answered',
        answer: '2-3일 소요됩니다.',
        answered_by: 'admin-1',
        answered_at: '2024-01-21T10:00:00Z',
        view_count: 10,
        created_at: '2024-01-19T10:00:00Z',
        updated_at: '2024-01-21T10:00:00Z',
        author: {
          id: 'user-2',
          email: 'user2@test.com',
          nickname: '사용자2',
          avatar_url: null,
        },
        product: {
          id: 'prod-2',
          name: '테스트 상품2',
          slug: 'test-product-2',
          thumbnail_url: '/test2.jpg',
        },
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      }),
    });

    const InquiriesPage = (await import('@/app/(shop)/inquiries/page')).default;
    render(await InquiriesPage({ searchParams: {} }));

    await waitFor(() => {
      expect(screen.getByText('상품 사이즈 문의')).toBeInTheDocument();
      expect(screen.getByText('배송 문의')).toBeInTheDocument();
    });

    // Check status display (use getAllByText since there are filters with same text)
    const pendingBadges = screen.getAllByText('답변 대기');
    expect(pendingBadges.length).toBeGreaterThan(0);
    const answeredBadges = screen.getAllByText('답변 완료');
    expect(answeredBadges.length).toBeGreaterThan(0);

    // Check private icon
    const privateIcon = screen.getByLabelText('비밀글');
    expect(privateIcon).toBeInTheDocument();

    // Check view count
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('should filter inquiries by category', async () => {
    const mockInquiries = [
      {
        id: 'inq-1',
        product_id: 'prod-1',
        user_id: 'user-1',
        category: 'product',
        title: '상품 문의',
        content: '내용',
        is_private: false,
        status: 'pending',
        answer: null,
        answered_by: null,
        answered_at: null,
        view_count: 5,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        author: {
          id: 'user-1',
          email: 'user1@test.com',
          nickname: '사용자1',
          avatar_url: null,
        },
        product: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });

    const InquiriesPage = (await import('@/app/(shop)/inquiries/page')).default;
    render(await InquiriesPage({ searchParams: { category: 'product' } }));

    await waitFor(() => {
      expect(screen.getByText('상품 문의')).toBeInTheDocument();
    });
  });

  it('should filter inquiries by status', async () => {
    const mockInquiries = [
      {
        id: 'inq-1',
        product_id: 'prod-1',
        user_id: 'user-1',
        category: 'product',
        title: '미답변 문의',
        content: '내용',
        is_private: false,
        status: 'pending',
        answer: null,
        answered_by: null,
        answered_at: null,
        view_count: 5,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        author: {
          id: 'user-1',
          email: 'user1@test.com',
          nickname: '사용자1',
          avatar_url: null,
        },
        product: null,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });

    const InquiriesPage = (await import('@/app/(shop)/inquiries/page')).default;
    render(await InquiriesPage({ searchParams: { status: 'pending' } }));

    await waitFor(() => {
      expect(screen.getByText('미답변 문의')).toBeInTheDocument();
      // Check that there are "답변 대기" badges (multiple may exist due to filters)
      const pendingBadges = screen.getAllByText('답변 대기');
      expect(pendingBadges.length).toBeGreaterThan(0);
    });
  });
});

describe('Inquiry Detail Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should display inquiry details with answer', async () => {
    const mockInquiry = {
      id: 'inq-1',
      product_id: 'prod-1',
      user_id: 'user-1',
      category: 'product',
      title: '상품 사이즈 문의',
      content: '사이즈가 어떻게 되나요?',
      is_private: false,
      status: 'answered',
      answer: '사이즈는 M, L, XL 세 가지입니다.',
      answered_by: 'admin-1',
      answered_at: '2024-01-21T10:00:00Z',
      view_count: 15,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-21T10:00:00Z',
      author: {
        id: 'user-1',
        email: 'user1@test.com',
        nickname: '사용자1',
        avatar_url: null,
      },
      product: {
        id: 'prod-1',
        name: '테스트 상품',
        slug: 'test-product',
        thumbnail_url: '/test.jpg',
      },
      answerer: {
        id: 'admin-1',
        email: 'admin@test.com',
        nickname: '관리자',
        avatar_url: null,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inquiry: mockInquiry }),
    });

    const InquiryDetailPage = (await import('@/app/(shop)/inquiries/[id]/page')).default;
    render(await InquiryDetailPage({ params: { id: 'inq-1' } }));

    await waitFor(() => {
      expect(screen.getByText('상품 사이즈 문의')).toBeInTheDocument();
      expect(screen.getByText('사이즈가 어떻게 되나요?')).toBeInTheDocument();
      expect(screen.getByText('사이즈는 M, L, XL 세 가지입니다.')).toBeInTheDocument();
      expect(screen.getByText('답변 완료')).toBeInTheDocument();
    });

    // Check view count
    expect(screen.getByText(/15/)).toBeInTheDocument();

    // Check author info
    expect(screen.getByText('사용자1')).toBeInTheDocument();
  });

  it('should display pending status when no answer', async () => {
    const mockInquiry = {
      id: 'inq-1',
      product_id: 'prod-1',
      user_id: 'user-1',
      category: 'product',
      title: '배송 문의',
      content: '언제 배송되나요?',
      is_private: false,
      status: 'pending',
      answer: null,
      answered_by: null,
      answered_at: null,
      view_count: 5,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      author: {
        id: 'user-1',
        email: 'user1@test.com',
        nickname: '사용자1',
        avatar_url: null,
      },
      product: {
        id: 'prod-1',
        name: '테스트 상품',
        slug: 'test-product',
        thumbnail_url: '/test.jpg',
      },
      answerer: null,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inquiry: mockInquiry }),
    });

    const InquiryDetailPage = (await import('@/app/(shop)/inquiries/[id]/page')).default;
    render(await InquiryDetailPage({ params: { id: 'inq-1' } }));

    await waitFor(() => {
      expect(screen.getByText('배송 문의')).toBeInTheDocument();
      expect(screen.getByText('답변 대기')).toBeInTheDocument();
    });

    // Should not display answer section
    expect(screen.queryByText('답변')).not.toBeInTheDocument();
  });
});

describe('Inquiry Creation Form', () => {
  it.skip('should submit inquiry form with private option', async () => {
    const user = userEvent.setup();

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [
            {
              id: 'prod-1',
              name: '테스트 상품',
              slug: 'test-product',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          inquiry: {
            id: 'inq-new',
            product_id: 'prod-1',
            category: 'product',
            title: '새 문의',
            content: '문의 내용입니다.',
            is_private: true,
            status: 'pending',
          },
        }),
      });

    const InquiryNewPage = (await import('@/app/(shop)/inquiries/new/page')).default;
    render(await InquiryNewPage({ searchParams: {} }));

    await waitFor(() => {
      expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/제목/), '새 문의');
    await user.type(screen.getByLabelText(/내용/), '문의 내용입니다.');

    // Check private option
    const privateCheckbox = screen.getByLabelText(/비밀글/);
    await user.click(privateCheckbox);

    // Submit
    const submitButton = screen.getByRole('button', { name: /작성/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inquiries'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"is_private":true'),
        })
      );
    });
  });

  it.skip('should validate form inputs', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [] }),
    });

    const InquiryNewPage = (await import('@/app/(shop)/inquiries/new/page')).default;
    render(await InquiryNewPage({ searchParams: {} }));

    await waitFor(() => {
      expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    });

    // Try to submit without filling
    const submitButton = screen.getByRole('button', { name: /작성/ });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/제목을 입력해주세요/)).toBeInTheDocument();
    });
  });
});
