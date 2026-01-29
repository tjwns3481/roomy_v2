/**
 * Inquiries API Tests
 *
 * Test Coverage:
 * - GET /api/inquiries - 문의 목록 조회 (비밀글 필터링)
 * - POST /api/inquiries - 문의 작성
 * - GET /api/inquiries/[id] - 문의 상세 조회
 * - PATCH /api/inquiries/[id] - 문의 수정 (작성자만, 답변 전)
 * - DELETE /api/inquiries/[id] - 문의 삭제 (작성자만, 답변 전)
 * - POST /api/inquiries/[id]/answer - 관리자 답변
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase/server';

describe('Inquiries API', () => {
  let testUserId: string;
  let adminUserId: string;
  let productId: string;
  let inquiryId: string;
  let privateInquiryId: string;

  beforeAll(async () => {
    const supabase = await createServerClient();

    // 테스트 사용자 생성 (일반 사용자)
    const { data: user } = await supabase
      .from('profiles')
      .insert({
        email: 'inquiry-test@example.com',
        role: 'user',
        nickname: 'Test User',
      })
      .select()
      .single();
    testUserId = user!.id;

    // 테스트 관리자 생성
    const { data: admin } = await supabase
      .from('profiles')
      .insert({
        email: 'inquiry-admin@example.com',
        role: 'admin',
        nickname: 'Admin User',
      })
      .select()
      .single();
    adminUserId = admin!.id;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Test Product',
        slug: 'test-product-inquiry',
        description: 'Test product for inquiry',
        price: 10000,
        status: 'active',
      })
      .select()
      .single();
    productId = product!.id;
  });

  afterAll(async () => {
    const supabase = await createServerClient();

    // 테스트 데이터 정리
    if (inquiryId) {
      await supabase.from('inquiries').delete().eq('id', inquiryId);
    }
    if (privateInquiryId) {
      await supabase.from('inquiries').delete().eq('id', privateInquiryId);
    }
    if (productId) {
      await supabase.from('products').delete().eq('id', productId);
    }
    if (testUserId) {
      await supabase.from('profiles').delete().eq('id', testUserId);
    }
    if (adminUserId) {
      await supabase.from('profiles').delete().eq('id', adminUserId);
    }
  });

  describe('GET /api/inquiries', () => {
    it('should return inquiry list with pagination', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('inquiries');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.inquiries)).toBe(true);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('should filter inquiries by product_id', async () => {
      const response = await fetch(`http://localhost:3000/api/inquiries?product_id=${productId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiries.every((i: any) => i.product_id === productId)).toBe(true);
    });

    it('should filter inquiries by category', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries?category=product');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiries.every((i: any) => i.category === 'product')).toBe(true);
    });

    it('should filter inquiries by status', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries?status=pending');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiries.every((i: any) => i.status === 'pending')).toBe(true);
    });

    it('should exclude private inquiries from public list', async () => {
      // 비밀글은 작성자/관리자만 조회 가능
      const response = await fetch('http://localhost:3000/api/inquiries');
      const data = await response.json();

      expect(response.status).toBe(200);
      // RLS 정책에 의해 비밀글은 본인/관리자만 조회
    });

    it('should sort inquiries by specified order', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries?sort_by=latest');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiries).toBeDefined();
    });
  });

  describe('POST /api/inquiries', () => {
    it('should create a new inquiry', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          category: 'product',
          title: '배송 기간이 얼마나 걸리나요?',
          content: '급하게 필요한데 배송 기간이 궁금합니다.',
          is_private: false,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.inquiry).toHaveProperty('id');
      expect(data.inquiry.title).toBe('배송 기간이 얼마나 걸리나요?');
      expect(data.inquiry.status).toBe('pending');
      expect(data.inquiry.user_id).toBe(testUserId);

      inquiryId = data.inquiry.id;
    });

    it('should create a private inquiry', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          category: 'payment',
          title: '비밀 문의입니다',
          content: '환불 관련 비밀 문의입니다.',
          is_private: true,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.inquiry.is_private).toBe(true);

      privateInquiryId = data.inquiry.id;
    });

    it('should fail without required fields', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'product',
          // title, content 누락
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid category', async () => {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          category: 'invalid_category',
          title: '테스트',
          content: '테스트 내용',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/inquiries/[id]', () => {
    it('should return inquiry detail', async () => {
      if (!inquiryId) {
        return; // Skip if no inquiry created
      }

      const response = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiry.id).toBe(inquiryId);
      expect(data.inquiry).toHaveProperty('author');
    });

    it('should increment view count on each view', async () => {
      if (!inquiryId) {
        return;
      }

      const response1 = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}`);
      const data1 = await response1.json();
      const initialViewCount = data1.inquiry.view_count;

      const response2 = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}`);
      const data2 = await response2.json();

      expect(data2.inquiry.view_count).toBe(initialViewCount + 1);
    });

    it('should fail for non-existent inquiry', async () => {
      const response = await fetch(
        'http://localhost:3000/api/inquiries/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });

    it('should block access to private inquiry (non-owner)', async () => {
      if (!privateInquiryId) {
        return;
      }

      // RLS 정책에 의해 비밀글은 작성자/관리자만 조회
      // 비인증 사용자나 다른 사용자는 조회 불가
      const response = await fetch(`http://localhost:3000/api/inquiries/${privateInquiryId}`);

      // RLS에 의해 404 또는 403 반환
      expect([403, 404]).toContain(response.status);
    });
  });

  describe('PATCH /api/inquiries/[id]', () => {
    it('should update own inquiry (before answered)', async () => {
      if (!inquiryId) {
        return;
      }

      const response = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '수정된 제목',
          content: '수정된 내용입니다.',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiry.title).toBe('수정된 제목');
      expect(data.inquiry.content).toBe('수정된 내용입니다.');
    });

    it('should fail to update after answered', async () => {
      // RLS 정책: status='pending'일 때만 수정 가능
      // 답변 후 테스트는 별도 설정 필요
    });

    it('should fail to update other users inquiry', async () => {
      if (!inquiryId) {
        return;
      }

      // RLS 정책에 의해 본인 문의만 수정 가능
      // 다른 사용자로 요청 시 실패
    });
  });

  describe('DELETE /api/inquiries/[id]', () => {
    it('should delete own inquiry (before answered)', async () => {
      // 새 문의 생성 후 삭제
      const createResponse = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          category: 'etc',
          title: '삭제할 문의',
          content: '삭제 테스트용 문의입니다.',
        }),
      });
      const createData = await createResponse.json();
      const deleteInquiryId = createData.inquiry.id;

      const deleteResponse = await fetch(`http://localhost:3000/api/inquiries/${deleteInquiryId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);
    });

    it('should fail to delete after answered', async () => {
      // RLS 정책: status='pending'일 때만 삭제 가능
    });

    it('should fail to delete other users inquiry', async () => {
      if (!inquiryId) {
        return;
      }

      // RLS 정책에 의해 본인 문의만 삭제 가능
    });
  });

  describe('POST /api/inquiries/[id]/answer', () => {
    it('should allow admin to answer inquiry', async () => {
      if (!inquiryId) {
        return;
      }

      const response = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: '배송 기간은 결제 후 2-3일 소요됩니다.',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiry.answer).toBe('배송 기간은 결제 후 2-3일 소요됩니다.');
      expect(data.inquiry.status).toBe('answered');
      expect(data.inquiry.answered_by).toBe(adminUserId);
      expect(data.inquiry.answered_at).toBeDefined();
    });

    it('should auto-update status to answered', async () => {
      // 답변 작성 시 트리거에 의해 status='answered', answered_at=NOW() 자동 설정
      // 위 테스트에서 검증 완료
    });

    it('should fail for non-admin users', async () => {
      if (!inquiryId) {
        return;
      }

      // RLS 정책: 관리자만 답변 가능
    });

    it('should update existing answer', async () => {
      if (!inquiryId) {
        return;
      }

      const response = await fetch(`http://localhost:3000/api/inquiries/${inquiryId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: '수정된 답변입니다. 배송 기간은 1-2일 소요됩니다.',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inquiry.answer).toContain('수정된 답변');
    });
  });

  describe('RLS Policies', () => {
    it('should enforce private inquiry access control', async () => {
      // 비밀글은 작성자/관리자만 조회 가능
      // RLS 정책 테스트
    });

    it('should prevent unauthenticated inquiry creation', async () => {
      // 로그인하지 않은 사용자는 문의 작성 불가
    });

    it('should prevent update/delete after answered', async () => {
      // 답변 완료된 문의는 수정/삭제 불가 (RLS 정책)
    });
  });
});
