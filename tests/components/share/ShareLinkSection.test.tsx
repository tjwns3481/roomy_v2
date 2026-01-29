// @TASK P5-T5.3 - 링크 복사 섹션 테스트
// @SPEC docs/planning/06-tasks.md#p5-t53

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareLinkSection } from '@/components/share/ShareLinkSection';
import { toast } from 'sonner';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShareLinkSection', () => {
  const mockFullUrl = 'https://roomy.app/g/test-guidebook';
  const mockShortUrl = 'https://roomy.app/s/ABC123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('전체 URL 복사 버튼이 있다', () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={null} />);
    expect(screen.getByText('전체 URL 복사')).toBeInTheDocument();
  });

  it('전체 URL을 복사할 수 있다', async () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={null} />);

    const copyButton = screen.getByText('전체 URL 복사');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockFullUrl);
      expect(toast.success).toHaveBeenCalledWith('링크가 복사되었습니다');
    });
  });

  it('복사 성공 시 버튼 텍스트가 변경된다', async () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={null} />);

    const copyButton = screen.getByText('전체 URL 복사');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument();
    });
  });

  it('단축 URL이 있을 경우 표시한다', () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={mockShortUrl} />);
    expect(screen.getByDisplayValue(mockShortUrl)).toBeInTheDocument();
    expect(screen.getByText('단축 URL 복사')).toBeInTheDocument();
  });

  it('단축 URL을 복사할 수 있다', async () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={mockShortUrl} />);

    const copyButton = screen.getByText('단축 URL 복사');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockShortUrl);
      expect(toast.success).toHaveBeenCalledWith('링크가 복사되었습니다');
    });
  });

  it('입력 필드 클릭 시 전체 선택된다', () => {
    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={null} />);

    const input = screen.getByDisplayValue(mockFullUrl) as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');

    fireEvent.click(input);
    expect(selectSpy).toHaveBeenCalled();
  });

  it('복사 실패 시 에러 토스트를 표시한다', async () => {
    // Mock clipboard to fail
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error('Copy failed')
    );

    render(<ShareLinkSection fullUrl={mockFullUrl} shortUrl={null} />);

    const copyButton = screen.getByText('전체 URL 복사');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('링크 복사에 실패했습니다');
    });
  });
});
