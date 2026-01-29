// @TASK P8-R2: Branding E2E Tests
// @SPEC specs/domain/resources.yaml - branding resource

import { test, expect } from '@playwright/test';

test.describe('Branding API E2E', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let authToken: string;
  let guidebookId: string;

  test.beforeAll(async ({ request }) => {
    // 1. 테스트 사용자 로그인 (Pro 플랜)
    const loginRes = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'test-pro@example.com',
        password: 'test1234',
      },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // 2. 테스트용 가이드북 생성
    const guidebookRes = await request.post(`${baseUrl}/api/guidebooks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        title: 'Test Guidebook for Branding',
        slug: 'test-branding-guidebook',
      },
    });
    const guidebookData = await guidebookRes.json();
    guidebookId = guidebookData.data.id;
  });

  test('브랜딩 조회 - 최초에는 404', async ({ request }) => {
    const res = await request.get(
      `${baseUrl}/api/guidebooks/${guidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(res.status()).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe('NOT_FOUND');
  });

  test('브랜딩 생성 성공', async ({ request }) => {
    const brandingData = {
      logo_url: 'https://example.com/logo.png',
      primary_color: '#1E40AF',
      secondary_color: '#FBBF24',
      font_preset: 'pretendard',
    };

    const res = await request.put(
      `${baseUrl}/api/guidebooks/${guidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: brandingData,
      }
    );

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.guidebook_id).toBe(guidebookId);
    expect(json.data.logo_url).toBe(brandingData.logo_url);
    expect(json.data.primary_color).toBe(brandingData.primary_color);
    expect(json.data.font_preset).toBe(brandingData.font_preset);
  });

  test('브랜딩 조회 성공', async ({ request }) => {
    const res = await request.get(
      `${baseUrl}/api/guidebooks/${guidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.guidebook_id).toBe(guidebookId);
    expect(json.data.primary_color).toBe('#1E40AF');
  });

  test('브랜딩 수정 (Upsert)', async ({ request }) => {
    const updatedData = {
      primary_color: '#DC2626',
      secondary_color: '#10B981',
      font_preset: 'noto_sans',
    };

    const res = await request.put(
      `${baseUrl}/api/guidebooks/${guidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: updatedData,
      }
    );

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.primary_color).toBe('#DC2626');
    expect(json.data.font_preset).toBe('noto_sans');
  });

  test('잘못된 색상 형식 검증 실패', async ({ request }) => {
    const invalidData = {
      primary_color: 'blue', // 잘못된 HEX 형식
    };

    const res = await request.put(
      `${baseUrl}/api/guidebooks/${guidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: invalidData,
      }
    );

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  test('Free 플랜 사용자는 브랜딩 사용 불가', async ({ request }) => {
    // Free 플랜 사용자 로그인
    const freeLoginRes = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'test-free@example.com',
        password: 'test1234',
      },
    });
    const freeLoginData = await freeLoginRes.json();
    const freeToken = freeLoginData.token;

    // Free 사용자의 가이드북 생성
    const freeGuidebookRes = await request.post(`${baseUrl}/api/guidebooks`, {
      headers: {
        Authorization: `Bearer ${freeToken}`,
      },
      data: {
        title: 'Free User Guidebook',
        slug: 'free-guidebook',
      },
    });
    const freeGuidebookData = await freeGuidebookRes.json();
    const freeGuidebookId = freeGuidebookData.data.id;

    // 브랜딩 설정 시도
    const res = await request.put(
      `${baseUrl}/api/guidebooks/${freeGuidebookId}/branding`,
      {
        headers: {
          Authorization: `Bearer ${freeToken}`,
        },
        data: {
          primary_color: '#1E40AF',
        },
      }
    );

    expect(res.status()).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('PERMISSION_DENIED');
  });
});
