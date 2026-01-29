/**
 * P7-T7.7: 쿠폰/할인 API 테스트
 *
 * TDD Workflow: RED → GREEN → REFACTOR
 *
 * 테스트 대상:
 * - 관리자 API:
 *   - POST /api/admin/coupons - 쿠폰 생성
 *   - GET /api/admin/coupons - 쿠폰 목록 조회
 *   - GET /api/admin/coupons/[id] - 쿠폰 상세 조회
 *   - PATCH /api/admin/coupons/[id] - 쿠폰 수정
 *   - DELETE /api/admin/coupons/[id] - 쿠폰 삭제
 *   - POST /api/admin/coupons/issue - 쿠폰 발급
 * - 사용자 API:
 *   - GET /api/coupons/my - 내 쿠폰 목록
 *   - POST /api/coupons/apply - 쿠폰 적용
 *   - POST /api/coupons/validate - 쿠폰 코드 검증
 *
 * 요구사항:
 * - 관리자 권한 필수 (관리자 API)
 * - 쿠폰 코드 자동 생성 옵션
 * - 유효성 검증 (기간, 사용 횟수, 최소 금액)
 * - 할인 금액 계산
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (테스트용 서비스 롤 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const API_BASE_URL = 'http://localhost:3000';

describe('POST /api/admin/coupons - 쿠폰 생성', () => {
  let adminUser: any;
  let normalUser: any;

  beforeAll(async () => {
    // 테스트용 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-coupons@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    // profiles 테이블에 role 설정
    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id);

    // 테스트용 일반 사용자 생성
    const { data: normal } = await supabase.auth.admin.createUser({
      email: 'user-coupons@test.com',
      password: 'test1234',
      email_confirm: true,
    });
    normalUser = normal.user;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (normalUser) {
      await supabase.auth.admin.deleteUser(normalUser.id);
    }
  });

  afterEach(async () => {
    // 테스트용 쿠폰 정리
    await supabase.from('coupons').delete().like('code', 'TEST%');
  });

  it('관리자가 쿠폰을 생성할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 생성 요청
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        code: 'TEST10PERCENT',
        name: '10% 할인 쿠폰',
        type: 'percent',
        value: 10,
        min_order_amount: 10000,
        max_discount: 5000,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage_limit: 100,
        usage_limit_per_user: 1,
      }),
    });

    // Then: 쿠폰이 생성되어야 함
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.code).toBe('TEST10PERCENT');
    expect(data.type).toBe('percent');
    expect(data.value).toBe(10);
  });

  it('코드를 지정하지 않으면 자동 생성된다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons@test.com',
      password: 'test1234',
    });

    // When: 코드 없이 쿠폰 생성 요청
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        name: '자동 코드 쿠폰',
        type: 'fixed',
        value: 5000,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    // Then: 자동 생성된 코드가 있어야 함
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.code).toBeTruthy();
    expect(data.code.length).toBeGreaterThanOrEqual(8);

    // Cleanup
    await supabase.from('coupons').delete().eq('id', data.id);
  });

  it('일반 사용자는 쿠폰을 생성할 수 없다', async () => {
    // Given: 일반 사용자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'user-coupons@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 생성 요청
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        code: 'TESTFORBIDDEN',
        name: '권한 없음',
        type: 'percent',
        value: 10,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    // Then: 403 에러
    expect(response.status).toBe(403);
  });
});

describe('GET /api/admin/coupons - 쿠폰 목록 조회', () => {
  let adminUser: any;
  let testCouponIds: string[] = [];

  beforeAll(async () => {
    // 테스트용 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-coupons-list@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id);

    // 테스트용 쿠폰 생성
    const coupons = await supabase
      .from('coupons')
      .insert([
        {
          code: 'TESTLIST1',
          name: '테스트 쿠폰 1',
          type: 'percent',
          value: 10,
          start_at: new Date().toISOString(),
          end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          code: 'TESTLIST2',
          name: '테스트 쿠폰 2',
          type: 'fixed',
          value: 5000,
          start_at: new Date().toISOString(),
          end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: false,
        },
      ])
      .select();

    testCouponIds = coupons.data?.map((c) => c.id) || [];
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    await supabase.from('coupons').delete().like('code', 'TESTLIST%');
  });

  it('관리자가 모든 쿠폰 목록을 조회할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons-list@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 목록 조회
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
      headers: {
        Authorization: `Bearer ${session.session?.access_token}`,
      },
    });

    // Then: 모든 쿠폰이 조회되어야 함
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.coupons.length).toBeGreaterThanOrEqual(2);
  });

  it('활성 상태로 필터링할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons-list@test.com',
      password: 'test1234',
    });

    // When: 활성 쿠폰만 조회
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons?is_active=true`, {
      headers: {
        Authorization: `Bearer ${session.session?.access_token}`,
      },
    });

    // Then: 활성 쿠폰만 반환
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.coupons.every((c: any) => c.is_active === true)).toBe(true);
  });
});

describe('PATCH /api/admin/coupons/[id] - 쿠폰 수정', () => {
  let adminUser: any;
  let testCouponId: string;

  beforeAll(async () => {
    // 테스트용 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-coupons-update@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id);

    // 테스트용 쿠폰 생성
    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: 'TESTUPDATE',
        name: '수정 테스트',
        type: 'percent',
        value: 10,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    testCouponId = coupon.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    await supabase.from('coupons').delete().eq('id', testCouponId);
  });

  it('관리자가 쿠폰을 수정할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons-update@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 수정 요청
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${testCouponId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        name: '수정된 쿠폰',
        value: 20,
        is_active: false,
      }),
    });

    // Then: 쿠폰이 수정되어야 함
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('수정된 쿠폰');
    expect(data.value).toBe(20);
    expect(data.is_active).toBe(false);
  });
});

describe('POST /api/admin/coupons/issue - 쿠폰 발급', () => {
  let adminUser: any;
  let testUser: any;
  let testCouponId: string;

  beforeAll(async () => {
    // 테스트용 관리자 생성
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin-coupons-issue@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    adminUser = admin.user;

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id);

    // 테스트용 일반 사용자 생성
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'user-receive-coupon@test.com',
      password: 'test1234',
      email_confirm: true,
    });
    testUser = user.user;

    // 테스트용 쿠폰 생성
    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: 'TESTISSUE',
        name: '발급 테스트',
        type: 'percent',
        value: 10,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    testCouponId = coupon.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await supabase.auth.admin.deleteUser(adminUser.id);
    }
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
    await supabase.from('coupons').delete().eq('id', testCouponId);
  });

  afterEach(async () => {
    // user_coupons 정리
    await supabase.from('user_coupons').delete().eq('coupon_id', testCouponId);
  });

  it('관리자가 특정 사용자에게 쿠폰을 발급할 수 있다', async () => {
    // Given: 관리자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin-coupons-issue@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 발급 요청
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        coupon_id: testCouponId,
        user_ids: [testUser.id],
        expires_days: 30,
      }),
    });

    // Then: 쿠폰이 발급되어야 함
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.issued_count).toBe(1);

    // 사용자 쿠폰 확인
    const { data: userCoupon } = await supabase
      .from('user_coupons')
      .select()
      .eq('user_id', testUser.id)
      .eq('coupon_id', testCouponId)
      .single();

    expect(userCoupon).toBeTruthy();
    expect(userCoupon.is_used).toBe(false);
  });
});

describe('GET /api/coupons/my - 내 쿠폰 목록', () => {
  let testUser: any;
  let testCouponId: string;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'user-my-coupons@test.com',
      password: 'test1234',
      email_confirm: true,
    });
    testUser = user.user;

    // 테스트용 쿠폰 생성 및 발급
    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: 'TESTMY',
        name: '내 쿠폰',
        type: 'percent',
        value: 10,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    testCouponId = coupon.id;

    await supabase.from('user_coupons').insert({
      user_id: testUser.id,
      coupon_id: testCouponId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterAll(async () => {
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
    await supabase.from('coupons').delete().eq('id', testCouponId);
  });

  it('사용자가 자신의 쿠폰 목록을 조회할 수 있다', async () => {
    // Given: 사용자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'user-my-coupons@test.com',
      password: 'test1234',
    });

    // When: 내 쿠폰 목록 조회
    const response = await fetch(`${API_BASE_URL}/api/coupons/my`, {
      headers: {
        Authorization: `Bearer ${session.session?.access_token}`,
      },
    });

    // Then: 쿠폰 목록이 반환되어야 함
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.coupons.length).toBeGreaterThanOrEqual(1);
    expect(data.coupons[0].coupon.code).toBe('TESTMY');
  });
});

describe('POST /api/coupons/validate - 쿠폰 코드 검증', () => {
  let testUser: any;
  let testCouponId: string;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'user-validate-coupon@test.com',
      password: 'test1234',
      email_confirm: true,
    });
    testUser = user.user;

    // 테스트용 쿠폰 생성 및 발급
    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: 'TESTVALIDATE',
        name: '검증 테스트',
        type: 'percent',
        value: 10,
        min_order_amount: 10000,
        max_discount: 5000,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    testCouponId = coupon.id;

    await supabase.from('user_coupons').insert({
      user_id: testUser.id,
      coupon_id: testCouponId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  afterAll(async () => {
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
    await supabase.from('coupons').delete().eq('id', testCouponId);
  });

  it('유효한 쿠폰 코드를 검증할 수 있다', async () => {
    // Given: 사용자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'user-validate-coupon@test.com',
      password: 'test1234',
    });

    // When: 쿠폰 검증 요청
    const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        code: 'TESTVALIDATE',
        order_amount: 20000,
      }),
    });

    // Then: 유효성 확인 결과 반환
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.is_valid).toBe(true);
    expect(data.discount_amount).toBeGreaterThan(0);
    expect(data.discount_amount).toBe(2000); // 20000 * 10% = 2000
  });

  it('최소 주문금액 미달 시 검증 실패', async () => {
    // Given: 사용자 세션
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'user-validate-coupon@test.com',
      password: 'test1234',
    });

    // When: 최소 금액 미달로 검증 요청
    const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        code: 'TESTVALIDATE',
        order_amount: 5000,
      }),
    });

    // Then: 검증 실패
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.is_valid).toBe(false);
    expect(data.error_message).toContain('최소 주문금액');
  });
});
