/**
 * @TASK P6-T6.8 - UpgradeBanner 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpgradeBanner } from '../UpgradeBanner';
import * as subscriptionHook from '@/hooks/useSubscription';
import * as bannerDismissHook from '@/hooks/useBannerDismiss';

// Mock hooks
vi.mock('@/hooks/useSubscription');
vi.mock('@/hooks/useBannerDismiss');

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UpgradeBanner', () => {
  const mockDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Free 플랜 사용자
    vi.mocked(subscriptionHook.useSubscription).mockReturnValue({
      isFree: true,
      isLoading: false,
      isPro: false,
      isBusiness: false,
      canUpgrade: true,
      isCanceling: false,
      subscription: null,
      planLimits: null,
      usage: null,
      isActive: false,
      daysUntilExpiry: null,
      currentPlan: 'free',
      error: null,
      refetch: vi.fn(),
      upgrade: vi.fn(),
      cancel: vi.fn(),
      reactivate: vi.fn(),
    });

    // Default: 배너 표시
    vi.mocked(bannerDismissHook.useBannerDismiss).mockReturnValue({
      isDismissed: false,
      dismiss: mockDismiss,
      reset: vi.fn(),
    });
  });

  describe('기본 동작', () => {
    it('Free 플랜 사용자에게 배너가 표시된다', () => {
      render(<UpgradeBanner />);

      expect(screen.getByText(/Pro 플랜으로 업그레이드/i)).toBeInTheDocument();
      expect(screen.getByText(/무제한 가이드북/i)).toBeInTheDocument();
    });

    it('Pro 플랜 사용자에게는 배너가 표시되지 않는다', () => {
      vi.mocked(subscriptionHook.useSubscription).mockReturnValue({
        isFree: false,
        isPro: true,
        isBusiness: false,
        isLoading: false,
        canUpgrade: true,
        isCanceling: false,
        subscription: null,
        planLimits: null,
        usage: null,
        isActive: true,
        daysUntilExpiry: null,
        currentPlan: 'pro',
        error: null,
        refetch: vi.fn(),
        upgrade: vi.fn(),
        cancel: vi.fn(),
        reactivate: vi.fn(),
      });

      const { container } = render(<UpgradeBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('로딩 중일 때는 배너가 표시되지 않는다', () => {
      vi.mocked(subscriptionHook.useSubscription).mockReturnValue({
        isFree: true,
        isLoading: true,
        isPro: false,
        isBusiness: false,
        canUpgrade: true,
        isCanceling: false,
        subscription: null,
        planLimits: null,
        usage: null,
        isActive: false,
        daysUntilExpiry: null,
        currentPlan: 'free',
        error: null,
        refetch: vi.fn(),
        upgrade: vi.fn(),
        cancel: vi.fn(),
        reactivate: vi.fn(),
      });

      const { container } = render(<UpgradeBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('닫기 기능', () => {
    it('dismissable=true일 때 닫기 버튼이 표시된다', () => {
      render(<UpgradeBanner dismissable />);

      const closeButton = screen.getByLabelText('배너 닫기');
      expect(closeButton).toBeInTheDocument();
    });

    it('dismissable=false일 때 닫기 버튼이 표시되지 않는다', () => {
      render(<UpgradeBanner dismissable={false} />);

      const closeButton = screen.queryByLabelText('배너 닫기');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 dismiss 함수가 호출된다', () => {
      render(<UpgradeBanner dismissable />);

      const closeButton = screen.getByLabelText('배너 닫기');
      fireEvent.click(closeButton);

      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });

    it('이미 닫힌 배너는 표시되지 않는다', () => {
      vi.mocked(bannerDismissHook.useBannerDismiss).mockReturnValue({
        isDismissed: true,
        dismiss: mockDismiss,
        reset: vi.fn(),
      });

      const { container } = render(<UpgradeBanner dismissable />);
      expect(container.firstChild).toBeNull();
    });

    it('dismissable=false일 때는 isDismissed 상태를 무시한다', () => {
      vi.mocked(bannerDismissHook.useBannerDismiss).mockReturnValue({
        isDismissed: true,
        dismiss: mockDismiss,
        reset: vi.fn(),
      });

      render(<UpgradeBanner dismissable={false} />);
      expect(screen.getByText(/Pro 플랜으로 업그레이드/i)).toBeInTheDocument();
    });
  });

  describe('variant 속성', () => {
    it('variant=default일 때 전체 배너가 표시된다', () => {
      render(<UpgradeBanner variant="default" />);

      expect(screen.getByText(/Pro 플랜으로 업그레이드/i)).toBeInTheDocument();
      expect(screen.getByText(/무제한 가이드북/i)).toBeInTheDocument();
      expect(screen.getByText(/AI 생성 30회\/월/i)).toBeInTheDocument();
    });

    it('variant=compact일 때 간단한 배너가 표시된다', () => {
      render(<UpgradeBanner variant="compact" />);

      expect(screen.getByText(/Pro로 업그레이드/i)).toBeInTheDocument();
      expect(screen.getByText(/더 많은 기능 사용/i)).toBeInTheDocument();
    });

    it('variant=sidebar일 때 사이드바 배너가 표시된다', () => {
      render(<UpgradeBanner variant="sidebar" />);

      expect(screen.getByText(/Pro 플랜/i)).toBeInTheDocument();
      expect(screen.getByText(/무제한 가이드북과 고급 기능을 사용해보세요/i)).toBeInTheDocument();
    });

    it('sidebar variant는 닫기 버튼이 없다', () => {
      render(<UpgradeBanner variant="sidebar" dismissable />);

      const closeButton = screen.queryByLabelText('배너 닫기');
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  describe('CTA 링크', () => {
    it('업그레이드 버튼이 /settings/billing로 연결된다', () => {
      render(<UpgradeBanner />);

      const upgradeButton = screen.getByText('업그레이드');
      expect(upgradeButton).toHaveAttribute('href', '/settings/billing');
    });
  });

  describe('접근성', () => {
    it('닫기 버튼에 aria-label이 있다', () => {
      render(<UpgradeBanner dismissable />);

      const closeButton = screen.getByLabelText('배너 닫기');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
