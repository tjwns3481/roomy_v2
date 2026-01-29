/**
 * Downloads API 테스트
 *
 * 테스트 범위:
 * - GET /api/downloads/[id] - Signed URL 생성 및 다운로드 권한 검증
 *
 * 검증 항목:
 * - 본인 구매 상품인지 확인
 * - 만료일(expires_at) 검증
 * - 다운로드 횟수(download_count < max_downloads) 검증
 * - Signed URL 생성
 * - 다운로드 카운트 증가
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/downloads/[id]/route';

// Supabase Mock - 전역 mock 객체
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Next.js cookies Mock
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((name: string) => ({ value: 'session-123' })),
      set: vi.fn(),
      getAll: vi.fn(() => []),
    })
  ),
}));

describe('GET /api/downloads/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('유효한 다운로드 권한이 있으면 Signed URL로 리다이렉트한다', async () => {
    const userId = 'user-123';
    const downloadId = 'download-123';
    const fileId = 'file-123';
    const storagePath = 'products/file.pdf';

    // Mock: 사용자 인증
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 다운로드 권한 조회
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: downloadId,
        user_id: userId,
        download_count: 2,
        expires_at: new Date(Date.now() + 86400000).toISOString(), // 내일
        product_file: {
          id: fileId,
          storage_path: storagePath,
          download_limit: 5,
        },
        order_item: {
          order: {
            user_id: userId,
            status: 'paid',
          },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    // Mock: Signed URL 생성
    const signedUrl = 'https://storage.supabase.co/signed/file.pdf';
    const mockCreateSignedUrl = vi.fn().mockResolvedValueOnce({
      data: { signedUrl },
      error: null,
    });

    mockSupabase.storage.from.mockReturnValueOnce({
      createSignedUrl: mockCreateSignedUrl,
    });

    // Mock: 다운로드 카운트 업데이트
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq2 = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValueOnce({
      eq: mockEq2,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: downloadId }) }
    );

    expect(response.status).toBe(307); // Temporary Redirect
    expect(response.headers.get('Location')).toBe(signedUrl);
  });

  it('인증되지 않은 사용자는 401 에러를 반환한다', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('다른 사용자의 다운로드 권한은 접근할 수 없다', async () => {
    const userId = 'user-123';
    const otherUserId = 'user-456';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 다른 사용자 소유의 다운로드 권한
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'download-123',
        user_id: otherUserId,
        download_count: 0,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        product_file: {
          id: 'file-123',
          storage_path: 'products/file.pdf',
          download_limit: 5,
        },
        order_item: {
          order: {
            user_id: otherUserId,
            status: 'paid',
          },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error.code).toBe('FORBIDDEN');
  });

  it('만료된 다운로드 권한은 410 에러를 반환한다', async () => {
    const userId = 'user-123';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 만료된 다운로드 권한
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'download-123',
        user_id: userId,
        download_count: 2,
        expires_at: new Date(Date.now() - 86400000).toISOString(), // 어제
        product_file: {
          download_limit: 5,
        },
        order_item: {
          order: {
            user_id: userId,
            status: 'paid',
          },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(410); // Gone
    const json = await response.json();
    expect(json.error.code).toBe('DOWNLOAD_EXPIRED');
  });

  it('다운로드 횟수가 초과되면 429 에러를 반환한다', async () => {
    const userId = 'user-123';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 다운로드 횟수 초과
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'download-123',
        user_id: userId,
        download_count: 5,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        product_file: {
          download_limit: 5,
        },
        order_item: {
          order: {
            user_id: userId,
            status: 'paid',
          },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(429); // Too Many Requests
    const json = await response.json();
    expect(json.error.code).toBe('DOWNLOAD_LIMIT_EXCEEDED');
  });

  it('존재하지 않는 다운로드 권한은 404 에러를 반환한다', async () => {
    const userId = 'user-123';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 다운로드 권한 없음
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' }, // Not found
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error.code).toBe('DOWNLOAD_NOT_FOUND');
  });

  it('결제 완료되지 않은 주문은 접근할 수 없다', async () => {
    const userId = 'user-123';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
      error: null,
    });

    // Mock: 결제 대기 중인 주문
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'download-123',
        user_id: userId,
        download_count: 0,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        product_file: {
          download_limit: 5,
        },
        order_item: {
          order: {
            user_id: userId,
            status: 'pending', // 결제 대기
          },
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      single: mockSingle,
    });

    const response = await GET(
      new Request('http://localhost:3000/api/downloads/download-123'),
      { params: Promise.resolve({ id: 'download-123' }) }
    );

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error.code).toBe('ORDER_NOT_PAID');
  });
});
