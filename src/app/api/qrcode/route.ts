// @TASK P5-T5.2 - QR 코드 생성 API
// @SPEC docs/planning/06-tasks.md#P5-T5.2

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'edge';

/**
 * QR 코드 이미지 생성 API
 *
 * @param url - QR 코드에 담을 URL (필수)
 * @param size - QR 코드 크기 (기본: 200)
 * @param format - 출력 형식 png|svg (기본: png)
 *
 * @example
 * GET /api/qrcode?url=https://roomy.app/g/my-guide&size=300&format=png
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const size = parseInt(searchParams.get('size') || '200', 10);
    const format = searchParams.get('format') || 'png';

    // 파라미터 검증
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    if (format !== 'png' && format !== 'svg') {
      return NextResponse.json(
        { error: 'Format must be png or svg' },
        { status: 400 }
      );
    }

    if (size < 50 || size > 1000) {
      return NextResponse.json(
        { error: 'Size must be between 50 and 1000' },
        { status: 400 }
      );
    }

    // QR 코드 생성 옵션
    const options = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M' as const,
    };

    if (format === 'png') {
      // PNG 생성
      const buffer = await QRCode.toBuffer(url, options);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      // SVG 생성
      const svgString = await QRCode.toString(url, {
        ...options,
        type: 'svg',
      });

      return new NextResponse(svgString, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
