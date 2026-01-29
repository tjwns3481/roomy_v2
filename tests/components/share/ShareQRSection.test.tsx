// @TASK P5-T5.3 - QR 코드 섹션 테스트
// @SPEC docs/planning/06-tasks.md#p5-t53

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareQRSection } from '@/components/share/ShareQRSection';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShareQRSection', () => {
  const mockProps = {
    url: 'https://roomy.app/g/test-guidebook',
    title: 'Test Guidebook',
    size: 'medium' as const,
    onSizeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('QR 코드를 렌더링한다', () => {
    render(<ShareQRSection {...mockProps} />);
    // QRCodeSVG는 svg 요소를 생성함
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('크기 선택 라디오 버튼이 있다', () => {
    render(<ShareQRSection {...mockProps} />);
    expect(screen.getByLabelText('작음')).toBeInTheDocument();
    expect(screen.getByLabelText('중간')).toBeInTheDocument();
    expect(screen.getByLabelText('큼')).toBeInTheDocument();
  });

  it('크기를 변경할 수 있다', () => {
    render(<ShareQRSection {...mockProps} />);

    const largeRadio = screen.getByLabelText('큼');
    fireEvent.click(largeRadio);

    expect(mockProps.onSizeChange).toHaveBeenCalledWith('large');
  });

  it('PNG 다운로드 버튼이 있다', () => {
    render(<ShareQRSection {...mockProps} />);
    expect(screen.getByText('PNG 다운로드')).toBeInTheDocument();
  });

  it('SVG 다운로드 버튼이 있다', () => {
    render(<ShareQRSection {...mockProps} />);
    expect(screen.getByText('SVG 다운로드')).toBeInTheDocument();
  });

  it('선택된 크기가 체크되어 있다', () => {
    render(<ShareQRSection {...mockProps} />);
    const mediumRadio = screen.getByLabelText('중간') as HTMLInputElement;
    expect(mediumRadio.getAttribute('data-state')).toBe('checked');
  });

  it('다운로드 버튼 클릭 시 에러가 발생하지 않는다', () => {
    render(<ShareQRSection {...mockProps} />);

    const pngButton = screen.getByText('PNG 다운로드');
    const svgButton = screen.getByText('SVG 다운로드');

    // 클릭 시 에러가 발생하지 않는지 확인
    expect(() => fireEvent.click(pngButton)).not.toThrow();
    expect(() => fireEvent.click(svgButton)).not.toThrow();
  });
});
