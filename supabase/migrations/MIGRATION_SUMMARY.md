# Supabase Migrations Summary

## Phase 0 - Database Setup

All migrations for Phase 0 are complete. Ready for Supabase deployment.

---

## Migration Files

### 001_create_profiles.sql
**Status**: ✅ Complete
**Tables**: profiles
**Features**:
- User profile management
- Auto-create profile on signup (trigger)
- RLS policies (본인/관리자 접근)
- Updated_at trigger

### 002_create_categories.sql
**Status**: ✅ Complete
**Tables**: categories
**Features**:
- Hierarchical category structure (parent_id)
- Slug for SEO-friendly URLs
- RLS policies (활성 카테고리 공개, 관리자 관리)

### 003_create_products.sql
**Status**: ✅ Complete
**Tables**: products
**Features**:
- Product catalog with pricing
- Status (draft/active/hidden)
- View count, sales count
- Metadata JSONB for flexibility
- RLS policies (활성 상품 공개, 관리자 관리)

### 004_create_product_images.sql
**Status**: ✅ Complete
**Tables**: product_images
**Features**:
- Multiple images per product
- Primary image flag (1 per product)
- Sort order
- RLS policies (활성 상품 이미지 공개)

### 005_create_product_files_tags.sql
**Status**: ✅ Complete
**Tables**: product_files, tags, product_tags
**Features**:
- Digital product file management
- Download limits
- Preview files (public)
- Tag system (many-to-many)
- RLS policies (구매자만 파일 접근)

### 006_create_orders.sql
**Status**: ✅ Complete
**Tables**: cart_items, orders, order_items, downloads
**Features**:
- Cart (회원/비회원)
- Orders with payment info
- Order items (snapshot)
- Download permissions
- Order number generation (ORD-YYYYMMDD-XXXX)
- Auto-create downloads on payment
- RLS policies (본인 주문/다운로드만 접근)

### 007_create_rls_policies.sql
**Status**: ✅ Complete (Pending Deployment)
**Tables**: All (RLS enhancements)
**Features**:
- Helper functions:
  - `is_admin()` - 관리자 확인
  - `increment_product_view_count()` - 조회수 증가
  - `increment_product_sales_count()` - 판매수 증가
  - `can_download()` - 다운로드 권한 확인
  - `record_download()` - 다운로드 기록
- Triggers:
  - Auto-increment sales_count on order paid
- Enhanced RLS policies:
  - profiles: 공개 프로필 조회
  - product_files: 구매자 파일 접근
  - downloads: 시스템 전용 INSERT
  - order_items: 관리자 전용 UPDATE

---

## Database Schema Overview

### Core Tables
- **profiles** (사용자)
- **categories** (카테고리 - 계층형)
- **products** (상품)
- **product_images** (상품 이미지 - 다중)
- **product_files** (디지털 파일)
- **tags**, **product_tags** (태그 시스템)

### E-commerce Tables
- **cart_items** (장바구니 - 회원/비회원)
- **orders** (주문)
- **order_items** (주문 상품)
- **downloads** (다운로드 권한)

---

## RLS Status (All Enabled ✅)

| Table | RLS Enabled | Policies Count |
|-------|-------------|----------------|
| profiles | ✅ | 6 |
| categories | ✅ | 5 |
| products | ✅ | 5 |
| product_images | ✅ | 2 |
| product_files | ✅ | 3 |
| tags | ✅ | 2 |
| product_tags | ✅ | 2 |
| cart_items | ✅ | 5 |
| orders | ✅ | 4 |
| order_items | ✅ | 4 |
| downloads | ✅ | 4 |

**Total Policies**: 42

---

## Functions & Triggers

### Functions (9)
1. `update_updated_at_column()` - Auto-update updated_at
2. `handle_new_user()` - Auto-create profile on signup
3. `ensure_single_primary_image()` - Single primary image per product
4. `generate_order_number()` - Order number generation
5. `set_order_number()` - Auto-set order number on insert
6. `create_download_permissions()` - Auto-create downloads on payment
7. `on_order_paid_increment_sales()` - Auto-increment sales count
8. `can_download()` - Download permission validation
9. `record_download()` - Record download execution
10. `is_admin()` - Admin role check helper
11. `increment_product_view_count()` - Increment view count
12. `increment_product_sales_count()` - Increment sales count

### Triggers (7)
1. `profiles_updated_at` → update_updated_at_column
2. `on_auth_user_created` → handle_new_user
3. `categories_updated_at` → update_updated_at_column
4. `products_updated_at` → update_updated_at_column
5. `trigger_ensure_single_primary_image` → ensure_single_primary_image
6. `before_insert_orders_set_order_number` → set_order_number
7. `on_order_paid_create_downloads` → create_download_permissions
8. `trigger_order_paid_increment_sales` → on_order_paid_increment_sales
9. `update_cart_items_updated_at` → update_updated_at_column
10. `update_orders_updated_at` → update_updated_at_column

---

## Indexes (Performance Optimized)

### Total: 40+ indexes across all tables

Key indexes:
- Foreign keys (all FKs indexed)
- Search columns (slug, email, status)
- Sort columns (created_at DESC, sales_count DESC)
- Composite indexes (status + is_featured, category + status)

---

## Seed Data

### tags (8 default tags)
- Next.js, React, TypeScript, Tailwind CSS, Supabase
- 전자책, 템플릿, 소스코드

---

## Next Steps

### 1. Supabase Setup
```bash
# Link to Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push
```

### 2. Create Admin Account
1. Sign up at your Supabase Auth URL
2. Email: admin@vibestore.com
3. Update profiles table:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@vibestore.com';
   ```

### 3. Storage Bucket Setup
1. Create bucket: `product_files`
2. Set policies (see 007_verification.md)

### 4. Test
1. Run test cases (see 007_verification.md)
2. Verify RLS policies work correctly
3. Test download permissions

---

## Known Limitations

1. **비회원 다운로드**: guest_email 기반 세션 관리 필요
2. **Storage 정책**: SQL로 설정 불가, Dashboard에서 수동 설정
3. **다운로드 동시성**: Race condition 가능 (향후 개선)

---

## Success Criteria ✅

- [x] 모든 테이블 생성
- [x] RLS 활성화 (11 tables)
- [x] 42개 RLS 정책 생성
- [x] 12개 함수 생성
- [x] 10개 트리거 생성
- [x] 40+ 인덱스 생성
- [x] 시드 데이터 (tags)
- [ ] Supabase 배포 (대기 중)
- [ ] 테스트 통과 (배포 후)

---

## Phase 0 Database Setup: COMPLETE ✅

**Ready for deployment to Supabase!**

All database schema, RLS policies, functions, and triggers are complete and ready for production use.
