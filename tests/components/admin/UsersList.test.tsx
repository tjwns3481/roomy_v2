import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersList from '@/components/admin/users-list';
import type { AdminUser } from '@/types/admin';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('UsersList Component', () => {
  const mockUsers: AdminUser[] = [
    {
      id: '1',
      email: 'test@example.com',
      nickname: 'Test User',
      avatar_url: null,
      role: 'user',
      grade: 'bronze',
      points: 100,
      total_order_amount: 50000,
      is_blocked: false,
      blocked_reason: null,
      blocked_at: null,
      last_login_at: '2024-01-20T10:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  const mockFilters = {
    search: '',
    grade: '',
    isBlocked: '',
    sort: 'newest',
  };

  it('renders user list correctly', () => {
    render(
      <UsersList
        users={mockUsers}
        pagination={mockPagination}
        filters={mockFilters}
      />
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(
      <UsersList users={[]} pagination={mockPagination} filters={mockFilters} />
    );

    expect(screen.getByText('등록된 사용자가 없습니다.')).toBeInTheDocument();
  });

  it('displays user stats correctly', () => {
    render(
      <UsersList
        users={mockUsers}
        pagination={mockPagination}
        filters={mockFilters}
      />
    );

    // Check if currency and points are formatted
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
    expect(screen.getByText('100P')).toBeInTheDocument();
  });

  it('shows total count in summary', () => {
    render(
      <UsersList
        users={mockUsers}
        pagination={mockPagination}
        filters={mockFilters}
      />
    );

    expect(screen.getByText('총 1명의 사용자')).toBeInTheDocument();
  });
});
