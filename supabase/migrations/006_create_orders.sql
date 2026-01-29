-- Migration: 006_create_orders.sql
-- Description: cart_items, orders, order_items, downloads 테이블 생성
-- Dependencies: 003_create_products.sql (products FK)
-- Author: database-specialist
-- Date: 2026-01-25

-- ============================================================================
-- 1. cart_items (장바구니)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Updated_at trigger
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cart_items IS '장바구니 (회원/비회원 모두 지원)';

-- ============================================================================
-- 2. orders (주문)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  discount_amount INTEGER DEFAULT 0 CHECK (discount_amount >= 0),
  payment_info JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT order_user_or_guest CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE orders IS '주문 (회원/비회원 모두 지원)';
COMMENT ON COLUMN orders.order_number IS '주문번호 (ORD-YYYYMMDD-XXXX)';
COMMENT ON COLUMN orders.payment_info IS '토스 결제 정보 (orderId, paymentKey, method 등)';

-- ============================================================================
-- 3. order_items (주문 상품)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS '주문 상품 상세 (주문 시점 스냅샷 저장)';
COMMENT ON COLUMN order_items.product_name IS '주문 시점 상품명 (상품 삭제 대비)';
COMMENT ON COLUMN order_items.price IS '주문 시점 가격 (가격 변동 대비)';

-- ============================================================================
-- 4. downloads (다운로드 권한)
-- ============================================================================

CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_file_id UUID NOT NULL REFERENCES product_files(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 0 CHECK (download_count >= 0),
  max_downloads INTEGER DEFAULT 5 CHECK (max_downloads > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_downloads_order_item_id ON downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_product_file_id ON downloads(product_file_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

COMMENT ON TABLE downloads IS '다운로드 권한 (결제 완료 시 자동 생성)';
COMMENT ON COLUMN downloads.max_downloads IS '최대 다운로드 허용 횟수';
COMMENT ON COLUMN downloads.expires_at IS '다운로드 만료일 (product_files.download_days 기반)';

-- ============================================================================
-- 5. RLS 정책
-- ============================================================================

-- 5.1 cart_items RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 본인 장바구니만 조회 (회원/비회원)
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (
  auth.uid() = user_id
  OR session_id IS NOT NULL
);

-- 본인 장바구니만 추가
CREATE POLICY "Users can add to cart"
ON cart_items FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR session_id IS NOT NULL
);

-- 본인 장바구니만 수정
CREATE POLICY "Users can update own cart"
ON cart_items FOR UPDATE
USING (
  auth.uid() = user_id
  OR session_id IS NOT NULL
);

-- 본인 장바구니만 삭제
CREATE POLICY "Users can delete own cart"
ON cart_items FOR DELETE
USING (
  auth.uid() = user_id
  OR session_id IS NOT NULL
);

-- 관리자는 모든 장바구니 관리
CREATE POLICY "Admins can manage all carts"
ON cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5.2 orders RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 본인 주문만 조회 (회원/비회원)
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (
  auth.uid() = user_id
  OR guest_email IS NOT NULL
);

-- 누구나 주문 생성 가능
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- 본인 주문만 수정 (결제 전)
CREATE POLICY "Users can update own pending orders"
ON orders FOR UPDATE
USING (
  (auth.uid() = user_id OR guest_email IS NOT NULL)
  AND status = 'pending'
);

-- 관리자는 모든 주문 관리
CREATE POLICY "Admins can manage all orders"
ON orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5.3 order_items RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 주문 소유자만 조회
CREATE POLICY "Order owners can view order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
  )
);

-- 누구나 주문 상품 생성 가능 (주문 생성 시)
CREATE POLICY "Anyone can create order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- 관리자는 모든 주문 상품 관리
CREATE POLICY "Admins can manage all order items"
ON order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5.4 downloads RLS
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- 구매자만 다운로드 권한 조회
CREATE POLICY "Purchasers can view downloads"
ON downloads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = downloads.order_item_id
    AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
    AND o.status IN ('paid', 'completed')
  )
);

-- 구매자만 다운로드 횟수 업데이트
CREATE POLICY "Purchasers can update download count"
ON downloads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = downloads.order_item_id
    AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
    AND o.status IN ('paid', 'completed')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = downloads.order_item_id
    AND (o.user_id = auth.uid() OR o.guest_email IS NOT NULL)
    AND o.status IN ('paid', 'completed')
  )
);

-- 관리자는 모든 다운로드 관리
CREATE POLICY "Admins can manage all downloads"
ON downloads FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 6. 주문번호 생성 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  seq INTEGER;
BEGIN
  -- 오늘 날짜의 마지막 주문번호 + 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14) AS INTEGER)), 0) + 1
  INTO seq
  FROM orders
  WHERE order_number LIKE prefix || '%';

  RETURN prefix || LPAD(seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number IS '주문번호 자동 생성 (ORD-YYYYMMDD-0001)';

-- ============================================================================
-- 7. 결제 완료 시 다운로드 권한 자동 생성 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION create_download_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- pending → paid 상태 변경 시 디지털 상품 다운로드 권한 생성
  -- product_files가 있는 상품은 모두 디지털 상품으로 간주
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    INSERT INTO downloads (order_item_id, product_file_id, max_downloads, expires_at)
    SELECT
      oi.id,
      pf.id,
      pf.download_limit,
      NOW() + INTERVAL '30 days' -- 기본 30일
    FROM order_items oi
    JOIN product_files pf ON pf.product_id = oi.product_id
    WHERE oi.order_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid_create_downloads
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION create_download_permissions();

COMMENT ON FUNCTION create_download_permissions IS '주문 결제 완료 시 디지털 상품 다운로드 권한 자동 생성';

-- ============================================================================
-- 8. 주문번호 자동 생성 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_orders_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

COMMENT ON FUNCTION set_order_number IS '주문 생성 시 order_number 자동 할당';
