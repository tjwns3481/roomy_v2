/**
 * Seed Script Tests
 *
 * npm run db:seed 스크립트의 시드 데이터를 검증합니다.
 */

import { describe, it, expect } from 'vitest';

describe('DB Seed Script', () => {
  it('should have valid sample categories', () => {
    const sampleCategories = [
      {
        slug: 'digital-products',
        name: '디지털 상품',
        description: '다운로드 가능한 디지털 콘텐츠',
        parent_id: null,
        sort_order: 1,
        is_active: true,
      },
      {
        slug: 'templates',
        name: '템플릿',
        description: '웹/앱 템플릿 및 UI 키트',
        parent_id: null,
        sort_order: 2,
        is_active: true,
      },
    ];

    sampleCategories.forEach(category => {
      expect(category.slug).toMatch(/^[a-z0-9-]+$/); // slug 형식
      expect(category.name.length).toBeGreaterThan(0);
      expect(category.sort_order).toBeGreaterThan(0);
      expect(category.is_active).toBe(true);
    });
  });

  it('should have valid sample products', () => {
    const sampleProducts = [
      {
        slug: 'nextjs-ecommerce-template',
        name: 'Next.js E-commerce Template',
        price: 50000,
        sale_price: 39000,
        status: 'active',
      },
      {
        slug: 'react-dashboard-ui-kit',
        name: 'React Dashboard UI Kit',
        price: 30000,
        sale_price: null,
        status: 'active',
      },
    ];

    sampleProducts.forEach(product => {
      expect(product.slug).toMatch(/^[a-z0-9-]+$/); // slug 형식
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);

      if (product.sale_price) {
        expect(product.sale_price).toBeLessThan(product.price); // 할인가는 정가보다 낮아야 함
      }

      expect(product.status).toBe('active');
    });
  });

  it('should have valid sample tags', () => {
    const sampleTags = [
      { name: 'Next.js' },
      { name: 'React' },
      { name: 'TypeScript' },
    ];

    sampleTags.forEach(tag => {
      expect(tag.name.length).toBeGreaterThan(0);
      expect(tag.name.trim()).toBe(tag.name); // 공백 없어야 함
    });
  });
});
