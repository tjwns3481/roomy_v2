/**
 * @file tests/api/admin/users.test.ts
 * @description 관리자 사용자 관리 API 테스트
 * @task P7-T7.2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Admin Users API - GET List', () => {
  let adminUserId: string;
  let testUsers: any[] = [];

  beforeAll(async () => {
    // 관리자 계정 조회
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    adminUserId = adminProfile?.id || 'test-admin-id';

    // 테스트 사용자 생성 (3명)
    for (let i = 1; i <= 3; i++) {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: `testuser${i}-${Date.now()}@example.com`,
        email_confirm: true,
        user_metadata: {
          nickname: `TestUser${i}`,
        },
      });

      if (authUser.user) {
        // Profile 업데이트
        await supabase
          .from('profiles')
          .update({
            grade: i === 1 ? 'bronze' : i === 2 ? 'silver' : 'gold',
            points: i * 1000,
            total_order_amount: i * 100000,
          })
          .eq('id', authUser.user.id);

        testUsers.push(authUser.user);
      }
    }
  });

  afterAll(async () => {
    // 테스트 사용자 정리
    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  });

  it('GET /api/admin/users - 회원 목록 조회 (기본)', async () => {
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'X-User-Id': adminUserId,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('pagination');
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
  });

  it('GET /api/admin/users - 검색 (이메일)', async () => {
    const searchEmail = testUsers[0].email;

    const response = await fetch(
      `http://localhost:3000/api/admin/users?search=${searchEmail}`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.users.length).toBeGreaterThanOrEqual(1);
    const foundUser = data.users.find((u: any) => u.email === searchEmail);
    expect(foundUser).toBeTruthy();
  });

  it('GET /api/admin/users - 등급 필터', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/users?grade=silver',
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    data.users.forEach((user: any) => {
      expect(user.grade).toBe('silver');
    });
  });

  it('GET /api/admin/users - 차단 상태 필터', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/users?isBlocked=true',
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    data.users.forEach((user: any) => {
      expect(user.isBlocked).toBe(true);
    });
  });

  it('GET /api/admin/users - 페이지네이션', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/users?page=1&limit=2',
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.users.length).toBeLessThanOrEqual(2);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(2);
  });
});

describe('Admin Users API - GET Detail', () => {
  let adminUserId: string;
  let testUser: any;
  let testOrder: any;

  beforeAll(async () => {
    // 관리자 계정 조회
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    adminUserId = adminProfile?.id || 'test-admin-id';

    // 테스트 사용자 생성
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `detailuser-${Date.now()}@example.com`,
      email_confirm: true,
      user_metadata: {
        nickname: 'DetailTestUser',
      },
    });

    testUser = authUser.user;

    // 테스트 주문 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({
        name: 'User Test Category',
        slug: `user-test-cat-${Date.now()}`,
        is_active: true,
      })
      .select()
      .single();

    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'User Test Product',
        slug: `user-test-product-${Date.now()}`,
        category_id: category.id,
        price: 50000,
        status: 'active',
      })
      .select()
      .single();

    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testUser.id,
        status: 'paid',
        total_amount: 50000,
        discount_amount: 0,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
    });

    testOrder = order;
  });

  afterAll(async () => {
    // 정리
    if (testOrder) {
      await supabase.from('orders').delete().eq('id', testOrder.id);
    }
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
    await supabase.from('categories').delete().eq('slug', 'user-test-cat');
  });

  it('GET /api/admin/users/[id] - 회원 상세 조회', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('user');
    expect(data.user.id).toBe(testUser.id);
    expect(data.user.email).toBe(testUser.email);
  });

  it('GET /api/admin/users/[id] - 주문 이력 포함', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);
  });

  it('GET /api/admin/users/[id] - 통계 포함 (주문/후기/문의)', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('stats');
    expect(data.stats).toHaveProperty('totalOrders');
    expect(data.stats).toHaveProperty('totalSpent');
    expect(data.stats).toHaveProperty('totalReviews');
    expect(data.stats).toHaveProperty('totalInquiries');
  });

  it('GET /api/admin/users/[id] - 존재하지 않는 사용자', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/users/00000000-0000-0000-0000-000000000000',
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(404);
  });
});

describe('Admin Users API - PATCH Update', () => {
  let adminUserId: string;
  let testUser: any;

  beforeAll(async () => {
    // 관리자 계정 조회
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    adminUserId = adminProfile?.id || 'test-admin-id';

    // 테스트 사용자 생성
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `updateuser-${Date.now()}@example.com`,
      email_confirm: true,
      user_metadata: {
        nickname: 'UpdateTestUser',
      },
    });

    testUser = authUser.user;
  });

  afterAll(async () => {
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  });

  it('PATCH /api/admin/users/[id] - 등급 변경', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          grade: 'gold',
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.user.grade).toBe('gold');

    // 등급 변경 이력 확인
    const { data: history } = await supabase
      .from('grade_histories')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeTruthy();
    expect(history.to_grade).toBe('gold');
    expect(history.reason).toBe('manual');
  });

  it('PATCH /api/admin/users/[id] - 회원 차단', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          isBlocked: true,
          blockedReason: '부적절한 행동',
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.user.isBlocked).toBe(true);
    expect(data.user.blockedReason).toBe('부적절한 행동');
    expect(data.user.blockedAt).toBeTruthy();

    // 차단된 사용자 로그인 불가 확인은 별도 테스트 필요
  });

  it('PATCH /api/admin/users/[id] - 차단 해제', async () => {
    // 먼저 차단
    await fetch(`http://localhost:3000/api/admin/users/${testUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': adminUserId,
      },
      body: JSON.stringify({
        isBlocked: true,
        blockedReason: 'Test block',
      }),
    });

    // 차단 해제
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          isBlocked: false,
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.user.isBlocked).toBe(false);
    expect(data.user.blockedReason).toBeNull();
  });

  it('PATCH /api/admin/users/[id] - 잘못된 등급', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          grade: 'invalid_grade',
        }),
      }
    );

    expect(response.status).toBe(400);
  });
});

describe('Admin Users API - POST Points', () => {
  let adminUserId: string;
  let testUser: any;

  beforeAll(async () => {
    // 관리자 계정 조회
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    adminUserId = adminProfile?.id || 'test-admin-id';

    // 테스트 사용자 생성
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `pointsuser-${Date.now()}@example.com`,
      email_confirm: true,
      user_metadata: {
        nickname: 'PointsTestUser',
      },
    });

    testUser = authUser.user;

    // 초기 포인트 설정
    await supabase
      .from('profiles')
      .update({ points: 1000 })
      .eq('id', testUser.id);
  });

  afterAll(async () => {
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  });

  it('POST /api/admin/users/[id]/points - 적립금 지급', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}/points`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          amount: 5000,
          reason: '이벤트 지급',
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.newBalance).toBe(6000); // 1000 + 5000
    expect(data.transaction).toHaveProperty('id');

    // 포인트 히스토리 확인
    const { data: history } = await supabase
      .from('point_histories')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('type', 'earn')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeTruthy();
    expect(history.amount).toBe(5000);
    expect(history.reason).toBe('이벤트 지급');
  });

  it('POST /api/admin/users/[id]/points - 적립금 차감', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}/points`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          amount: -500,
          reason: '관리자 조정',
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.newBalance).toBeGreaterThanOrEqual(0);

    // 포인트 히스토리 확인
    const { data: history } = await supabase
      .from('point_histories')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('type', 'adjust')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeTruthy();
    expect(history.amount).toBe(-500);
  });

  it('POST /api/admin/users/[id]/points - 잔액 부족 (음수 불가)', async () => {
    // 현재 잔액보다 큰 금액 차감 시도
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}/points`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          amount: -99999,
          reason: '과다 차감 시도',
        }),
      }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('부족');
  });

  it('POST /api/admin/users/[id]/points - 필수 필드 누락', async () => {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${testUser.id}/points`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': adminUserId,
        },
        body: JSON.stringify({
          amount: 1000,
          // reason 누락
        }),
      }
    );

    expect(response.status).toBe(400);
  });
});

describe('Admin Users API - Authorization', () => {
  it('비관리자 접근 시 403 에러', async () => {
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'X-User-Id': 'non-admin-user',
      },
    });

    expect(response.status).toBe(403);
  });

  it('인증 없이 접근 시 401 에러', async () => {
    const response = await fetch('http://localhost:3000/api/admin/users');

    expect(response.status).toBe(401);
  });
});
