import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '@/app/admin/page';

// Mock Supabase server
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(async () => ({
    from: vi.fn((table: string) => ({
      select: vi.fn((columns: string) => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/admin',
  redirect: vi.fn(),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('should render dashboard title and description', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('대시보드')).toBeInTheDocument();
      expect(
        screen.getByText(/Vibe Store 관리자 대시보드에 오신 것을 환영합니다/)
      ).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<AdminDashboard />);

      // Should show loading indicators
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    });

    it('should render stats grid layout', () => {
      render(<AdminDashboard />);

      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toBeInTheDocument();
      expect(statsGrid.className).toContain('grid');
    });

    it('should render skeleton cards while loading', () => {
      render(<AdminDashboard />);

      const skeletons = screen.getAllByTestId('dashboard-loading');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper heading hierarchy', () => {
      render(<AdminDashboard />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('대시보드');
    });

    it('should be wrapped in a container div', () => {
      const { container } = render(<AdminDashboard />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', () => {
      render(<AdminDashboard />);

      // Check main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check that content is present
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    });
  });
});
