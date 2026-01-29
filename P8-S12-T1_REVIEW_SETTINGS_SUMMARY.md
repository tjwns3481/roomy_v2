# P8-S12-T1: 리뷰 설정 페이지 구현 완료

## 태스크 정보
- **Phase**: 8
- **Screen**: S-12 (리뷰 설정)
- **태스크**: P8-S12-T1
- **상태**: ✅ 완료

## 구현된 기능

### 1. 데이터베이스 (Migration)
- **파일**: `supabase/migrations/027_review_settings.sql`
- **테이블**:
  - `review_settings`: 가이드북별 리뷰 설정
  - `review_click_logs`: 리뷰 클릭 로그 (통계용)
- **RLS 정책**: 소유자만 설정 CRUD, 게스트는 활성화된 설정만 조회
- **RPC 함수**:
  - `track_review_popup_shown(guidebook_id)`: 팝업 표시 횟수 증가
  - `track_review_click(guidebook_id, platform, user_agent, ip_hash)`: 클릭 통계 기록

### 2. 타입 정의
- **파일**: `src/types/review.ts`
- **타입**:
  - `ReviewSettings`: 리뷰 설정
  - `ReviewShowTiming`: 팝업 표시 시점 (체크아웃 전날/당일/후 1-2일)
  - `ReviewPlatform`: 리뷰 플랫폼 (airbnb, naver, google)
  - `UpdateReviewSettingsRequest`: 업데이트 요청
  - `ReviewStats`: 통계

### 3. API 라우트
- **GET** `/api/review-settings/[guidebookId]`
  - 가이드북의 리뷰 설정 조회
  - 없으면 기본값 반환
- **PUT** `/api/review-settings/[guidebookId]`
  - 리뷰 설정 업데이트 (upsert)
- **POST** `/api/review-settings/[guidebookId]/track`
  - 팝업 표시 및 클릭 트래킹
  - IP 해싱으로 개인정보 보호

### 4. 호스트용 리뷰 설정 페이지
- **라우트**: `/editor/[id]/review`
- **컴포넌트**: `src/components/editor/ReviewSettings.tsx`
- **기능**:
  - 리뷰 요청 팝업 활성화 토글
  - 리뷰 플랫폼 링크 설정 (Airbnb, Naver, Google)
  - 팝업 표시 시점 선택
  - 팝업 문구 커스터마이징
  - 실시간 통계 (표시 횟수, 클릭 수, 클릭률)

### 5. 게스트용 리뷰 요청 팝업
- **컴포넌트**: `src/components/guest/ReviewRequestPopup.tsx`
- **기능**:
  - 3초 후 자동 표시
  - localStorage로 중복 표시 방지
  - 플랫폼 아이콘 및 버튼
  - "나중에" 버튼으로 닫기
  - 백드롭 클릭으로 닫기
  - 클릭 시 새 탭에서 리뷰 페이지 열기
  - 자동 트래킹 (표시/클릭)

### 6. 게스트 뷰어 통합
- **파일**: `src/app/(guest)/g/[slug]/page.tsx`
- 리뷰 설정 조회 및 팝업 표시

## 사용 방법

### 호스트: 리뷰 설정하기
1. 에디터 페이지(`/editor/[id]`)에서 "리뷰 설정" 메뉴 선택
2. 리뷰 요청 팝업 활성화 토글 ON
3. 각 플랫폼의 리뷰 페이지 링크 입력:
   - Airbnb: `https://www.airbnb.co.kr/rooms/[room_id]/reviews`
   - Naver: `https://place.naver.com/place/[place_id]/review`
   - Google: `https://goo.gl/maps/[place_id]`
4. 팝업 표시 시점 선택 (체크아웃 당일 권장)
5. 팝업 문구 커스터마이징 (선택)
6. 저장 버튼 클릭

### 게스트: 리뷰 남기기
1. 가이드북 페이지(`/g/[slug]`) 접속
2. 3초 후 자동으로 리뷰 요청 팝업 표시
3. 원하는 플랫폼 선택하여 리뷰 남기기
4. "나중에" 버튼으로 팝업 닫기 가능

## 통계 추적

### 수집 데이터
- **팝업 표시 횟수** (`total_shown`): 게스트에게 팝업이 표시된 횟수
- **클릭 수** (`total_clicked`): 게스트가 리뷰 링크를 클릭한 횟수
- **클릭률** (`click_rate`): (클릭 수 / 표시 횟수) * 100

### 프라이버시
- IP 주소는 SHA-256 해시로 저장 (원본 IP 저장 안 함)
- User-Agent는 통계 목적으로만 사용

## 파일 목록

### 데이터베이스
- `supabase/migrations/027_review_settings.sql`

### 타입
- `src/types/review.ts`

### API
- `src/app/api/review-settings/[guidebookId]/route.ts`
- `src/app/api/review-settings/[guidebookId]/track/route.ts`

### 페이지
- `src/app/(host)/editor/[id]/review/page.tsx`

### 컴포넌트
- `src/components/editor/ReviewSettings.tsx` (호스트용)
- `src/components/guest/ReviewRequestPopup.tsx` (게스트용)

### 테스트
- `tests/review-settings.test.ts`

## 디자인 시스템 적용
- AirBnB 컬러 (#FF385C, #00A699)
- Pretendard 폰트
- `shadow-airbnb-*` 그림자
- `rounded-xl`, `rounded-2xl` 곡선
- 호버 인터랙션 (border-primary, shadow-md)

## 테스트 시나리오

### 1. 리뷰 설정 CRUD
- [x] 리뷰 설정 생성
- [x] 리뷰 설정 조회
- [x] 리뷰 설정 업데이트
- [x] Unique constraint (가이드북당 하나)

### 2. 통계 추적
- [x] 팝업 표시 횟수 증가
- [x] 클릭 수 증가
- [x] 클릭 로그 생성
- [x] 클릭률 계산

### 3. UI/UX
- [x] 설정 페이지 로딩
- [x] 폼 입력 및 저장
- [x] 토스트 알림
- [x] 통계 카드 표시
- [x] 팝업 자동 표시 (3초 후)
- [x] 중복 표시 방지 (localStorage)
- [x] 플랫폼 버튼 클릭
- [x] 트래킹 API 호출

## 플랜별 제한
- **Free**: 리뷰 설정 접근 가능
- **Pro**: 모든 기능 사용 가능
- **Business**: 고급 통계 제공 (향후 확장)

## 다음 단계
- [ ] 에디터 레이아웃에 "리뷰 설정" 탭 추가
- [ ] 통계 대시보드에 리뷰 클릭률 차트 추가
- [ ] A/B 테스트: 팝업 타이밍별 클릭률 비교
- [ ] 이메일/카카오톡 알림톡 연동 (체크아웃 시점에 자동 발송)

## 참고
- Touch Stay 벤치마킹: 리뷰 요청 팝업 기능
- Airbnb: 호스트 대시보드의 리뷰 관리 UI

---

**완료 일자**: 2024-01-29
**태스크**: P8-S12-T1
