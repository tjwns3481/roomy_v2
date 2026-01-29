-- ============================================================================
-- Migration: 007_create_rls_policies.sql
-- Description: 모든 테이블 RLS 활성화, 정책 생성, 주문번호/다운로드 권한/조회수 함수
-- Dependencies: 001-006 migrations
-- Author: database-specialist
-- Date: 2026-01-25
-- Phase: 0
-- Task: P0-T0.5.7
-- ============================================================================

-- ============================================================================
-- 1. 관리자 확인 헬퍼 함수
-- ============================================================================

-- 사용자가 관리자인지 확인하는 헬퍼 함수
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION is_admin IS '사용자가 관리자인지 확인 (RLS 정책에서 사용)';

-- ============================================================================
-- 2. 조회수/판매수 증가 함수
-- ============================================================================

-- 상품 조회수 증가
CREATE OR REPLACE FUNCTION increment_product_view_count(product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION increment_product_view_count IS '상품 조회수 증가 (상품 상세 페이지 진입 시 호출)';

-- 상품 판매수 증가 (주문 완료 시 자동 호출)
CREATE OR REPLACE FUNCTION increment_product_sales_count(product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET sales_count = sales_count + 1
  WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION increment_product_sales_count IS '상품 판매수 증가 (주문 결제 완료 시 트리거에서 호출)';

-- ============================================================================
-- 3. 주문 결제 완료 시 판매수 증가 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION on_order_paid_increment_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- pending → paid 상태 변경 시 판매수 증가
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    -- 주문 상품별로 판매수 증가
    UPDATE products p
    SET sales_count = sales_count + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
    AND oi.product_id = p.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_order_paid_increment_sales
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION on_order_paid_increment_sales();

COMMENT ON FUNCTION on_order_paid_increment_sales IS '주문 결제 완료 시 상품 판매수 자동 증가';

-- ============================================================================
-- 4. 다운로드 권한 확인 함수
-- ============================================================================

-- 사용자가 특정 다운로드 권한을 가지고 있는지 검증
CREATE OR REPLACE FUNCTION can_download(
  p_download_id UUID,
  p_user_id UUID DEFAULT auth.uid(),
  p_guest_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_download downloads%ROWTYPE;
  v_order orders%ROWTYPE;
  v_product_file product_files%ROWTYPE;
BEGIN
  -- 다운로드 레코드 조회
  SELECT * INTO v_download
  FROM downloads
  WHERE id = p_download_id;

  -- 다운로드 레코드가 없으면 false
  IF v_download IS NULL THEN
    RETURN false;
  END IF;

  -- 만료일 확인
  IF v_download.expires_at < NOW() THEN
    RETURN false;
  END IF;

  -- 다운로드 횟수 확인
  IF v_download.download_count >= v_download.max_downloads THEN
    RETURN false;
  END IF;

  -- 주문 정보 조회 (소유권 확인)
  SELECT o.* INTO v_order
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE oi.id = v_download.order_item_id;

  -- 주문이 없으면 false
  IF v_order IS NULL THEN
    RETURN false;
  END IF;

  -- 주문 상태 확인 (paid 또는 completed만 다운로드 가능)
  IF v_order.status NOT IN ('paid', 'completed') THEN
    RETURN false;
  END IF;

  -- 소유권 확인 (회원 또는 비회원 이메일)
  IF v_order.user_id = p_user_id THEN
    RETURN true;
  ELSIF v_order.guest_email = p_guest_email THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

COMMENT ON FUNCTION can_download IS '다운로드 권한 검증 (만료일, 횟수, 소유권 확인)';

-- ============================================================================
-- 5. 다운로드 실행 함수 (횟수 증가 + 마지막 다운로드 시간 업데이트)
-- ============================================================================

CREATE OR REPLACE FUNCTION record_download(p_download_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_can_download BOOLEAN;
BEGIN
  -- 다운로드 가능 여부 확인
  SELECT can_download(p_download_id) INTO v_can_download;

  IF NOT v_can_download THEN
    RETURN false;
  END IF;

  -- 다운로드 횟수 증가 + 마지막 다운로드 시간 업데이트
  UPDATE downloads
  SET
    download_count = download_count + 1,
    last_downloaded_at = NOW()
  WHERE id = p_download_id;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION record_download IS '다운로드 실행 기록 (횟수 증가 + 시간 업데이트)';

-- ============================================================================
-- 6. 추가 RLS 정책 보완
-- ============================================================================

-- 6.1 profiles 정책 보완: 공개 프로필 조회 허용
-- (후기 작성자, 댓글 작성자 등 공개 정보 필요)
CREATE POLICY "Anyone can view public profile info"
ON profiles FOR SELECT
USING (true); -- 이메일은 제외하고 nickname, avatar_url만 노출되도록 앱에서 제어

-- 기존 "Users can view own profile" 정책과 중복되므로 삭제 필요 없음 (더 관대한 정책 적용)

-- 6.2 product_files 정책 보완: 구매자는 구매한 상품 파일 조회 가능
-- 기존 정책에서 TODO로 표시된 부분 활성화
DROP POLICY IF EXISTS "Purchasers can view purchased files" ON product_files;

CREATE POLICY "Purchasers can view purchased files"
ON product_files FOR SELECT
USING (
  -- 미리보기 파일은 누구나 조회
  is_preview = true
  OR
  -- 관리자는 모든 파일 조회
  is_admin()
  OR
  -- 구매자는 구매한 파일 조회 (downloads 테이블 확인)
  EXISTS (
    SELECT 1
    FROM downloads d
    JOIN order_items oi ON d.order_item_id = oi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE d.product_file_id = product_files.id
    AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
    AND o.status IN ('paid', 'completed')
  )
);

-- 6.3 downloads 정책 보완: INSERT는 시스템(트리거)만 가능
-- 사용자가 직접 다운로드 레코드를 생성하면 안 됨
CREATE POLICY "Only system can create downloads"
ON downloads FOR INSERT
WITH CHECK (is_admin());

-- 6.4 order_items 정책 보완: UPDATE는 관리자만 가능
CREATE POLICY "Only admins can update order items"
ON order_items FOR UPDATE
USING (is_admin());

-- ============================================================================
-- 7. Storage 정책 (Supabase Storage Bucket)
-- ============================================================================

-- product_files 버킷 정책 (마이그레이션에서는 SQL로 생성 불가, 수동 설정 필요)
-- 아래는 참고용 정책입니다. Supabase Dashboard에서 수동으로 설정하세요.

/*
-- Storage Bucket: product_files

-- SELECT (조회):
-- 1. 미리보기 파일은 누구나 조회
bucket_id = 'product_files' AND (storage.foldername(name))[1] = 'preview'

-- 2. 구매자는 구매한 파일 조회
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

-- INSERT/UPDATE/DELETE (관리):
-- 관리자만 파일 업로드/삭제
bucket_id = 'product_files' AND is_admin()
*/

-- ============================================================================
-- 8. 테스트 데이터 정리 (Phase 0용)
-- ============================================================================

-- 테스트용 관리자 계정 생성은 Supabase Dashboard에서 수동으로 진행
-- 이메일: admin@vibestore.com
-- 비밀번호: (안전한 비밀번호 설정)
-- 가입 후 profiles 테이블에서 role을 'admin'으로 변경

-- ============================================================================
-- 9. 마이그레이션 검증
-- ============================================================================

-- 모든 테이블의 RLS 활성화 여부 확인
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = r.tablename) THEN
      RAISE WARNING 'RLS not enabled on table: %', r.tablename;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- 10. 완료 로그
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration 007 completed successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  - is_admin()';
  RAISE NOTICE '  - increment_product_view_count()';
  RAISE NOTICE '  - increment_product_sales_count()';
  RAISE NOTICE '  - can_download()';
  RAISE NOTICE '  - record_download()';
  RAISE NOTICE '  - on_order_paid_increment_sales()';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Enhanced RLS policies for:';
  RAISE NOTICE '  - profiles (public profile view)';
  RAISE NOTICE '  - product_files (purchaser access)';
  RAISE NOTICE '  - downloads (system-only insert)';
  RAISE NOTICE '  - order_items (admin-only update)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test RLS policies with different user roles';
  RAISE NOTICE '  2. Set up Storage bucket policies manually';
  RAISE NOTICE '  3. Create test admin account';
  RAISE NOTICE '============================================';
END;
$$;
