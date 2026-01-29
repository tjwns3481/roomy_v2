// @TASK P5-T5.2 - QR 코드 API 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.2

import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/qrcode/route';
import { NextRequest } from 'next/server';

describe('GET /api/qrcode', () => {
  it('URL 파라미터 없이 호출 시 400 에러', async () => {
    const request = new NextRequest('http://localhost:3000/api/qrcode');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('URL parameter is required');
  });

  it('잘못된 format 파라미터 시 400 에러', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/qrcode?url=https://test.com&format=invalid'
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Format must be png or svg');
  });

  it('잘못된 size 파라미터 시 400 에러', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/qrcode?url=https://test.com&size=2000'
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Size must be between 50 and 1000');
  });

  it('PNG 형식으로 QR 코드 생성', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/qrcode?url=https://test.com&format=png'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toContain('max-age=31536000');
  });

  it('SVG 형식으로 QR 코드 생성', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/qrcode?url=https://test.com&format=svg'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('기본 파라미터로 QR 코드 생성', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/qrcode?url=https://test.com'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
  });
});
