/**
 * Downloads Page Test
 *
 * P3-T3.6: 다운로드 센터 페이지
 * - 구매한 상품 파일 목록 표시
 * - 다운로드 버튼, 남은 횟수/기간 표시
 * - 만료된 다운로드 비활성화
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadsPage from '@/app/(shop)/my/downloads/page';
import * as supabaseServer from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('DownloadsPage', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createServerClient as any).mockResolvedValue(mockSupabase);
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Mock from to prevent errors after redirect
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      await DownloadsPage();

      expect(redirect).toHaveBeenCalledWith('/login?redirect=/my/downloads');
    });

    it('should render page when authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      expect(container).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no downloads', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      expect(container.textContent).toContain('다운로드 가능한 파일이 없습니다');
    });
  });

  describe('Downloads List', () => {
    const mockDownloads = [
      {
        id: 'download-1',
        download_count: 1,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
        product_file: {
          id: 'file-1',
          file_name: 'awesome-ebook.pdf',
          file_size: 1024 * 1024 * 5, // 5MB
          download_limit: 5,
          product: {
            name: 'Awesome E-book',
            thumbnail_url: 'https://example.com/thumb.jpg',
          },
        },
      },
      {
        id: 'download-2',
        download_count: 3,
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days later
        product_file: {
          id: 'file-2',
          file_name: 'premium-video.mp4',
          file_size: 1024 * 1024 * 100, // 100MB
          download_limit: 3,
          product: {
            name: 'Premium Video Course',
            thumbnail_url: null,
          },
        },
      },
    ];

    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });
    });

    it('should display downloads list with correct information', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockDownloads,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Check product names
      expect(container.textContent).toContain('Awesome E-book');
      expect(container.textContent).toContain('Premium Video Course');

      // Check file names
      expect(container.textContent).toContain('awesome-ebook.pdf');
      expect(container.textContent).toContain('premium-video.mp4');

      // Check file sizes
      expect(container.textContent).toContain('5.00 MB');
      expect(container.textContent).toContain('100.00 MB');
    });

    it('should display remaining download count', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockDownloads,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Download 1: used 1/5
      expect(container.textContent).toContain('1/5회');

      // Download 2: used 3/3
      expect(container.textContent).toContain('3/3회');
    });

    it('should display expiration dates', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockDownloads,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Should contain "까지" text indicating expiration date
      const expirationTexts = container.textContent?.match(/\d{4}-\d{2}-\d{2}까지/g);
      expect(expirationTexts).toBeTruthy();
    });

    it('should have download buttons for active downloads', async () => {
      const activeDownload = [mockDownloads[0]]; // Only first one (not expired, has remaining count)

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: activeDownload,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Should have download link
      const downloadLink = container.querySelector('a[href*="/api/downloads/"]');
      expect(downloadLink).toBeTruthy();
    });
  });

  describe('Expired Downloads', () => {
    it('should disable download button when expired', async () => {
      const expiredDownload = [
        {
          id: 'download-expired',
          download_count: 1,
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          product_file: {
            id: 'file-expired',
            file_name: 'expired.pdf',
            file_size: 1024 * 1024,
            download_limit: 5,
            product: {
              name: 'Expired Product',
              thumbnail_url: null,
            },
          },
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: expiredDownload,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Should show "만료됨" text
      expect(container.textContent).toContain('만료됨');

      // Download button should be disabled or not present
      const downloadLink = container.querySelector('a[href*="/api/downloads/download-expired"]');
      if (downloadLink) {
        expect(downloadLink.getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should disable download button when download count exceeded', async () => {
      const countExceededDownload = [
        {
          id: 'download-exceeded',
          download_count: 5,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          product_file: {
            id: 'file-exceeded',
            file_name: 'exceeded.pdf',
            file_size: 1024 * 1024,
            download_limit: 5,
            product: {
              name: 'Count Exceeded Product',
              thumbnail_url: null,
            },
          },
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: countExceededDownload,
              error: null,
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Should show "다운로드 횟수 초과" text
      expect(container.textContent).toContain('다운로드 횟수 초과');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const result = await DownloadsPage();
      const { container } = render(result);

      // Should show error message
      expect(container.textContent).toContain('오류가 발생했습니다');
    });
  });
});
