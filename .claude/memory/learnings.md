# Lessons Learned

> 에이전트가 난관을 극복하며 발견한 교훈을 기록합니다.

---

<!-- 예시 형식:

### [2026-01-25] Supabase RLS 순환 참조 (RLS, profiles, orders)
- **상황**: orders 테이블에서 profiles.role 확인하는 RLS 정책 작성
- **문제**: `infinite recursion detected in policy`
- **원인**: profiles RLS가 orders를 참조하고, orders RLS가 profiles를 참조
- **해결**: is_admin() 함수를 별도로 생성하여 순환 참조 방지
  ```sql
  CREATE OR REPLACE FUNCTION is_admin()
  RETURNS BOOLEAN AS $$
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
  $$ LANGUAGE SQL SECURITY DEFINER;
  ```
- **교훈**: RLS 정책에서 다른 테이블 참조 시 SECURITY DEFINER 함수 사용

-->

<!-- 새로운 교훈은 아래에 추가하세요 -->
