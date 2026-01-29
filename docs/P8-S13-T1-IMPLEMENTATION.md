# P8-S13-T1: Upsell 설정 페이지 구현 완료

## 구현 내용

### 1. 서버 컴포넌트 (페이지)
- `src/app/(host)/editor/[id]/upsell/page.tsx`
  - Business 플랜 체크
  - 초기 데이터 로드 (아이템, 요청, 통계)
  - 비 Business 플랜 시 업그레이드 안내

### 2. 클라이언트 컴포넌트

#### 메인 컴포넌트
- `src/components/editor/UpsellSettingsClient.tsx`
  - 탭 UI (아이템 관리, 요청 관리)
  - 모달 상태 관리
  - 아이템 추가/수정 플로우

#### 아이템 관리
- `src/components/editor/UpsellItemForm.tsx`
  - React Hook Form + Zod 검증
  - 이미지 미리보기
  - 활성화 토글

- `src/components/editor/UpsellItemList.tsx`
  - 아이템 카드 레이아웃
  - 드래그앤드롭 (버튼 방식)
  - 활성화/비활성화 토글
  - 편집/삭제 액션

#### 요청 관리
- `src/components/editor/UpsellRequestList.tsx`
  - 요청 테이블
  - 통계 카드 (대기중, 확인됨, 취소됨)
  - 상태 변경 드롭다운 메뉴

### 3. API 라우트
- `POST /api/guidebooks/[id]/upsell/items/reorder`
  - 아이템 순서 변경

기존 API:
- `GET/POST /api/guidebooks/[id]/upsell/items`
- `PUT/DELETE /api/guidebooks/[id]/upsell/items/[itemId]`
- `GET /api/guidebooks/[id]/upsell/requests`
- `PATCH /api/guidebooks/[id]/upsell/requests/[reqId]`

### 4. 데이터베이스
마이그레이션 파일 (기존):
- `025_upsell_items.sql` - upsell_items 테이블
- `026_upsell_requests.sql` - upsell_requests 테이블 + RPC 함수

RPC 함수:
- `can_create_upsell_item(p_user_id)` - Business 플랜 체크
- `get_upsell_request_stats(p_guidebook_id)` - 요청 통계 조회

### 5. 타입 정의
- `src/types/upsell.ts` - UpsellItem, UpsellRequest 타입
- `src/lib/validations/upsell.ts` - Zod 스키마

### 6. 디자인 시스템 적용
- AirBnB 스타일 카드 레이아웃
- Primary 컬러 (#2563EB)
- 호버 효과, 그림자, 둥근 모서리
- 반응형 그리드

## 기능 체크리스트

### Business 플랜 체크
- [x] 서버에서 `can_create_upsell_item` RPC 호출
- [x] 비 Business 플랜 시 업그레이드 안내 표시
- [x] 업그레이드 버튼 링크

### 아이템 관리
- [x] 아이템 목록 조회 (카드 형태)
- [x] 아이템 추가 (폼 모달)
- [x] 아이템 수정 (폼 모달)
- [x] 아이템 삭제 (확인 다이얼로그)
- [x] 활성화/비활성화 토글
- [x] 순서 변경 (버튼 방식)

### 아이템 폼
- [x] 상품명 (필수)
- [x] 설명 (선택)
- [x] 가격 (필수, 숫자)
- [x] 이미지 업로드 미리보기
- [x] 활성화 여부 토글
- [x] Zod 검증

### 요청 관리
- [x] 요청 목록 테이블
- [x] 통계 카드 (대기중, 확인됨, 취소됨)
- [x] 요청자 정보 표시
- [x] 메시지 표시
- [x] 상태 변경 (드롭다운 메뉴)
- [x] 상태별 뱃지 색상

### UX/UI
- [x] 토스트 알림 (Sonner)
- [x] 로딩 상태 표시
- [x] 빈 상태 디자인
- [x] 반응형 레이아웃
- [x] 접근성 (aria-label, role)

## 테스트

### 통합 테스트
- `tests/integration/upsell-settings.test.ts`
  - API 엔드포인트 테스트
  - Business 플랜 체크
  - RPC 함수 호출

### 수동 테스트
- `tests/manual/upsell-flow.md`
  - 전체 플로우 테스트 가이드
  - 체크리스트

## TDD 과정

### RED (테스트 작성)
- ✅ 페이지 테스트 작성
- ✅ 통합 테스트 작성

### GREEN (구현)
- ✅ 서버 컴포넌트 구현
- ✅ 클라이언트 컴포넌트 구현
- ✅ API 라우트 구현
- ✅ 타입 정의

### REFACTOR (리팩토링)
- ✅ 컴포넌트 분리 (Form, List)
- ✅ 타입 안전성 확보
- ✅ 에러 처리 추가
- ✅ 로딩 상태 처리

## 빌드 및 타입 체크
```bash
# 빌드 성공
npm run build ✅

# 타입 체크 성공
npx tsc --noEmit ✅

# 린트 성공
npm run lint ✅
```

## 다음 단계
1. 개발 서버에서 수동 테스트 실행
2. 이미지 업로드 기능 구현 (Supabase Storage)
3. 드래그앤드롭 라이브러리 추가 (@dnd-kit)
4. 에디터 네비게이션에 Upsell 설정 링크 추가

## 의존성
- date-fns: 날짜 포맷팅
- react-hook-form: 폼 관리
- @hookform/resolvers: Zod 통합
- sonner: 토스트 알림
- lucide-react: 아이콘

## 스크린샷 위치
- `.playwright-mcp/upsell-settings-*.png` (수동 테스트 후 추가)

## 참고
- 스펙: `specs/screens/s13-upsell-settings.yaml` (없음, 태스크 설명 기반 구현)
- 디자인 시스템: `docs/DESIGN_SYSTEM.md`
- 타입 정의: `specs/shared/types.yaml`
