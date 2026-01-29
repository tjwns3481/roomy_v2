/**
 * Products API Route Tests
 *
 * Tests for:
 * - GET /api/products - 상품 목록 조회
 * - GET /api/products/[slug] - 상품 상세 조회
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase 테스트 클라이언트 (환경 변수 필요)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('GET /api/products', () => {
  let testProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // 테스트 카테고리 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({
        name: 'Test Category',
        slug: 'test-category',
        is_active: true,
        sort_order: 1,
      })
      .select()
      .single();

    testCategoryId = category.id;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        category_id: testCategoryId,
        name: 'Test Product',
        slug: 'test-product',
        short_description: 'Test short description',
        description: 'Test description',
        price: 10000,
        type: 'digital',
        status: 'active',
        is_featured: true,
        view_count: 100,
        sales_count: 50,
      })
      .select()
      .single();

    testProductId = product.id;

    // 비활성 상품도 추가 (필터링 테스트용)
    await supabase.from('products').insert({
      category_id: testCategoryId,
      name: 'Draft Product',
      slug: 'draft-product',
      price: 5000,
      type: 'digital',
      status: 'draft',
      is_featured: false,
      view_count: 0,
      sales_count: 0,
    });

    // 태그 추가
    const { data: tag } = await supabase
      .from('tags')
      .insert({
        name: 'Test Tag',
        slug: 'test-tag',
      })
      .select()
      .single();

    await supabase.from('product_tags').insert({
      product_id: testProductId,
      tag_id: tag.id,
    });

    // 이미지 추가
    await supabase.from('product_images').insert({
      product_id: testProductId,
      url: 'https://example.com/image.jpg',
      alt_text: 'Test image',
      sort_order: 1,
      is_primary: true,
    });

    // 파일 추가 (is_preview=true)
    await supabase.from('product_files').insert({
      product_id: testProductId,
      name: 'preview.pdf',
      storage_path: 'products/test/preview.pdf',
      size: 1024,
      mime_type: 'application/pdf',
      download_limit: 3,
      download_days: 7,
      is_preview: true,
    });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await supabase.from('product_tags').delete().eq('product_id', testProductId);
    await supabase.from('product_images').delete().eq('product_id', testProductId);
    await supabase.from('product_files').delete().eq('product_id', testProductId);
    await supabase.from('products').delete().eq('category_id', testCategoryId);
    await supabase.from('categories').delete().eq('id', testCategoryId);
    await supabase.from('tags').delete().eq('slug', 'test-tag');
  });

  it('기본 상품 목록을 반환해야 함 (페이지네이션 적용)', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('products');
    expect(data).toHaveProperty('pagination');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.pagination.limit).toBe(12);
    expect(data.pagination.page).toBe(1);
  });

  it('status=active인 상품만 반환해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();

    // 모든 상품이 active 상태인지 확인
    const allActive = data.products.every((p: any) => p.status === 'active');
    expect(allActive).toBe(true);
  });

  it('페이지네이션 파라미터를 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?page=2&limit=5');
    const data = await response.json();

    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(5);
  });

  it('카테고리 필터를 적용해야 함', async () => {
    const response = await fetch(
      `http://localhost:3000/api/products?category=${testCategoryId}`
    );
    const data = await response.json();

    // 모든 상품이 해당 카테고리에 속하는지 확인
    const allInCategory = data.products.every(
      (p: any) => p.category_id === testCategoryId
    );
    expect(allInCategory).toBe(true);
  });

  it('가격 필터를 적용해야 함', async () => {
    const response = await fetch(
      'http://localhost:3000/api/products?minPrice=8000&maxPrice=12000'
    );
    const data = await response.json();

    // 모든 상품이 가격 범위 내에 있는지 확인
    const allInRange = data.products.every(
      (p: any) => p.price >= 8000 && p.price <= 12000
    );
    expect(allInRange).toBe(true);
  });

  it('검색어 필터를 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?search=Test');
    const data = await response.json();

    // 검색어가 이름에 포함되는지 확인
    const allMatch = data.products.every((p: any) =>
      p.name.toLowerCase().includes('test')
    );
    expect(allMatch).toBe(true);
  });

  it('인기순 정렬을 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?sort=popular');
    const data = await response.json();

    // 판매수 내림차순으로 정렬되었는지 확인
    for (let i = 1; i < data.products.length; i++) {
      expect(data.products[i - 1].sales_count).toBeGreaterThanOrEqual(
        data.products[i].sales_count
      );
    }
  });

  it('최신순 정렬을 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?sort=newest');
    const data = await response.json();

    // 생성일 내림차순으로 정렬되었는지 확인
    for (let i = 1; i < data.products.length; i++) {
      expect(new Date(data.products[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(
        new Date(data.products[i].created_at).getTime()
      );
    }
  });

  it('가격 오름차순 정렬을 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?sort=price_asc');
    const data = await response.json();

    // 가격 오름차순으로 정렬되었는지 확인
    for (let i = 1; i < data.products.length; i++) {
      expect(data.products[i - 1].price).toBeLessThanOrEqual(data.products[i].price);
    }
  });

  it('가격 내림차순 정렬을 적용해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?sort=price_desc');
    const data = await response.json();

    // 가격 내림차순으로 정렬되었는지 확인
    for (let i = 1; i < data.products.length; i++) {
      expect(data.products[i - 1].price).toBeGreaterThanOrEqual(data.products[i].price);
    }
  });

  it('총 페이지 수를 올바르게 계산해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products?limit=12');
    const data = await response.json();

    const expectedTotalPages = Math.ceil(data.pagination.total / 12);
    expect(data.pagination.totalPages).toBe(expectedTotalPages);
  });
});

describe('GET /api/products/[slug]', () => {
  let testProductId: string;
  let testCategoryId: string;
  const testSlug = 'test-product-detail';

  beforeAll(async () => {
    // 테스트 카테고리 생성
    const { data: category } = await supabase
      .from('categories')
      .insert({
        name: 'Test Category Detail',
        slug: 'test-category-detail',
        is_active: true,
        sort_order: 1,
      })
      .select()
      .single();

    testCategoryId = category.id;

    // 테스트 상품 생성
    const { data: product } = await supabase
      .from('products')
      .insert({
        category_id: testCategoryId,
        name: 'Test Product Detail',
        slug: testSlug,
        short_description: 'Short desc',
        description: 'Full description',
        price: 20000,
        type: 'digital',
        status: 'active',
        is_featured: false,
        view_count: 0,
        sales_count: 0,
      })
      .select()
      .single();

    testProductId = product.id;

    // 이미지 추가
    await supabase.from('product_images').insert([
      {
        product_id: testProductId,
        url: 'https://example.com/image1.jpg',
        alt_text: 'Image 1',
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: testProductId,
        url: 'https://example.com/image2.jpg',
        alt_text: 'Image 2',
        sort_order: 2,
        is_primary: false,
      },
    ]);

    // 파일 추가 (is_preview=true와 false 모두)
    await supabase.from('product_files').insert([
      {
        product_id: testProductId,
        name: 'preview.pdf',
        storage_path: 'products/test/preview.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        download_limit: 3,
        download_days: 7,
        is_preview: true,
      },
      {
        product_id: testProductId,
        name: 'full.pdf',
        storage_path: 'products/test/full.pdf',
        size: 10240,
        mime_type: 'application/pdf',
        download_limit: 3,
        download_days: 7,
        is_preview: false,
      },
    ]);

    // 태그 추가
    const { data: tag } = await supabase
      .from('tags')
      .insert({
        name: 'Test Tag Detail',
        slug: 'test-tag-detail',
      })
      .select()
      .single();

    await supabase.from('product_tags').insert({
      product_id: testProductId,
      tag_id: tag.id,
    });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await supabase.from('product_tags').delete().eq('product_id', testProductId);
    await supabase.from('product_images').delete().eq('product_id', testProductId);
    await supabase.from('product_files').delete().eq('product_id', testProductId);
    await supabase.from('products').delete().eq('id', testProductId);
    await supabase.from('categories').delete().eq('id', testCategoryId);
    await supabase.from('tags').delete().eq('slug', 'test-tag-detail');
  });

  it('slug로 상품 상세 정보를 반환해야 함', async () => {
    const response = await fetch(`http://localhost:3000/api/products/${testSlug}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('product');
    expect(data.product.slug).toBe(testSlug);
  });

  it('상품과 함께 이미지를 포함해야 함', async () => {
    const response = await fetch(`http://localhost:3000/api/products/${testSlug}`);
    const data = await response.json();

    expect(data.product).toHaveProperty('images');
    expect(Array.isArray(data.product.images)).toBe(true);
    expect(data.product.images.length).toBe(2);
    expect(data.product.images[0].url).toBe('https://example.com/image1.jpg');
  });

  it('상품과 함께 미리보기 파일만 포함해야 함', async () => {
    const response = await fetch(`http://localhost:3000/api/products/${testSlug}`);
    const data = await response.json();

    expect(data.product).toHaveProperty('files');
    expect(Array.isArray(data.product.files)).toBe(true);
    // is_preview=true인 파일만 반환
    expect(data.product.files.length).toBe(1);
    expect(data.product.files[0].name).toBe('preview.pdf');
    expect(data.product.files[0].is_preview).toBe(true);
  });

  it('상품과 함께 태그를 포함해야 함', async () => {
    const response = await fetch(`http://localhost:3000/api/products/${testSlug}`);
    const data = await response.json();

    expect(data.product).toHaveProperty('tags');
    expect(Array.isArray(data.product.tags)).toBe(true);
    expect(data.product.tags.length).toBe(1);
    expect(data.product.tags[0].name).toBe('Test Tag Detail');
  });

  it('존재하지 않는 slug는 404를 반환해야 함', async () => {
    const response = await fetch('http://localhost:3000/api/products/non-existent-slug');
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('draft 상태 상품은 404를 반환해야 함', async () => {
    // draft 상품 생성
    const { data: draftProduct } = await supabase
      .from('products')
      .insert({
        category_id: testCategoryId,
        name: 'Draft Product',
        slug: 'draft-product-slug',
        price: 5000,
        type: 'digital',
        status: 'draft',
        is_featured: false,
        view_count: 0,
        sales_count: 0,
      })
      .select()
      .single();

    const response = await fetch('http://localhost:3000/api/products/draft-product-slug');

    expect(response.status).toBe(404);

    // 정리
    await supabase.from('products').delete().eq('id', draftProduct.id);
  });
});
