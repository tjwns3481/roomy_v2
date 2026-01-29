#!/bin/bash

echo "=========================================="
echo "P7-T7.7 쿠폰/할인 API 구현 검증"
echo "=========================================="
echo ""

echo "1. 테스트 파일 확인"
echo "-------------------------------------------"
[ -f "tests/api/admin/coupons.test.ts" ] && echo "✅ tests/api/admin/coupons.test.ts" || echo "❌ tests/api/admin/coupons.test.ts"
echo ""

echo "2. 관리자 API 파일 확인"
echo "-------------------------------------------"
[ -f "src/app/api/admin/coupons/route.ts" ] && echo "✅ src/app/api/admin/coupons/route.ts" || echo "❌ src/app/api/admin/coupons/route.ts"
[ -f "src/app/api/admin/coupons/[id]/route.ts" ] && echo "✅ src/app/api/admin/coupons/[id]/route.ts" || echo "❌ src/app/api/admin/coupons/[id]/route.ts"
[ -f "src/app/api/admin/coupons/issue/route.ts" ] && echo "✅ src/app/api/admin/coupons/issue/route.ts" || echo "❌ src/app/api/admin/coupons/issue/route.ts"
echo ""

echo "3. 사용자 API 파일 확인"
echo "-------------------------------------------"
[ -f "src/app/api/coupons/route.ts" ] && echo "✅ src/app/api/coupons/route.ts" || echo "❌ src/app/api/coupons/route.ts"
[ -f "src/app/api/coupons/my/route.ts" ] && echo "✅ src/app/api/coupons/my/route.ts" || echo "❌ src/app/api/coupons/my/route.ts"
[ -f "src/app/api/coupons/validate/route.ts" ] && echo "✅ src/app/api/coupons/validate/route.ts" || echo "❌ src/app/api/coupons/validate/route.ts"
[ -f "src/app/api/coupons/apply/route.ts" ] && echo "✅ src/app/api/coupons/apply/route.ts" || echo "❌ src/app/api/coupons/apply/route.ts"
echo ""

echo "4. DB 스키마 확인"
echo "-------------------------------------------"
[ -f "supabase/migrations/012_create_coupons.sql" ] && echo "✅ supabase/migrations/012_create_coupons.sql" || echo "❌ supabase/migrations/012_create_coupons.sql"
echo ""

echo "5. 문서 확인"
echo "-------------------------------------------"
[ -f "P7-T7.7_COUPON_API_SUMMARY.md" ] && echo "✅ P7-T7.7_COUPON_API_SUMMARY.md" || echo "❌ P7-T7.7_COUPON_API_SUMMARY.md"
echo ""

echo "6. 파일 통계"
echo "-------------------------------------------"
echo "API 라우트 파일: $(find src/app/api -name "*.ts" | grep -c coupon) 개"
echo "테스트 파일: $(find tests -name "*.test.ts" | grep -c coupon) 개"
echo ""

echo "=========================================="
echo "검증 완료!"
echo "=========================================="
