#!/usr/bin/env tsx

/**
 * DB Seed Script
 *
 * 초기 시드 데이터를 Supabase에 삽입합니다.
 * - 샘플 카테고리
 * - 샘플 상품
 *
 * Usage:
 * - npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';

// 환경변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('필수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n.env.local 파일을 확인하세요.');
  process.exit(1);
}

// Supabase 클라이언트 생성 (Service Role Key 사용 - RLS 우회)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * 샘플 카테고리 데이터
 */
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
  {
    slug: 'ebooks',
    name: '전자책',
    description: '프로그래밍 및 디자인 전자책',
    parent_id: null,
    sort_order: 3,
    is_active: true,
  },
  {
    slug: 'courses',
    name: '강의',
    description: '온라인 강의 및 튜토리얼',
    parent_id: null,
    sort_order: 4,
    is_active: true,
  },
];

/**
 * 샘플 상품 데이터
 */
const sampleProducts = [
  {
    slug: 'nextjs-ecommerce-template',
    name: 'Next.js E-commerce Template',
    description: 'Next.js 15 + Supabase + Toss Payments를 활용한 풀스택 이커머스 템플릿입니다.\n\n## 주요 기능\n- 상품 관리\n- 장바구니\n- 토스 페이먼츠 결제\n- 관리자 대시보드\n\n## 기술 스택\n- Next.js 15 (App Router)\n- Supabase (Auth, Database, Storage)\n- Toss Payments\n- shadcn/ui\n- Tailwind CSS',
    price: 50000,
    sale_price: 39000,
    is_featured: true,
    status: 'active',
    view_count: 0,
    sales_count: 0,
  },
  {
    slug: 'react-dashboard-ui-kit',
    name: 'React Dashboard UI Kit',
    description: 'React 19 기반의 관리자 대시보드 UI 키트입니다.\n\n## 포함 내용\n- 50+ 컴포넌트\n- 반응형 레이아웃\n- 다크 모드 지원\n- TypeScript',
    price: 30000,
    sale_price: null,
    is_featured: true,
    status: 'active',
    view_count: 0,
    sales_count: 0,
  },
  {
    slug: 'typescript-guide-ebook',
    name: 'TypeScript 완벽 가이드',
    description: 'TypeScript를 처음 배우는 개발자를 위한 완벽 가이드 전자책입니다.\n\n## 목차\n1. TypeScript 기초\n2. 타입 시스템\n3. 고급 타입\n4. 실전 프로젝트\n\n총 250페이지, PDF 형식',
    price: 15000,
    sale_price: 12000,
    is_featured: false,
    status: 'active',
    view_count: 0,
    sales_count: 0,
  },
  {
    slug: 'supabase-masterclass',
    name: 'Supabase Masterclass',
    description: 'Supabase를 활용한 풀스택 개발 강의입니다.\n\n## 강의 내용\n- Supabase 기초\n- Auth 시스템 구축\n- RLS 정책 설정\n- Storage 활용\n- Realtime 기능\n\n총 12시간, 동영상 강의',
    price: 80000,
    sale_price: 64000,
    is_featured: true,
    status: 'active',
    view_count: 0,
    sales_count: 0,
  },
];

/**
 * 샘플 태그 데이터
 */
const sampleTags = [
  { name: 'Next.js' },
  { name: 'React' },
  { name: 'TypeScript' },
  { name: 'Supabase' },
  { name: 'Tailwind CSS' },
  { name: 'UI/UX' },
  { name: '전자책' },
  { name: '강의' },
];

/**
 * 카테고리 시드
 */
async function seedCategories() {
  console.log('📁 카테고리 시드 중...');

  const { data, error } = await supabase
    .from('categories')
    .upsert(sampleCategories, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('❌ 카테고리 시드 실패:', error.message);
    throw error;
  }

  console.log(`✅ ${data.length}개 카테고리 추가됨\n`);
  return data;
}

/**
 * 상품 시드
 */
async function seedProducts(categories: any[]) {
  console.log('📦 상품 시드 중...');

  // 카테고리 ID 매핑
  const categoryMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  // 상품에 카테고리 ID 할당
  const productsWithCategory = sampleProducts.map((product, idx) => {
    const categorySlug = [
      'templates',      // 0
      'templates',      // 1
      'ebooks',         // 2
      'courses',        // 3
    ][idx];

    return {
      ...product,
      category_id: categoryMap[categorySlug],
    };
  });

  const { data, error } = await supabase
    .from('products')
    .upsert(productsWithCategory, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('❌ 상품 시드 실패:', error.message);
    throw error;
  }

  console.log(`✅ ${data.length}개 상품 추가됨\n`);
  return data;
}

/**
 * 태그 시드
 */
async function seedTags() {
  console.log('🏷️  태그 시드 중...');

  const { data, error } = await supabase
    .from('tags')
    .upsert(sampleTags, { onConflict: 'name' })
    .select();

  if (error) {
    console.error('❌ 태그 시드 실패:', error.message);
    throw error;
  }

  console.log(`✅ ${data.length}개 태그 추가됨\n`);
  return data;
}

/**
 * 상품-태그 연결
 */
async function linkProductTags(products: any[], tags: any[]) {
  console.log('🔗 상품-태그 연결 중...');

  const tagMap: Record<string, string> = {};
  tags.forEach(tag => {
    tagMap[tag.name] = tag.id;
  });

  // 상품별 태그 매핑
  const productTags = [
    // Next.js E-commerce Template
    [
      { product_id: products[0].id, tag_id: tagMap['Next.js'] },
      { product_id: products[0].id, tag_id: tagMap['TypeScript'] },
      { product_id: products[0].id, tag_id: tagMap['Supabase'] },
      { product_id: products[0].id, tag_id: tagMap['Tailwind CSS'] },
    ],
    // React Dashboard UI Kit
    [
      { product_id: products[1].id, tag_id: tagMap['React'] },
      { product_id: products[1].id, tag_id: tagMap['TypeScript'] },
      { product_id: products[1].id, tag_id: tagMap['UI/UX'] },
    ],
    // TypeScript Guide
    [
      { product_id: products[2].id, tag_id: tagMap['TypeScript'] },
      { product_id: products[2].id, tag_id: tagMap['전자책'] },
    ],
    // Supabase Masterclass
    [
      { product_id: products[3].id, tag_id: tagMap['Supabase'] },
      { product_id: products[3].id, tag_id: tagMap['강의'] },
    ],
  ].flat();

  const { error } = await supabase
    .from('product_tags')
    .upsert(productTags, { onConflict: 'product_id,tag_id', ignoreDuplicates: true });

  if (error) {
    console.error('❌ 상품-태그 연결 실패:', error.message);
    throw error;
  }

  console.log(`✅ ${productTags.length}개 상품-태그 연결됨\n`);
}

/**
 * 샘플 이미지 추가 (임시 URL)
 */
async function seedProductImages(products: any[]) {
  console.log('🖼️  상품 이미지 시드 중...');

  const images = products.map((product, idx) => ({
    product_id: product.id,
    url: `https://placehold.co/800x600/3b82f6/white?text=${encodeURIComponent(product.name)}`,
    alt_text: product.name,
    sort_order: 1,
    is_primary: true,
  }));

  const { data, error } = await supabase
    .from('product_images')
    .upsert(images, { onConflict: 'product_id,url', ignoreDuplicates: true })
    .select();

  if (error) {
    console.error('❌ 상품 이미지 시드 실패:', error.message);
    throw error;
  }

  console.log(`✅ ${data?.length || 0}개 이미지 추가됨\n`);
}

/**
 * 메인 함수
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Vibe Store - Database Seed Tool            ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    // 연결 테스트
    console.log('🔍 Supabase 연결 테스트 중...');
    const { error: pingError } = await supabase.from('profiles').select('id').limit(1);

    if (pingError && pingError.code !== 'PGRST116') {
      throw new Error('Supabase 연결 실패: ' + pingError.message);
    }

    console.log('✅ Supabase 연결 성공\n');
    console.log('='.repeat(50));

    // 시드 실행
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    const tags = await seedTags();
    await linkProductTags(products, tags);
    await seedProductImages(products);

    console.log('='.repeat(50));
    console.log('\n✅ 시드 데이터가 성공적으로 추가되었습니다!');
    console.log('\n📊 추가된 데이터:');
    console.log(`   - 카테고리: ${categories.length}개`);
    console.log(`   - 상품: ${products.length}개`);
    console.log(`   - 태그: ${tags.length}개`);
    console.log(`   - 이미지: ${products.length}개\n`);

  } catch (err: any) {
    console.error('\n❌ 시드 실패:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 예외 발생:', err);
  process.exit(1);
});
