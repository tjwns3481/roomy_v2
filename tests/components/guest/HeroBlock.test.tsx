// @TASK P8-S2-T1 - HeroBlock 테스트
// @SPEC specs/screens/guest-viewer.yaml

import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBlock } from '@/components/guest/blocks/HeroBlock';
import { HeroContent } from '@/types/block';

describe('HeroBlock (AirBnB Style)', () => {
  const mockContent: HeroContent = {
    title: '아름다운 서울 숙소',
    subtitle: '도심 속 편안한 휴식',
    backgroundImage: 'https://example.com/hero.jpg',
    overlayColor: '#000000',
    overlayOpacity: 40,
  };

  it('제목과 부제목을 렌더링한다', () => {
    render(<HeroBlock content={mockContent} />);

    expect(screen.getByText('아름다운 서울 숙소')).toBeInTheDocument();
    expect(screen.getByText('도심 속 편안한 휴식')).toBeInTheDocument();
  });

  it('배경 이미지가 없을 때 그라데이션 배경을 표시한다', () => {
    const contentWithoutImage: HeroContent = {
      title: '테스트 숙소',
      subtitle: '',
      backgroundImage: '',
      overlayColor: '',
      overlayOpacity: 0,
    };

    const { container } = render(<HeroBlock content={contentWithoutImage} />);
    const gradientDiv = container.querySelector('.bg-gradient-to-br');

    expect(gradientDiv).toBeInTheDocument();
  });

  it('스크롤 유도 요소를 표시한다', () => {
    render(<HeroBlock content={mockContent} />);

    expect(screen.getByText('스크롤하여 더 보기')).toBeInTheDocument();
  });

  it('부제목이 없을 때 렌더링하지 않는다', () => {
    const contentWithoutSubtitle: HeroContent = {
      ...mockContent,
      subtitle: '',
    };

    render(<HeroBlock content={contentWithoutSubtitle} />);

    expect(screen.queryByText(mockContent.subtitle)).not.toBeInTheDocument();
  });

  it('AirBnB 스타일 클래스를 적용한다', () => {
    const { container } = render(<HeroBlock content={mockContent} />);

    // 최소 높이 체크
    const heroContainer = container.firstChild as HTMLElement;
    expect(heroContainer).toHaveClass('h-[85vh]');
    expect(heroContainer).toHaveClass('min-h-[600px]');

    // 애니메이션 체크
    const textContainer = container.querySelector('.animate-fade-up');
    expect(textContainer).toBeInTheDocument();
  });
});
