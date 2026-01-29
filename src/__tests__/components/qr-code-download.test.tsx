// @TASK P5-T5.2 - QRCodeDownload 컴포넌트 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.2

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QRCodeDownload } from '@/components/share/qr-code-download';

describe('QRCodeDownload', () => {
  const mockProps = {
    url: 'https://roomy.app/g/test-guide',
    title: 'Test Guide',
    slug: 'test-guide',
  };

  it('기본 렌더링', () => {
    render(<QRCodeDownload {...mockProps} />);

    // 다운로드 형식 레이블 확인
    expect(screen.getByText('다운로드 형식')).toBeInTheDocument();
  });

  it('PNG 다운로드 버튼 표시', () => {
    render(<QRCodeDownload {...mockProps} />);

    expect(screen.getByRole('button', { name: /png \(고해상도\)/i })).toBeInTheDocument();
  });

  it('SVG 다운로드 버튼 표시', () => {
    render(<QRCodeDownload {...mockProps} />);

    expect(screen.getByRole('button', { name: /svg \(벡터\)/i })).toBeInTheDocument();
  });

  it('PDF 다운로드 버튼 표시', () => {
    render(<QRCodeDownload {...mockProps} />);

    expect(screen.getByRole('button', { name: /pdf \(인쇄용\)/i })).toBeInTheDocument();
  });

  it('안내 텍스트 표시', () => {
    render(<QRCodeDownload {...mockProps} />);

    expect(screen.getByText('💡 인쇄용 PDF란?')).toBeInTheDocument();
  });

  it('숨겨진 QR 코드 캔버스 존재', () => {
    const { container } = render(<QRCodeDownload {...mockProps} />);

    const canvas = container.querySelector('#qr-canvas-hidden');
    expect(canvas).toBeInTheDocument();
  });
});
