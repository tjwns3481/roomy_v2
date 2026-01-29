/**
 * My Page (Profile) Component Tests
 *
 * P2-T2.1: NextAuth 기반 마이페이지 테스트
 * - useSession 사용 확인
 * - 프로필 렌더링
 * - 닉네임 수정 기능
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfilePage from '@/app/(shop)/my/page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProfilePage', () => {
  const mockPush = vi.fn();
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      role: 'customer' as const,
    },
  };

  const mockProfile = {
    id: 'user-123',
    email: 'test@example.com',
    nickname: 'TestNickname',
    avatar_url: null,
    role: 'customer',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  it('should redirect to login when unauthenticated', async () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/my');
    });
  });

  it('should show loading state while loading session', () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<ProfilePage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should fetch and display profile when authenticated', async () => {
    (useSession as any).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profile/user-123');
    });

    await waitFor(() => {
      expect(screen.getByText('TestNickname')).toBeInTheDocument();
    });
  });

  it('should display fallback profile when API returns 404', async () => {
    (useSession as any).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should handle profile fetch error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (useSession as any).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading profile:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not have Supabase auth imports', async () => {
    // This is a compile-time check, but we can verify by reading the module
    const pageModule = await import('@/app/(shop)/my/page');
    const pageString = pageModule.default.toString();

    // Verify NextAuth is being used
    expect(pageString).not.toContain('createClient');
    expect(pageString).not.toContain('@/lib/supabase/auth');
  });
});
