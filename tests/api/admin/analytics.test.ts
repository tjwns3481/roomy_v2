/**
 * @file tests/api/admin/analytics.test.ts
 * @description 관리자 매출 통계 API 테스트
 * @task P7-T7.4
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Analytics API - Summary', () => {
  let adminUserId: string;
  let testProducts: any[] = [];
  let testOrders: any[] = [];

  beforeAll(async () => {
    // 관리자 계정 생성 또는 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    adminUserId = profile?.id || 'test-admin-id';

    // 테스트 카테고리 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({
        name: 'Analytics Test',
        slug: 'analytics-test',
        is_active: true,
      })
      .select()
      .single();

    // 테스트 상품 생성 (3개)
    for (let i = 1; i <= 3; i++) {
      const { data: product } = await supabase
        .from('products')
        .insert({
          name: `Test Product ${i}`,
          slug: `test-product-${i}-${Date.now()}`,
          category_id: category.id,
          price: 10000 * i,
          status: 'active',
        })
        .select()
        .single();

      testProducts.push(product);
    }

    // 테스트 주문 생성 (다양한 날짜)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const orderDates = [today, yesterday, lastWeek];

    for (let i = 0; i < orderDates.length; i++) {
      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: adminUserId,
          status: 'paid',
          total_amount: testProducts[i].price,
          discount_amount: 0,
          paid_at: orderDates[i].toISOString(),
          created_at: orderDates[i].toISOString(),
        })
        .select()
        .single();

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: testProducts[i].id,
        product_name: testProducts[i].name,
        price: testProducts[i].price,
        quantity: 1,
      });

      testOrders.push(order);
    }
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    for (const order of testOrders) {
      await supabase.from('orders').delete().eq('id', order.id);
    }
    for (const product of testProducts) {
      await supabase.from('products').delete().eq('id', product.id);
    }
    await supabase.from('categories').delete().eq('slug', 'analytics-test');
  });

  it('GET /summary - 기간별 매출 요약 (일)', async () => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = startDate;

    const response = await fetch(
      `http://localhost:3000/api/admin/analytics/summary?period=day&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('totalRevenue');
    expect(data).toHaveProperty('orderCount');
    expect(data).toHaveProperty('averageOrderValue');
    expect(data.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it('GET /summary - 비교 기간 지원 (전월 대비)', async () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const response = await fetch(
      `http://localhost:3000/api/admin/analytics/summary?period=month&startDate=${startDate}&endDate=${endDate}&compare=true`,
      {
        headers: {
          'X-User-Id': adminUserId,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('current');
    expect(data).toHaveProperty('previous');
    expect(data).toHaveProperty('changePercent');
  });
});

describe('Analytics API - Products', () => {
  let adminUserId: string;

  it('GET /products - 상품별 매출 순위', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/analytics/products?limit=10',
      {
        headers: {
          'X-User-Id': adminUserId || 'test-admin',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.products)).toBe(true);
    if (data.products.length > 0) {
      expect(data.products[0]).toHaveProperty('productId');
      expect(data.products[0]).toHaveProperty('productName');
      expect(data.products[0]).toHaveProperty('revenue');
      expect(data.products[0]).toHaveProperty('orderCount');
      // 매출 순으로 정렬되어야 함
      if (data.products.length > 1) {
        expect(data.products[0].revenue).toBeGreaterThanOrEqual(
          data.products[1].revenue
        );
      }
    }
  });

  it('GET /products - 기간 필터 적용', async () => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    const response = await fetch(
      `http://localhost:3000/api/admin/analytics/products?startDate=${startDate}`,
      {
        headers: {
          'X-User-Id': 'test-admin',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.products)).toBe(true);
  });
});

describe('Analytics API - Categories', () => {
  it('GET /categories - 카테고리별 매출', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/analytics/categories',
      {
        headers: {
          'X-User-Id': 'test-admin',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.categories)).toBe(true);
    if (data.categories.length > 0) {
      expect(data.categories[0]).toHaveProperty('categoryId');
      expect(data.categories[0]).toHaveProperty('categoryName');
      expect(data.categories[0]).toHaveProperty('revenue');
      expect(data.categories[0]).toHaveProperty('orderCount');
      expect(data.categories[0]).toHaveProperty('percentage');
    }
  });
});

describe('Analytics API - Trends', () => {
  it('GET /trends - 매출 추이 (시계열 데이터)', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);

    const response = await fetch(
      `http://localhost:3000/api/admin/analytics/trends?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}&interval=day`,
      {
        headers: {
          'X-User-Id': 'test-admin',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.trends)).toBe(true);
    if (data.trends.length > 0) {
      expect(data.trends[0]).toHaveProperty('date');
      expect(data.trends[0]).toHaveProperty('revenue');
      expect(data.trends[0]).toHaveProperty('orderCount');
    }
  });

  it('GET /trends - 주/월 단위 집계 지원', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);

    const response = await fetch(
      `http://localhost:3000/api/admin/analytics/trends?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}&interval=month`,
      {
        headers: {
          'X-User-Id': 'test-admin',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.trends)).toBe(true);
  });
});

describe('Analytics API - Authorization', () => {
  it('비관리자 접근 시 403 에러', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/analytics/summary',
      {
        headers: {
          'X-User-Id': 'non-admin-user',
        },
      }
    );

    expect(response.status).toBe(403);
  });

  it('인증 없이 접근 시 401 에러', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/analytics/summary'
    );

    expect(response.status).toBe(401);
  });
});
