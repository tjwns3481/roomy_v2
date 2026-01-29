// @TASK P5-T5.2 - QRCodeDisplay 컴포넌트 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.2

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QRCodeDisplay } from '@/components/share/qr-code-display';

describe('QRCodeDisplay', () => {
  const mockUrl = 'https://roomy.app/g/test-guide';

  it('기본 렌더링', () => {
    render(<QRCodeDisplay url={mockUrl} />);

    // URL이 표시되는지 확인
    expect(screen.getByText(mockUrl)).toBeInTheDocument();
  });

  it('제목 표시', () => {
    render(<QRCodeDisplay url={mockUrl} title="Test Guide" />);

    expect(screen.getByText('Test Guide')).toBeInTheDocument();
  });

  it('다운로드 버튼 표시', () => {
    render(<QRCodeDisplay url={mockUrl} showDownload />);

    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument();
  });

  it('다운로드 버튼 숨김', () => {
    render(<QRCodeDisplay url={mockUrl} showDownload={false} />);

    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('QR 코드 캔버스 렌더링', () => {
    const { container } = render(<QRCodeDisplay url={mockUrl} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('커스텀 크기 적용', () => {
    const { container } = render(<QRCodeDisplay url={mockUrl} size="large" />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '300');
  });
});
