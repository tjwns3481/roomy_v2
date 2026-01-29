/**
 * @TASK P6-T6.8 - LimitWarningBanner 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LimitWarningBanner } from '../LimitWarningBanner';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('LimitWarningBanner', () => {
  describe('표시 조건', () => {
    it('사용량 80% 미만이면 배너가 표시되지 않는다', () => {
      const { container } = render(
        <LimitWarningBanner type="guidebooks" current={0} limit={1} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('사용량 80% 이상이면 경고 배너가 표시된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={1} limit={1} />);
      expect(screen.getByText(/가이드북 생성 제한 도달/i)).toBeInTheDocument();
    });

    it('무제한(limit=-1)이면 배너가 표시되지 않는다', () => {
      const { container } = render(
        <LimitWarningBanner type="guidebooks" current={100} limit={-1} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('가이드북 제한 경고', () => {
    it('100% 도달 시 제한 도달 메시지가 표시된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={1} limit={1} />);

      expect(screen.getByText(/가이드북 생성 제한 도달/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Free 플랜에서는 최대 1개의 가이드북을 만들 수 있습니다/i)
      ).toBeInTheDocument();
    });

    it('80~99% 사용 시 경고 메시지가 표시된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={4} limit={5} />);

      expect(screen.getByText(/가이드북 생성 제한에 근접했습니다/i)).toBeInTheDocument();
    });

    it('진행 바가 정확한 비율로 표시된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={4} limit={5} />);

      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('4 / 5 사용 중')).toBeInTheDocument();
    });
  });

  describe('AI 생성 제한 경고', () => {
    it('100% 도달 시 AI 제한 도달 메시지가 표시된다', () => {
      render(<LimitWarningBanner type="ai" current={3} limit={3} />);

      expect(screen.getByText(/AI 생성 제한 도달/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Free 플랜에서는 이번 달 3회의 AI 생성을 사용할 수 있습니다/i)
      ).toBeInTheDocument();
    });

    it('80~99% 사용 시 AI 경고 메시지가 표시된다', () => {
      render(<LimitWarningBanner type="ai" current={25} limit={30} />);

      expect(screen.getByText(/AI 생성 제한에 근접했습니다/i)).toBeInTheDocument();
    });

    it('진행 바가 정확한 비율로 표시된다', () => {
      render(<LimitWarningBanner type="ai" current={27} limit={30} />);

      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('27 / 30 사용 중')).toBeInTheDocument();
    });
  });

  describe('배너 스타일', () => {
    it('100% 도달 시 빨간색(critical) 스타일이 적용된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={5} limit={5} />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('80~99% 사용 시 노란색(warning) 스타일이 적용된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={4} limit={5} />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });
  });

  describe('CTA 버튼', () => {
    it('업그레이드 버튼이 /settings/billing로 연결된다', () => {
      render(<LimitWarningBanner type="guidebooks" current={1} limit={1} />);

      const upgradeButton = screen.getByText('Pro로 업그레이드');
      expect(upgradeButton).toHaveAttribute('href', '/settings/billing');
    });
  });

  describe('접근성', () => {
    it('배너에 role="alert"가 있다', () => {
      render(<LimitWarningBanner type="guidebooks" current={1} limit={1} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
