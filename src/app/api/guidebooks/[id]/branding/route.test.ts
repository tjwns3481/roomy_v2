// @TASK P8-R2: Branding API Tests (TDD RED)
// @SPEC specs/domain/resources.yaml - branding resource

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from './route';
import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('GET /api/guidebooks/[id]/branding', () => {
  const mockGuidebookId = 'guidebook-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('브랜딩이 존재하면 조회 성공', async () => {
    const mockBranding = {
      id: 'branding-123',
      guidebook_id: mockGuidebookId,
      logo_url: 'https://example.com/logo.png',
      favicon_url: 'https://example.com/favicon.ico',
      primary_color: '#1E40AF',
      secondary_color: '#FBBF24',
      font_preset: 'pretendard',
      custom_css: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockBranding, error: null }),
    };

    (createServerClient as any).mockReturnValue(mockSupabase);

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await GET(request, context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockBranding);
  });

  it('브랜딩이 없으면 404 반환', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      }),
    };

    (createServerClient as any).mockReturnValue(mockSupabase);

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await GET(request, context);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('DB 에러 발생 시 500 반환', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      }),
    };

    (createServerClient as any).mockReturnValue(mockSupabase);

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await GET(request, context);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.code).toBe('FETCH_ERROR');
  });
});

describe('PUT /api/guidebooks/[id]/branding', () => {
  const mockGuidebookId = 'guidebook-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('브랜딩 생성/수정 성공', async () => {
    const requestBody = {
      logo_url: 'https://example.com/logo.png',
      favicon_url: 'https://example.com/favicon.ico',
      primary_color: '#1E40AF',
      secondary_color: '#FBBF24',
      font_preset: 'pretendard',
    };

    const mockBranding = {
      id: 'branding-123',
      guidebook_id: mockGuidebookId,
      ...requestBody,
      custom_css: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockBranding, error: null }),
    };

    (createServerClient as any).mockReturnValue(mockSupabase);

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await PUT(request, context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockBranding);
    expect(mockSupabase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        guidebook_id: mockGuidebookId,
        ...requestBody,
      }),
      { onConflict: 'guidebook_id' }
    );
  });

  it('잘못된 색상 형식 검증 실패', async () => {
    const requestBody = {
      primary_color: 'invalid-color', // 잘못된 HEX 형식
    };

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await PUT(request, context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('잘못된 font_preset 검증 실패', async () => {
    const requestBody = {
      font_preset: 'invalid_font', // 허용되지 않는 폰트
    };

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await PUT(request, context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('DB 에러 발생 시 500 반환', async () => {
    const requestBody = {
      primary_color: '#1E40AF',
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      }),
    };

    (createServerClient as any).mockReturnValue(mockSupabase);

    const request = new NextRequest(
      `http://localhost:3000/api/guidebooks/${mockGuidebookId}/branding`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }
    );
    const context = { params: Promise.resolve({ id: mockGuidebookId }) };

    const response = await PUT(request, context);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.code).toBe('UPDATE_ERROR');
  });
});
