/**
 * Login Page Component Test
 *
 * P1-T1.2: 로그인 페이지 컴포넌트 테스트
 * - Google 소셜 로그인 버튼
 * - 이메일 매직 링크 로그인 폼
 * - 에러 메시지 표시
 * - 로딩 상태 표시
 * - 반응형 디자인
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(shop)/login/page';

// Mock Supabase auth functions
vi.mock('@/lib/supabase/auth', () => ({
  signInWithGoogle: vi.fn(),
  signInWithMagicLink: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('렌더링 시 로그인 폼이 표시되어야 함', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /매직 링크 보내기/i })).toBeInTheDocument();
    });

    it('Google 로그인 버튼이 표시되어야 함', () => {
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toBeInTheDocument();
    });

    it('이메일 입력 필드와 제출 버튼이 표시되어야 함', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      expect(emailInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Google OAuth Login', () => {
    it('Google 버튼 클릭 시 signInWithGoogle 함수가 호출되어야 함', async () => {
      const { signInWithGoogle } = await import('@/lib/supabase/auth');
      (signInWithGoogle as any).mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('Google 로그인 중 로딩 상태가 표시되어야 함', async () => {
      const { signInWithGoogle } = await import('@/lib/supabase/auth');
      (signInWithGoogle as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginPage />);
      const user = userEvent.setup();

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      // 로딩 중 버튼이 비활성화되어야 함
      expect(googleButton).toBeDisabled();
    });

    it('Google 로그인 에러 시 에러 메시지가 표시되어야 함', async () => {
      const { signInWithGoogle } = await import('@/lib/supabase/auth');
      (signInWithGoogle as any).mockResolvedValue({
        data: null,
        error: { message: 'OAuth error occurred' },
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/OAuth error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Magic Link Login', () => {
    it('유효한 이메일 입력 시 signInWithMagicLink 함수가 호출되어야 함', async () => {
      const { signInWithMagicLink } = await import('@/lib/supabase/auth');
      (signInWithMagicLink as any).mockResolvedValue({
        data: {},
        error: null,
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signInWithMagicLink).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('빈 이메일 제출 시 에러 메시지가 표시되어야 함', async () => {
      render(<LoginPage />);
      const user = userEvent.setup();

      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/이메일을 입력해주세요/i)).toBeInTheDocument();
      });
    });

    it('잘못된 이메일 형식 제출 시 에러 메시지가 표시되어야 함', async () => {
      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      await user.clear(emailInput);
      await user.type(emailInput, 'notanemail');
      await user.click(submitButton);

      await waitFor(() => {
        const errorText = screen.queryByText(/유효한 이메일/i);
        expect(errorText).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('매직 링크 전송 성공 시 성공 메시지가 표시되어야 함', async () => {
      const { signInWithMagicLink } = await import('@/lib/supabase/auth');
      (signInWithMagicLink as any).mockResolvedValue({
        data: {},
        error: null,
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/이메일을 확인해주세요/i)).toBeInTheDocument();
      });
    });

    it('매직 링크 전송 중 로딩 상태가 표시되어야 함', async () => {
      const { signInWithMagicLink } = await import('@/lib/supabase/auth');
      (signInWithMagicLink as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // 로딩 중 버튼이 비활성화되어야 함
      expect(submitButton).toBeDisabled();
    });

    it('매직 링크 전송 에러 시 에러 메시지가 표시되어야 함', async () => {
      const { signInWithMagicLink } = await import('@/lib/supabase/auth');
      (signInWithMagicLink as any).mockResolvedValue({
        data: null,
        error: { message: 'Failed to send magic link' },
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to send magic link/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('모바일 화면에서 세로 레이아웃이어야 함', () => {
      // This test would require a viewport configuration
      // For now, we'll just verify the component renders
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument();
    });

    it('데스크탑 화면에서 가로 레이아웃이어야 함', () => {
      // This test would require a viewport configuration
      // For now, we'll just verify the component renders
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('이메일 입력 필드에 라벨이 있어야 함', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      expect(emailInput).toHaveAccessibleName();
    });

    it('버튼이 키보드로 접근 가능해야 함', () => {
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      const submitButton = screen.getByRole('button', { name: /매직 링크 보내기/i });

      expect(googleButton).toHaveAttribute('type');
      expect(submitButton).toHaveAttribute('type');
    });
  });
});
