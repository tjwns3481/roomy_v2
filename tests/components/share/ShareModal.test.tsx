// @TASK P5-T5.3 - 공유 모달 테스트
// @SPEC docs/planning/06-tasks.md#p5-t53

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareModal } from '@/components/share/ShareModal';

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

describe('ShareModal', () => {
  const mockGuidebook = {
    id: '1',
    title: 'Test Guidebook',
    slug: 'test-guidebook',
    shortCode: 'ABC123',
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    guidebook: mockGuidebook,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('모달이 열렸을 때 렌더링된다', () => {
    render(<ShareModal {...mockProps} />);
    expect(screen.getByText('공유하기')).toBeInTheDocument();
  });

  it('전체 URL을 표시한다', () => {
    render(<ShareModal {...mockProps} />);
    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app'}/g/test-guidebook`;
    expect(screen.getByDisplayValue(fullUrl)).toBeInTheDocument();
  });

  it('단축 URL을 표시한다 (shortCode가 있을 경우)', () => {
    render(<ShareModal {...mockProps} />);
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app'}/s/ABC123`;
    expect(screen.getByDisplayValue(shortUrl)).toBeInTheDocument();
  });

  it('QR 코드 섹션을 표시한다', () => {
    render(<ShareModal {...mockProps} />);
    expect(screen.getByText('QR 코드')).toBeInTheDocument();
    expect(screen.getByLabelText('작음')).toBeInTheDocument();
    expect(screen.getByLabelText('중간')).toBeInTheDocument();
    expect(screen.getByLabelText('큼')).toBeInTheDocument();
  });

  it('SNS 공유 버튼을 표시한다', () => {
    render(<ShareModal {...mockProps} />);
    expect(screen.getByText('SNS 공유')).toBeInTheDocument();
    expect(screen.getByText('카카오톡')).toBeInTheDocument();
    expect(screen.getByText('트위터')).toBeInTheDocument();
    expect(screen.getByText('페이스북')).toBeInTheDocument();
  });

  it('PNG 다운로드 버튼이 있다', () => {
    render(<ShareModal {...mockProps} />);
    expect(screen.getByText('PNG 다운로드')).toBeInTheDocument();
  });

  it('SVG 다운로드 버튼이 있다', () => {
    render(<ShareModal {...mockProps} />);
    expect(screen.getByText('SVG 다운로드')).toBeInTheDocument();
  });

  it('모달을 닫을 수 있다', async () => {
    render(<ShareModal {...mockProps} />);
    // Dialog의 닫기 버튼 클릭 시뮬레이션 (ESC 키)
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });
});
