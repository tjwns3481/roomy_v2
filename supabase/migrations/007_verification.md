# Migration 007 Verification Checklist

## Task: P0-T0.5.7
## Date: 2026-01-25

---

## Created Functions

### 1. Helper Functions
- [x] `is_admin(user_id UUID)` - 관리자 확인
  - SECURITY DEFINER
  - STABLE
  - Returns BOOLEAN

### 2. View/Sales Count Functions
- [x] `increment_product_view_count(product_id UUID)` - 상품 조회수 증가
  - SECURITY DEFINER
  - Returns VOID

- [x] `increment_product_sales_count(product_id UUID)` - 상품 판매수 증가
  - SECURITY DEFINER
  - Returns VOID

### 3. Trigger Functions
- [x] `on_order_paid_increment_sales()` - 주문 결제 완료 시 판매수 증가
  - Trigger: `trigger_order_paid_increment_sales`
  - Table: `orders`
  - Event: AFTER UPDATE

### 4. Download Functions
- [x] `can_download(download_id, user_id, guest_email)` - 다운로드 권한 확인
  - 만료일 검증
  - 다운로드 횟수 검증
  - 소유권 검증
  - 주문 상태 검증

- [x] `record_download(download_id)` - 다운로드 기록
  - 다운로드 횟수 증가
  - 마지막 다운로드 시간 업데이트

---

## Enhanced RLS Policies

### 1. profiles
- [x] "Anyone can view public profile info" (새로 추가)
  - 후기/댓글 작성자 공개 정보 조회 가능

### 2. product_files
- [x] "Purchasers can view purchased files" (재작성)
  - 미리보기 파일: 누구나 조회
  - 관리자: 모든 파일 조회
  - 구매자: 구매한 파일만 조회 (downloads 테이블 확인)

### 3. downloads
- [x] "Only system can create downloads" (새로 추가)
  - 사용자가 직접 다운로드 레코드 생성 방지
  - 관리자만 INSERT 가능

### 4. order_items
- [x] "Only admins can update order items" (새로 추가)
  - 관리자만 주문 상품 수정 가능

---

## RLS Status Check

All tables should have RLS enabled:

- [x] profiles
- [x] categories
- [x] products
- [x] product_images
- [x] product_files
- [x] tags
- [x] product_tags
- [x] cart_items
- [x] orders
- [x] order_items
- [x] downloads

---

## Test Cases (수동 테스트 필요)

### Test 1: 관리자 확인 함수
```sql
-- 관리자 계정으로 테스트
SELECT is_admin(); -- Expected: true

-- 일반 사용자로 테스트
SELECT is_admin(); -- Expected: false
```

### Test 2: 조회수 증가
```sql
-- 상품 조회수 증가 전
SELECT view_count FROM products WHERE id = 'test-product-id';

-- 조회수 증가
SELECT increment_product_view_count('test-product-id');

-- 조회수 증가 후
SELECT view_count FROM products WHERE id = 'test-product-id';
-- Expected: +1
```

### Test 3: 다운로드 권한 확인
```sql
-- 유효한 다운로드
SELECT can_download('valid-download-id', auth.uid(), NULL);
-- Expected: true

-- 만료된 다운로드
SELECT can_download('expired-download-id', auth.uid(), NULL);
-- Expected: false

-- 다운로드 횟수 초과
SELECT can_download('maxed-download-id', auth.uid(), NULL);
-- Expected: false
```

### Test 4: 판매수 자동 증가
```sql
-- 주문 생성
INSERT INTO orders (...) VALUES (...);

-- 주문 결제 완료
UPDATE orders SET status = 'paid' WHERE id = 'test-order-id';

-- 판매수 확인
SELECT sales_count FROM products WHERE id = 'product-in-order';
-- Expected: +1 (quantity만큼 증가)
```

### Test 5: RLS 정책 테스트
```sql
-- 일반 사용자: 다른 사용자 주문 조회 불가
SELECT * FROM orders WHERE user_id != auth.uid();
-- Expected: 0 rows

-- 관리자: 모든 주문 조회 가능
SELECT * FROM orders; -- as admin
-- Expected: all rows

-- 구매자: 구매한 파일만 조회 가능
SELECT * FROM product_files pf
WHERE EXISTS (
  SELECT 1 FROM downloads d
  JOIN order_items oi ON d.order_item_id = oi.id
  JOIN orders o ON oi.order_id = o.id
  WHERE d.product_file_id = pf.id
  AND o.user_id = auth.uid()
);
-- Expected: only purchased files
```

---

## Storage Bucket Policies (수동 설정 필요)

Supabase Dashboard에서 `product_files` 버킷 생성 후 정책 설정:

### SELECT (조회)
```sql
-- 미리보기 파일
bucket_id = 'product_files' AND (storage.foldername(name))[1] = 'preview'

-- 구매자가 구매한 파일
bucket_id = 'product_files' AND EXISTS (
  SELECT 1
  FROM downloads d
  JOIN order_items oi ON d.order_item_id = oi.id
  JOIN orders o ON oi.order_id = o.id
  JOIN product_files pf ON d.product_file_id = pf.id
  WHERE pf.file_path = name
  AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
  AND o.status IN ('paid', 'completed')
  AND d.expires_at > NOW()
  AND d.download_count < d.max_downloads
)
```

### INSERT/UPDATE/DELETE (관리)
```sql
bucket_id = 'product_files' AND is_admin()
```

---

## Next Steps

1. [ ] Supabase 프로젝트 연결 (`supabase link`)
2. [ ] 마이그레이션 적용 (`supabase db push`)
3. [ ] 테스트 관리자 계정 생성 (admin@vibestore.com)
4. [ ] Storage 버킷 생성 및 정책 설정
5. [ ] 위 테스트 케이스 실행
6. [ ] RLS 정책 검증 완료

---

## Known Issues / Limitations

- **비회원 주문**: guest_email로 다운로드 권한 확인 시 세션 관리 필요
- **Storage 정책**: SQL 마이그레이션으로 설정 불가, 수동 설정 필요
- **다운로드 횟수 경합**: 동시 다운로드 시 race condition 가능 (트랜잭션 필요)

---

## Success Criteria

- [x] 모든 테이블 RLS 활성화
- [x] 헬퍼 함수 생성 (is_admin)
- [x] 조회수/판매수 증가 함수 생성
- [x] 다운로드 권한 확인 함수 생성
- [x] 주문 결제 시 판매수 자동 증가 트리거
- [x] RLS 정책 보완 (profiles, product_files, downloads, order_items)
- [ ] 마이그레이션 적용 (Supabase 연결 필요)
- [ ] 테스트 케이스 통과 (수동 테스트)

---

## Migration File
- Path: `/Users/futurewave/Documents/dev/vibeShop/supabase/migrations/007_create_rls_policies.sql`
- Size: ~10KB
- Functions: 6
- Triggers: 1
- RLS Policies: 4 enhanced/new
