// @TASK P8-S5-T1 - 대시보드 통계 카드 테스트
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('제목과 값을 표시해야 함', () => {
    render(
      <StatCard
        title="총 가이드북"
        value="5"
        description="생성된 가이드북"
        icon="book"
      />
    );

    expect(screen.getByText('총 가이드북')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('생성된 가이드북')).toBeInTheDocument();
  });

  it('변화량(trend)이 있을 때 표시해야 함', () => {
    render(
      <StatCard
        title="총 조회수"
        value="1,234"
        description="누적 조회수"
        icon="eye"
        trend={{ value: 12.5, label: '지난주 대비' }}
      />
    );

    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
    expect(screen.getByText('지난주 대비')).toBeInTheDocument();
  });

  it('AirBnB 스타일 그림자를 적용해야 함', () => {
    const { container } = render(
      <StatCard
        title="공개 중"
        value="3"
        description="게스트에게 공개"
        icon="globe"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-airbnb-sm');
  });

  it('rounded-xl 모서리를 적용해야 함', () => {
    const { container } = render(
      <StatCard
        title="플랜"
        value="Free"
        description="업그레이드 가능"
        icon="star"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-xl');
  });

  it('호버 효과를 가져야 함', () => {
    const { container } = render(
      <StatCard
        title="이번 달"
        value="456"
        description="이번 달 조회수"
        icon="calendar"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:shadow-airbnb-md');
  });
});
