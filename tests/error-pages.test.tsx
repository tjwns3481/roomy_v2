// @TASK P7-T7.5 - 에러 페이지 테스트
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorLayout } from '@/components/error/error-layout';

describe('ErrorLayout', () => {
  it('타이틀과 설명을 렌더링한다', () => {
    render(
      <ErrorLayout
        title="테스트 에러"
        description="테스트 설명입니다"
      />
    );

    expect(screen.getByText('테스트 에러')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명입니다')).toBeInTheDocument();
  });

  it('기본 이모지를 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
      />
    );

    expect(screen.getByText('😕')).toBeInTheDocument();
  });

  it('커스텀 이모지를 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
        emoji="🚨"
      />
    );

    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('홈 버튼을 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
        showHomeButton
      />
    );

    expect(screen.getByText('🏠 홈으로 이동')).toBeInTheDocument();
  });

  it('대시보드 버튼을 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
        showDashboardButton
      />
    );

    expect(screen.getByText('📊 대시보드로 이동')).toBeInTheDocument();
  });

  it('버튼을 숨길 수 있다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
        showHomeButton={false}
        showDashboardButton={false}
      />
    );

    expect(screen.queryByText('🏠 홈으로 이동')).not.toBeInTheDocument();
    expect(screen.queryByText('📊 대시보드로 이동')).not.toBeInTheDocument();
  });

  it('children을 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
      >
        <div>커스텀 콘텐츠</div>
      </ErrorLayout>
    );

    expect(screen.getByText('커스텀 콘텐츠')).toBeInTheDocument();
  });

  it('지원 이메일 링크를 렌더링한다', () => {
    render(
      <ErrorLayout
        title="에러"
        description="설명"
      />
    );

    const emailLink = screen.getByText('support@roomy.kr');
    expect(emailLink).toHaveAttribute('href', 'mailto:support@roomy.kr');
  });
});

describe('404 Not Found 페이지', () => {
  it('추천 페이지 링크를 포함한다', async () => {
    // 동적 import를 사용하여 not-found.tsx를 테스트
    const NotFoundModule = await import('@/app/not-found');
    const NotFound = NotFoundModule.default;

    render(<NotFound />);

    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});
