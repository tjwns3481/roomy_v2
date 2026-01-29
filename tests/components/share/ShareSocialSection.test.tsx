// @TASK P5-T5.3 - SNS 공유 섹션 테스트
// @SPEC docs/planning/06-tasks.md#p5-t53

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareSocialSection } from '@/components/share/ShareSocialSection';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('ShareSocialSection', () => {
  const mockProps = {
    url: 'https://roomy.app/g/test-guidebook',
    title: 'Test Guidebook',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SNS 공유 버튼들을 렌더링한다', () => {
    render(<ShareSocialSection {...mockProps} />);
    expect(screen.getByText('카카오톡')).toBeInTheDocument();
    expect(screen.getByText('트위터')).toBeInTheDocument();
    expect(screen.getByText('페이스북')).toBeInTheDocument();
  });

  it('카카오톡 버튼 클릭 시 공유 페이지를 연다', () => {
    render(<ShareSocialSection {...mockProps} />);

    const kakaoButton = screen.getByText('카카오톡').closest('button');
    fireEvent.click(kakaoButton!);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('story.kakao.com/share'),
      '_blank',
      'width=600,height=600'
    );
  });

  it('트위터 버튼 클릭 시 트위터 공유 페이지를 연다', () => {
    render(<ShareSocialSection {...mockProps} />);

    const twitterButton = screen.getByText('트위터').closest('button');
    fireEvent.click(twitterButton!);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=600'
    );
  });

  it('페이스북 버튼 클릭 시 페이스북 공유 페이지를 연다', () => {
    render(<ShareSocialSection {...mockProps} />);

    const facebookButton = screen.getByText('페이스북').closest('button');
    fireEvent.click(facebookButton!);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      'width=600,height=600'
    );
  });

  it('트위터 공유 URL에 인코딩된 URL과 제목이 포함된다', () => {
    render(<ShareSocialSection {...mockProps} />);

    const twitterButton = screen.getByText('트위터').closest('button');
    fireEvent.click(twitterButton!);

    const encodedUrl = encodeURIComponent(mockProps.url);
    const encodedTitle = encodeURIComponent(mockProps.title);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(`url=${encodedUrl}`),
      '_blank',
      'width=600,height=600'
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(`text=${encodedTitle}`),
      '_blank',
      'width=600,height=600'
    );
  });

  it('페이스북 공유 URL에 인코딩된 URL이 포함된다', () => {
    render(<ShareSocialSection {...mockProps} />);

    const facebookButton = screen.getByText('페이스북').closest('button');
    fireEvent.click(facebookButton!);

    const encodedUrl = encodeURIComponent(mockProps.url);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(`u=${encodedUrl}`),
      '_blank',
      'width=600,height=600'
    );
  });

  it('SNS 공유 안내 텍스트를 표시한다', () => {
    render(<ShareSocialSection {...mockProps} />);
    expect(
      screen.getByText('SNS 버튼을 클릭하여 가이드북을 공유해보세요')
    ).toBeInTheDocument();
  });
});
