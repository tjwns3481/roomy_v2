/**
 * P4-T4.3: 관리자 상품 API 테스트
 *
 * TDD Workflow: RED → GREEN → REFACTOR
 *
 * 테스트 대상:
 * - POST /api/admin/products - 상품 생성
 * - GET /api/admin/products - 상품 목록 조회 (관리자용, 모든 상태 포함)
 * - GET /api/admin/products/[id] - 상품 상세 조회
 * - PATCH /api/admin/products/[id] - 상품 수정
 * - DELETE /api/admin/products/[id] - 상품 삭제 (Soft delete)
 * - POST /api/admin/products/[id]/images - 이미지 업로드
 *
 * 요구사항:
 * - 관리자 권한 필수 (403 체크)
 * - Soft delete (status = 'archived')
 * - Slug 자동 생성 (한글 → 영문 변환)
 * - 다중 이미지 업로드
 * - 파일 업로드 (Supabase Storage)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (테스트용 서비스 롤 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('POST /api/admin/products - 상품 생성', () => {
  let adminUser: any;
  let normalUser: any;
  let testCategoryId: string;

  beforeAll(async () => {
    // 테스트용 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-products@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // 테스트용 일반 사용자 생성
    const { data: normal } = await supabase.auth.admin.createUser({
      email: 'user-products@test.com',
      password: 'test1234',
      email_confirm: true,
    });
    normalUser = normal.user;

    // 테스트용 카테고리 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({
        name: '테스트 카테고리',
        slug: 'test-category',
        is_active: true,
      })
      .select()
      .single();
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (normalUser) {
      await supabase.auth.admin.deleteUser(normalUser.id);
    }
    if (testCategoryId) {
      await supabase.from('categories').delete().eq('id', testCategoryId);
    }
  });

  afterEach(async () => {
    // 테스트용 상품 정리
    await supabase
      .from('products')
      .delete()
      .like('slug', 'test-product-%');
  });

  it('관리자가 상품을 생성할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-products@test.com',
      password: 'test1234',
    });

    // When: 상품 생성 요청
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        name: '테스트 상품',
        slug: 'test-product-1',
        short_description: '짧은 설명',
        description: '# 상세 설명\n\n**Markdown** 지원',
        price: 10000,
        discount_price: 8000,
        category_id: testCategoryId,
        status: 'active',
        is_featured: true,
        metadata: {
          file_format: 'PDF',
          file_size: '15MB',
        },
      }),
    });

    // Then: 성공 응답
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe('테스트 상품');
    expect(result.data.slug).toBe('test-product-1');
    expect(result.data.status).toBe('active');
  });

  it('슬러그가 없으면 자동 생성된다 (한글 → 영문)', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-products@test.com',
      password: 'test1234',
    });

    // When: 슬러그 없이 생성
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        name: '한글 상품명',
        price: 10000,
        category_id: testCategoryId,
        status: 'draft',
      }),
    });

    // Then: 슬러그 자동 생성
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.data.slug).toMatch(/^[a-z0-9-]+$/); // kebab-case
  });

  it('일반 사용자는 상품을 생성할 수 없다 (403)', async () => {
    // Given: 일반 사용자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'user-products@test.com',
      password: 'test1234',
    });

    // When: 상품 생성 시도
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        name: '테스트 상품',
        price: 10000,
        category_id: testCategoryId,
        status: 'draft',
      }),
    });

    // Then: 403 Forbidden
    expect(response.status).toBe(403);
    const result = await response.json();
    expect(result.error.code).toBe('FORBIDDEN');
  });

  it('비로그인 사용자는 상품을 생성할 수 없다 (401)', async () => {
    // When: 토큰 없이 요청
    const response = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '테스트 상품',
        price: 10000,
        category_id: testCategoryId,
        status: 'draft',
      }),
    });

    // Then: 401 Unauthorized
    expect(response.status).toBe(401);
  });
});

describe('GET /api/admin/products - 상품 목록 조회 (관리자)', () => {
  let adminUser: any;
  let testCategoryId: string;
  let testProductIds: string[] = [];

  beforeAll(async () => {
    // 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-list@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // 카테고리 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({ name: '목록 테스트', slug: 'list-test', is_active: true })
      .select()
      .single();
    testCategoryId = category.id;

    // 다양한 상태의 상품 생성
    const products = [
      { name: '활성 상품', slug: 'test-list-1', status: 'active' },
      { name: '초안 상품', slug: 'test-list-2', status: 'draft' },
      { name: '숨김 상품', slug: 'test-list-3', status: 'hidden' },
      { name: '보관 상품', slug: 'test-list-4', status: 'archived' },
    ];

    for (const product of products) {
      const { data } = await supabase
        .from('products')
        .insert({
          ...product,
          price: 10000,
          category_id: testCategoryId,
        })
        .select()
        .single();
      testProductIds.push(data.id);
    }
  });

  afterAll(async () => {
    // 정리
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (testProductIds.length > 0) {
      await supabase.from('products').delete().in('id', testProductIds);
    }
    if (testCategoryId) {
      await supabase.from('categories').delete().eq('id', testCategoryId);
    }
  });

  it('관리자는 모든 상태의 상품을 조회할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-list@test.com',
      password: 'test1234',
    });

    // When: 목록 조회
    const response = await fetch('http://localhost:3000/api/admin/products', {
      headers: {
        Authorization: `Bearer ${session.session?.access_token}`,
      },
    });

    // Then: 모든 상태 포함
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.length).toBeGreaterThanOrEqual(4);

    const statuses = result.data.map((p: any) => p.status);
    expect(statuses).toContain('active');
    expect(statuses).toContain('draft');
    expect(statuses).toContain('hidden');
    expect(statuses).toContain('archived');
  });

  it('상태별 필터링이 동작한다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-list@test.com',
      password: 'test1234',
    });

    // When: draft 상품만 조회
    const response = await fetch(
      'http://localhost:3000/api/admin/products?status=draft',
      {
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      }
    );

    // Then: draft만 반환
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.every((p: any) => p.status === 'draft')).toBe(true);
  });
});

describe('PATCH /api/admin/products/[id] - 상품 수정', () => {
  let adminUser: any;
  let testProductId: string;

  beforeAll(async () => {
    // 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-update@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: '수정 테스트 상품',
        slug: 'test-update-product',
        price: 10000,
        type: 'digital',
        status: 'draft',
      })
      .select()
      .single();
    testProductId = product.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId);
    }
  });

  it('관리자가 상품을 수정할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-update@test.com',
      password: 'test1234',
    });

    // When: 상품 수정
    const response = await fetch(
      `http://localhost:3000/api/admin/products/${testProductId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          name: '수정된 상품명',
          status: 'active',
          discount_price: 8000,
        }),
      }
    );

    // Then: 수정 성공
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.name).toBe('수정된 상품명');
    expect(result.data.status).toBe('active');
    expect(result.data.discount_price).toBe(8000);
  });
});

describe('DELETE /api/admin/products/[id] - 상품 삭제 (Soft delete)', () => {
  let adminUser: any;
  let testProductId: string;

  beforeAll(async () => {
    // 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-delete@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: '삭제 테스트 상품',
        slug: 'test-delete-product',
        price: 10000,
        type: 'digital',
        status: 'active',
      })
      .select()
      .single();
    testProductId = product.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId);
    }
  });

  it('관리자가 상품을 소프트 삭제할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-delete@test.com',
      password: 'test1234',
    });

    // When: 삭제 요청
    const response = await fetch(
      `http://localhost:3000/api/admin/products/${testProductId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      }
    );

    // Then: 성공
    expect(response.status).toBe(200);

    // 실제로는 archived 상태로 변경됨
    const { data: product } = await supabase
      .from('products')
      .select('status')
      .eq('id', testProductId)
      .single();

    expect(product.status).toBe('archived');
  });
});

describe('POST /api/admin/products/[id]/images - 이미지 업로드', () => {
  let adminUser: any;
  let testProductId: string;

  beforeAll(async () => {
    // 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-images@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: '이미지 테스트 상품',
        slug: 'test-image-product',
        price: 10000,
        type: 'digital',
        status: 'draft',
      })
      .select()
      .single();
    testProductId = product.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (testProductId) {
      // 이미지 정리
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', testProductId);
      await supabase.from('products').delete().eq('id', testProductId);
    }
  });

  it('관리자가 상품 이미지를 업로드할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-images@test.com',
      password: 'test1234',
    });

    // When: 이미지 업로드 (Base64 또는 URL)
    const response = await fetch(
      `http://localhost:3000/api/admin/products/${testProductId}/images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          images: [
            {
              url: 'https://example.com/image1.jpg',
              alt_text: '대표 이미지',
              is_primary: true,
              sort_order: 0,
            },
            {
              url: 'https://example.com/image2.jpg',
              alt_text: '서브 이미지',
              is_primary: false,
              sort_order: 1,
            },
          ],
        }),
      }
    );

    // Then: 성공
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.data.length).toBe(2);
    expect(result.data[0].is_primary).toBe(true);
  });
});
