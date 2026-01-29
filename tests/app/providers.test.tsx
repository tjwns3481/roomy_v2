/**
 * SessionProvider 통합 테스트
 * P1-T1.5: NextAuth SessionProvider 설정
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Providers } from '@/app/providers';
import { useSession } from 'next-auth/react';

// next-auth/react 모킹
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
  useSession: vi.fn(),
}));

describe('Providers Component', () => {
  it('SessionProvider로 children을 감싸야 함', () => {
    render(
      <Providers>
        <div data-testid="child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('SessionProvider 내부에서 useSession 사용 가능', () => {
    // Mock useSession to return a session
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'customer',
        },
        expires: '2099-01-01',
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    function TestComponent() {
      const { data: session } = useSession();
      return <div data-testid="session-email">{session?.user?.email}</div>;
    }

    render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(screen.getByTestId('session-email')).toHaveTextContent(
      'test@example.com'
    );
  });

  it('SessionProvider 내부에서 비인증 상태 처리', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    function TestComponent() {
      const { data: session, status } = useSession();
      return (
        <div data-testid="session-status">
          {status === 'unauthenticated' ? '로그인 필요' : session?.user?.email}
        </div>
      );
    }

    render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(screen.getByTestId('session-status')).toHaveTextContent(
      '로그인 필요'
    );
  });
});
