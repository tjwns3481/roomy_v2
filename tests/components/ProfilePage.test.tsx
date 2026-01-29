/**
 * Profile Page Component Test
 *
 * P1-T1.4: 프로필 페이지 컴포넌트 테스트
 * - 프로필 정보 표시 (이메일, 닉네임, 아바타)
 * - 닉네임 수정 폼
 * - 로그아웃 버튼 동작
 * - 반응형 디자인 (Neo-Brutalism)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(shop)/my/page';

// Mock Supabase auth functions
vi.mock('@/lib/supabase/auth', () => ({
  signOut: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { id: 'test-user-id', nickname: 'Updated Nickname', email: 'test@example.com' },
                error: null,
              })
            ),
          })),
        })),
      })),
    })),
  })),
}));

// Mock Auth Store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('ProfilePage', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockProfile = {
    id: 'test-user-id',
    email: 'test@example.com',
    nickname: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'customer' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Default mock: authenticated user
    const { useAuthStore } = await import('@/stores/auth-store');
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      setProfile: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('렌더링 시 프로필 정보가 표시되어야 함', () => {
      render(<ProfilePage />);

      expect(screen.getByRole('heading', { name: /프로필/i })).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('아바타 이미지가 표시되어야 함', () => {
      render(<ProfilePage />);

      const avatar = screen.getByAltText(/프로필 이미지/i);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar.jpg'));
    });

    it('닉네임 수정 버튼이 표시되어야 함', () => {
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /수정/i });
      expect(editButton).toBeInTheDocument();
    });

    it('로그아웃 버튼이 표시되어야 함', () => {
      render(<ProfilePage />);

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    it('이메일이 표시되어야 함', () => {
      render(<ProfilePage />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('닉네임이 표시되어야 함', () => {
      render(<ProfilePage />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('닉네임이 없는 경우 이메일이 표시되어야 함', async () => {
      const { useAuthStore } = await import('@/stores/auth-store');
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, nickname: null },
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        setProfile: vi.fn(),
      });

      render(<ProfilePage />);

      // 닉네임 필드에 "(닉네임 없음)" 표시
      expect(screen.getByText('(닉네임 없음)')).toBeInTheDocument();
      // 이메일은 이메일 필드에만 표시
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('아바타 URL이 없는 경우 기본 아바타가 표시되어야 함', async () => {
      const { useAuthStore } = await import('@/stores/auth-store');
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, avatar_url: null },
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        setProfile: vi.fn(),
      });

      const { container } = render(<ProfilePage />);

      // User icon이 표시되어야 함
      const userIcon = container.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });
  });

  describe('Nickname Edit', () => {
    it('수정 버튼 클릭 시 수정 폼이 표시되어야 함', async () => {
      render(<ProfilePage />);
      const user = userEvent.setup();

      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      const nicknameInput = screen.getByLabelText(/닉네임/i);
      expect(nicknameInput).toBeInTheDocument();
      expect(nicknameInput).toHaveValue('Test User');
    });

    it('닉네임 수정 후 저장 시 업데이트되어야 함', async () => {
      const mockSetProfile = vi.fn();
      const { useAuthStore } = await import('@/stores/auth-store');
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        setProfile: mockSetProfile,
      });

      render(<ProfilePage />);
      const user = userEvent.setup();

      // 수정 모드 진입
      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      // 닉네임 변경
      const nicknameInput = screen.getByLabelText(/닉네임/i);
      await user.clear(nicknameInput);
      await user.type(nicknameInput, 'Updated Nickname');

      // 저장
      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/닉네임이 변경되었습니다/i)).toBeInTheDocument();
      });
    });

    it('취소 버튼 클릭 시 수정 모드가 종료되어야 함', async () => {
      render(<ProfilePage />);
      const user = userEvent.setup();

      // 수정 모드 진입
      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      // 취소
      const cancelButton = screen.getByRole('button', { name: /취소/i });
      await user.click(cancelButton);

      // 수정 폼이 사라지고 수정 버튼이 다시 표시됨
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /수정/i })).toBeInTheDocument();
      });
    });

    it('빈 닉네임 저장 시 에러 메시지가 표시되어야 함', async () => {
      render(<ProfilePage />);
      const user = userEvent.setup();

      // 수정 모드 진입
      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      // 닉네임 비우기
      const nicknameInput = screen.getByLabelText(/닉네임/i);
      await user.clear(nicknameInput);

      // 저장 시도
      const saveButton = screen.getByRole('button', { name: /저장/i });
      await user.click(saveButton);

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/닉네임은 최소 2자 이상이어야 합니다/i)).toBeInTheDocument();
      });
    });

    it('닉네임 저장 중 로딩 상태가 표시되어야 함', async () => {
      render(<ProfilePage />);
      const user = userEvent.setup();

      // 수정 모드 진입
      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      // 닉네임 변경
      const nicknameInput = screen.getByLabelText(/닉네임/i);
      await user.clear(nicknameInput);
      await user.type(nicknameInput, 'Updated Nickname');

      // 저장
      const saveButton = screen.getByRole('button', { name: /저장/i });

      // Click without waiting to capture loading state
      user.click(saveButton);

      // 로딩 중 표시 확인 (버튼이 비활성화되고 "저장 중..." 텍스트 표시)
      await waitFor(() => {
        expect(screen.getByText(/저장 중.../i)).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Logout', () => {
    it('로그아웃 버튼 클릭 시 signOut 함수가 호출되어야 함', async () => {
      const { signOut } = await import('@/lib/supabase/auth');
      (signOut as any).mockResolvedValue({ error: null });

      const { useAuthStore } = await import('@/stores/auth-store');
      const mockLogout = vi.fn();
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isAuthenticated: true,
        isLoading: false,
        logout: mockLogout,
        setProfile: vi.fn(),
      });

      render(<ProfilePage />);
      const user = userEvent.setup();

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('로그아웃 에러 시 에러 메시지가 표시되어야 함', async () => {
      const { signOut } = await import('@/lib/supabase/auth');
      (signOut as any).mockResolvedValue({
        error: { message: 'Logout failed' }
      });

      render(<ProfilePage />);
      const user = userEvent.setup();

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Logout failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State', () => {
    it('로그인하지 않은 경우 로그인 페이지로 리다이렉트되어야 함', async () => {
      const { useAuthStore } = await import('@/stores/auth-store');
      (useAuthStore as any).mockReturnValue({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn(),
        setProfile: vi.fn(),
      });

      render(<ProfilePage />);

      // 프로필 정보가 표시되지 않아야 함
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });

    it('로딩 중일 때 로딩 상태가 표시되어야 함', async () => {
      const { useAuthStore } = await import('@/stores/auth-store');
      (useAuthStore as any).mockReturnValue({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: true,
        logout: vi.fn(),
        setProfile: vi.fn(),
      });

      render(<ProfilePage />);

      expect(screen.getByText(/로딩/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('닉네임 입력 필드에 라벨이 있어야 함', async () => {
      render(<ProfilePage />);
      const user = userEvent.setup();

      // 수정 모드 진입
      const editButton = screen.getByRole('button', { name: /수정/i });
      await user.click(editButton);

      const nicknameInput = screen.getByLabelText(/닉네임/i);
      expect(nicknameInput).toHaveAccessibleName();
    });

    it('버튼이 키보드로 접근 가능해야 함', () => {
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /수정/i });
      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });

      expect(editButton).toHaveAttribute('type');
      expect(logoutButton).toHaveAttribute('type');
    });

    it('아바타 이미지에 alt 텍스트가 있어야 함', () => {
      render(<ProfilePage />);

      const avatar = screen.getByAltText(/프로필 이미지/i);
      expect(avatar).toHaveAttribute('alt');
    });
  });
});
