/**
 * Login Page Tests
 *
 * Tests for NextAuth-based login functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/auth/login/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('Login Page', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockSearchParams = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);

    // Default: no redirect parameter
    mockSearchParams.get.mockReturnValue(null);
  });

  describe('렌더링', () => {
    it('로그인 페이지가 렌더링됩니다', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
      expect(screen.getByText('Vibe Store에 오신 것을 환영합니다')).toBeInTheDocument();
    });

    it('이메일 입력 필드가 표시됩니다', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('비밀번호 입력 필드가 표시됩니다', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('비밀번호');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('로그인 버튼이 표시됩니다', () => {
      render(<LoginPage />);

      const loginButton = screen.getByRole('button', { name: /로그인$/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('회원가입 링크가 표시됩니다', () => {
      render(<LoginPage />);

      const signupLink = screen.getByRole('link', { name: /회원가입/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('유효성 검사', () => {
    it('이메일이 비어있으면 에러 메시지를 표시합니다', async () => {
      render(<LoginPage />);

      const loginButton = screen.getByRole('button', { name: /로그인$/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
      });

      // signIn이 호출되지 않아야 합니다
      expect(signIn).not.toHaveBeenCalled();
    });

    it('비밀번호가 비어있으면 에러 메시지를 표시합니다', async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const loginButton = screen.getByRole('button', { name: /로그인$/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
      });

      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('로그인 프로세스', () => {
    it('올바른 정보로 로그인하면 signIn이 호출됩니다', async () => {
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('로그인 성공 시 홈으로 리다이렉트됩니다', async () => {
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('callbackUrl이 있으면 해당 URL로 리다이렉트됩니다', async () => {
      mockSearchParams.get.mockReturnValue('/my/downloads');

      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/my/downloads');
      });
    });

    it('로그인 실패 시 에러 메시지를 표시합니다', async () => {
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: 'CredentialsSignin',
        status: 401,
        ok: false,
        url: null,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인$/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeInTheDocument();
      });

      // 리다이렉트되지 않아야 합니다
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('UI 인터랙션', () => {
    it('비밀번호 표시/숨김 버튼이 작동합니다', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      // 비밀번호 표시 버튼 클릭
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(
        (btn) => btn.querySelector('svg') && btn.type === 'button'
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');

        // 다시 숨김
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
      }
    });

    it('로그인 중에는 버튼이 비활성화됩니다', async () => {
      (signIn as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const loginButton = screen.getByRole('button', { name: /로그인$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // 로그인 중 버튼 비활성화 확인
      await waitFor(() => {
        expect(loginButton).toBeDisabled();
        expect(screen.getByText('로그인 중...')).toBeInTheDocument();
      });
    });
  });
});
