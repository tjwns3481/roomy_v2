/**
 * P4-T4.6: 관리자 상품 관리 페이지 테스트
 *
 * 테스트 범위:
 * 1. 상품 목록 조회 및 표시
 * 2. 상품 검색 및 필터링
 * 3. 상품 생성 폼
 * 4. 상품 수정 폼
 * 5. 상품 상태 변경 (draft/active/hidden)
 * 6. 이미지 및 파일 업로드
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminProductsPage from '@/app/admin/products/page';
import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

describe('AdminProductsPage', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Next.js 쇼핑몰 템플릿',
      slug: 'nextjs-shop-template',
      price: 49000,
      discount_price: null,
      status: 'active',
      is_featured: true,
      category: {
        id: 'cat1',
        name: '템플릿',
        slug: 'templates',
      },
      created_at: '2026-01-20T00:00:00Z',
      sales_count: 15,
    },
    {
      id: '2',
      name: 'React 컴포넌트 라이브러리',
      slug: 'react-component-library',
      price: 89000,
      discount_price: 69000,
      status: 'draft',
      is_featured: false,
      category: {
        id: 'cat2',
        name: '라이브러리',
        slug: 'libraries',
      },
      created_at: '2026-01-21T00:00:00Z',
      sales_count: 0,
    },
  ];

  const mockCategories = [
    { id: 'cat1', name: '템플릿', slug: 'templates' },
    { id: 'cat2', name: '라이브러리', slug: 'libraries' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('상품 목록 조회', () => {
    it('상품 목록을 로드하고 표시한다', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockProducts,
            error: null,
            count: 2,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        expect(screen.getByText('Next.js 쇼핑몰 템플릿')).toBeInTheDocument();
        expect(screen.getByText('React 컴포넌트 라이브러리')).toBeInTheDocument();
      });
    });

    it('상품 상태 배지를 올바르게 표시한다', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockProducts,
            error: null,
            count: 2,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        expect(screen.getByText('판매 중')).toBeInTheDocument(); // active
        expect(screen.getByText('임시 저장')).toBeInTheDocument(); // draft
      });
    });

    it('할인가가 있는 경우 원가에 취소선을 표시한다', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockProducts,
            error: null,
            count: 2,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        // 할인가가 있는 상품
        const discountedProduct = screen.getByText('React 컴포넌트 라이브러리').closest('tr');
        expect(discountedProduct).toHaveTextContent('₩89,000');
        expect(discountedProduct).toHaveTextContent('₩69,000');
      });
    });
  });

  describe('상품 검색 및 필터링', () => {
    it('검색어로 상품을 필터링한다', async () => {
      const user = userEvent.setup();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [mockProducts[0]],
            error: null,
            count: 1,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, 'Next.js');

      await waitFor(() => {
        expect(screen.getByText('Next.js 쇼핑몰 템플릿')).toBeInTheDocument();
        expect(screen.queryByText('React 컴포넌트 라이브러리')).not.toBeInTheDocument();
      });
    });

    it('상태별로 필터링한다', async () => {
      const user = userEvent.setup();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [mockProducts[1]],
            error: null,
            count: 1,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      const statusSelect = screen.getByLabelText(/상태/i);
      await user.selectOptions(statusSelect, 'draft');

      await waitFor(() => {
        expect(screen.getByText('React 컴포넌트 라이브러리')).toBeInTheDocument();
        expect(screen.queryByText('Next.js 쇼핑몰 템플릿')).not.toBeInTheDocument();
      });
    });

    it('카테고리별로 필터링한다', async () => {
      const user = userEvent.setup();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [mockProducts[0]],
            error: null,
            count: 1,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      const categorySelect = screen.getByLabelText(/카테고리/i);
      await user.selectOptions(categorySelect, 'cat1');

      await waitFor(() => {
        expect(screen.getByText('Next.js 쇼핑몰 템플릿')).toBeInTheDocument();
        expect(screen.queryByText('React 컴포넌트 라이브러리')).not.toBeInTheDocument();
      });
    });
  });

  describe('상품 생성', () => {
    it('상품 생성 버튼을 클릭하면 생성 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const mockRouter = { push: vi.fn() };

      vi.mocked(useRouter).mockReturnValue(mockRouter as any);

      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      const createButton = screen.getByText(/상품 등록/i);
      await user.click(createButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/products/new');
    });
  });

  describe('상품 수정', () => {
    it('수정 버튼을 클릭하면 수정 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const mockRouter = { push: vi.fn() };

      vi.mocked(useRouter).mockReturnValue(mockRouter as any);

      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockProducts,
            error: null,
            count: 2,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        const editButtons = screen.getAllByText(/수정/i);
        expect(editButtons.length).toBeGreaterThan(0);
      });

      const editButtons = screen.getAllByText(/수정/i);
      await user.click(editButtons[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/products/1/edit');
    });
  });

  describe('상품 상태 변경', () => {
    it('상품 상태를 변경할 수 있다', async () => {
      const user = userEvent.setup();
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'products') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              update: mockUpdate,
              order: vi.fn().mockReturnThis(),
              range: vi.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
                count: 2,
              }),
            };
          }
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          };
        }),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        expect(screen.getByText('Next.js 쇼핑몰 템플릿')).toBeInTheDocument();
      });

      // 상태 변경 드롭다운 찾기
      const statusSelects = screen.getAllByRole('combobox');
      await user.selectOptions(statusSelects[0], 'hidden');

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ status: 'hidden' });
      });
    });
  });

  describe('권한 체크', () => {
    it('관리자가 아닌 경우 접근을 거부한다', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'user-id',
                user_metadata: { role: 'user' },
              },
            },
          }),
        },
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        expect(screen.getByText(/권한이 없습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('빈 상태', () => {
    it('상품이 없을 때 빈 상태를 표시한다', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().resolves({
            data: {
              user: {
                id: 'admin-id',
                user_metadata: { role: 'admin' },
              },
            },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        })),
      };

      (createServerClient as any).mockResolvedValue(mockSupabase);

      render(await AdminProductsPage({ searchParams: {} }));

      await waitFor(() => {
        expect(screen.getByText(/등록된 상품이 없습니다/i)).toBeInTheDocument();
      });
    });
  });
});
