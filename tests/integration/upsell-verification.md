# P8-S13-V: Upsell 설정 연결점 검증

## 검증 개요

이 문서는 Upsell 설정 화면(S13)과 API(R3, R4) 간의 연결점을 수동으로 검증하기 위한 체크리스트입니다.

## 검증 환경

- **테스트 페이지**: `/editor/[id]/upsell`
- **API Endpoints**:
  - GET/POST `/api/guidebooks/[id]/upsell/items`
  - PUT/DELETE `/api/guidebooks/[id]/upsell/items/[itemId]`
  - POST `/api/guidebooks/[id]/upsell/items/reorder`
  - GET `/api/guidebooks/[id]/upsell/requests`
  - PATCH/DELETE `/api/guidebooks/[id]/upsell/requests/[reqId]`

---

## ✅ 검증 항목

### 1. 아이템 목록 조회 및 렌더링

#### 1.1 빈 상태 UI
- [ ] Upsell 설정 페이지 접속
- [ ] "아이템이 없습니다" 메시지 표시
- [ ] "아이템 추가" 버튼 표시

#### 1.2 아이템 목록 렌더링
- [ ] GET `/api/guidebooks/[id]/upsell/items` 호출
- [ ] 아이템 카드 목록 표시
  - [ ] 아이템 이름
  - [ ] 가격 (원화 포맷)
  - [ ] 활성/비활성 상태
  - [ ] 순서 변경 버튼 (↑/↓)
  - [ ] 수정/삭제 버튼

#### 1.3 정렬 순서 확인
- [ ] `sort_order` 오름차순으로 정렬
- [ ] 드래그 또는 버튼으로 순서 변경 가능

---

### 2. 아이템 생성 (POST)

#### 2.1 아이템 추가 모달
- [ ] "아이템 추가" 버튼 클릭
- [ ] 모달 열림
- [ ] 폼 필드 확인:
  - [ ] 이름 (필수)
  - [ ] 설명 (선택)
  - [ ] 가격 (필수, 숫자)
  - [ ] 이미지 URL (선택)
  - [ ] 활성화 토글

#### 2.2 유효성 검증
- [ ] 빈 이름으로 저장 시도 → 에러 메시지
- [ ] 음수 가격 입력 → 에러 메시지
- [ ] 100자 초과 이름 → 에러 메시지

#### 2.3 생성 성공
- [ ] 유효한 데이터 입력 후 "저장" 클릭
- [ ] POST `/api/guidebooks/[id]/upsell/items` 호출
- [ ] 201 Created 응답
- [ ] 모달 닫힘
- [ ] 목록에 새 아이템 추가됨
- [ ] 토스트 알림: "아이템이 생성되었습니다"

#### 2.4 플랜 제한 (Free 플랜)
- [ ] Free 플랜 사용자로 테스트
- [ ] 아이템 생성 시도
- [ ] 402 Payment Required 응답
- [ ] 에러 토스트: "Business 플랜 업그레이드 필요"
- [ ] 업그레이드 버튼 표시

---

### 3. 아이템 수정 (PUT)

#### 3.1 수정 모달
- [ ] 아이템 카드의 "수정" 버튼 클릭
- [ ] 모달 열림
- [ ] 기존 데이터 폼에 채워짐

#### 3.2 수정 성공
- [ ] 데이터 수정 후 "저장" 클릭
- [ ] PUT `/api/guidebooks/[id]/upsell/items/[itemId]` 호출
- [ ] 200 OK 응답
- [ ] 목록에서 해당 아이템 업데이트됨
- [ ] 토스트 알림: "아이템이 수정되었습니다"

#### 3.3 활성/비활성 토글
- [ ] 활성화 토글 클릭
- [ ] `is_active` 필드 업데이트
- [ ] 비활성 아이템은 게스트에게 표시되지 않음

---

### 4. 아이템 삭제 (DELETE)

#### 4.1 삭제 확인 다이얼로그
- [ ] 아이템 카드의 "삭제" 버튼 클릭
- [ ] 확인 다이얼로그 표시
- [ ] "정말 삭제하시겠습니까?" 메시지

#### 4.2 삭제 성공
- [ ] "삭제" 버튼 클릭
- [ ] DELETE `/api/guidebooks/[id]/upsell/items/[itemId]` 호출
- [ ] 200 OK 응답
- [ ] 목록에서 해당 아이템 제거됨
- [ ] 토스트 알림: "아이템이 삭제되었습니다"

#### 4.3 취소
- [ ] "취소" 버튼 클릭
- [ ] 다이얼로그 닫힘
- [ ] 삭제 취소됨

---

### 5. 아이템 순서 변경 (POST /reorder)

#### 5.1 순서 변경 버튼
- [ ] 아이템 카드의 "↑" 버튼 클릭
- [ ] POST `/api/guidebooks/[id]/upsell/items/reorder` 호출
- [ ] 아이템 순서 변경됨
- [ ] UI 즉시 반영

#### 5.2 순서 변경 범위
- [ ] 첫 번째 아이템에서 "↑" 버튼 비활성화
- [ ] 마지막 아이템에서 "↓" 버튼 비활성화

---

### 6. 요청 목록 조회 (GET /requests)

#### 6.1 요청 관리 탭
- [ ] "요청 관리" 탭 클릭
- [ ] GET `/api/guidebooks/[id]/upsell/requests` 호출
- [ ] 요청 목록 표시
- [ ] 각 요청 카드:
  - [ ] 게스트 이름
  - [ ] 연락처
  - [ ] 아이템 이름
  - [ ] 아이템 가격
  - [ ] 요청 날짜
  - [ ] 상태 (pending/confirmed/cancelled)

#### 6.2 통계 카드
- [ ] 대기 중 요청 수
- [ ] 확정 요청 수
- [ ] 취소 요청 수
- [ ] `get_upsell_request_stats` RPC 호출 결과 반영

#### 6.3 빈 상태
- [ ] 요청이 없을 때 "요청이 없습니다" 메시지

---

### 7. 요청 상태 변경 (PATCH)

#### 7.1 상태 변경 드롭다운
- [ ] 요청 카드의 상태 드롭다운 클릭
- [ ] 옵션: Pending, Confirmed, Cancelled
- [ ] 옵션 선택

#### 7.2 상태 변경 성공
- [ ] PATCH `/api/guidebooks/[id]/upsell/requests/[reqId]` 호출
- [ ] 200 OK 응답
- [ ] 요청 카드의 상태 업데이트됨
- [ ] 통계 카드 업데이트됨
- [ ] 토스트 알림: "요청 상태가 변경되었습니다"

#### 7.3 상태별 필터링
- [ ] "대기 중" 필터 선택
- [ ] GET `/api/guidebooks/[id]/upsell/requests?status=pending` 호출
- [ ] pending 요청만 표시
- [ ] "확정" 필터 → confirmed만 표시
- [ ] "취소" 필터 → cancelled만 표시

---

### 8. 에러 핸들링

#### 8.1 네트워크 에러
- [ ] 오프라인 상태에서 API 호출
- [ ] 에러 토스트 표시: "네트워크 오류가 발생했습니다"

#### 8.2 권한 에러
- [ ] 다른 사용자의 가이드북 ID로 접근
- [ ] 403 Forbidden 응답
- [ ] 에러 토스트: "권한이 없습니다"
- [ ] 대시보드로 리다이렉트

#### 8.3 플랜 제한 안내
- [ ] Free 플랜 사용자가 Upsell 설정 페이지 접속
- [ ] Alert 컴포넌트 표시:
  - [ ] "Business 플랜 업그레이드 필요" 제목
  - [ ] 설명 메시지
  - [ ] "플랜 업그레이드" 버튼
  - [ ] "에디터로 돌아가기" 버튼

---

## 🎯 통합 시나리오

### 시나리오 1: 아이템 생성부터 요청 처리까지

1. [ ] Upsell 설정 페이지 접속
2. [ ] 아이템 3개 생성 (조식, 공항 픽업, 레이트 체크아웃)
3. [ ] 게스트 페이지(`/g/[slug]`)에서 Upsell 위젯 확인
4. [ ] 게스트로 "조식 서비스" 요청
5. [ ] 호스트 Upsell 설정 페이지로 돌아오기
6. [ ] "요청 관리" 탭에서 새 요청 확인
7. [ ] 요청 상태를 "confirmed"로 변경
8. [ ] 통계 카드 업데이트 확인

### 시나리오 2: 아이템 수정 및 삭제

1. [ ] 기존 아이템 1개 수정 (가격 변경)
2. [ ] 게스트 페이지에서 변경된 가격 확인
3. [ ] 아이템 1개 삭제
4. [ ] 게스트 페이지에서 삭제된 아이템 표시 안 됨 확인

### 시나리오 3: 순서 변경

1. [ ] 아이템 3개 생성
2. [ ] 첫 번째 아이템을 마지막으로 이동 (↓ 2회)
3. [ ] 게스트 페이지에서 변경된 순서 확인

---

## ✅ 자동화 테스트 실행

```bash
# 통합 테스트 실행
npm test -- tests/integration/upsell.integration.test.ts

# 커버리지 포함
npm run test:coverage -- tests/integration/upsell.integration.test.ts
```

### 테스트 커버리지 목표
- [ ] API Routes: 80% 이상
- [ ] 클라이언트 컴포넌트: 70% 이상
- [ ] 통합 시나리오: 100%

---

## 📝 검증 결과

### 검증 일시
- 날짜:
- 검증자:

### 발견된 이슈
1.
2.
3.

### 통과 여부
- [ ] 모든 항목 통과
- [ ] 일부 실패 (이슈 번호: )

---

## 📚 참고 문서

- 화면 스펙: `specs/screens/s13-upsell-settings.yaml`
- API 스펙: `specs/resources/r03-upsell-item.yaml`, `specs/resources/r04-upsell-request.yaml`
- 테스트 코드: `tests/integration/upsell.integration.test.ts`
- 페이지 코드: `src/app/(host)/editor/[id]/upsell/page.tsx`
- 클라이언트 컴포넌트: `src/components/editor/UpsellSettingsClient.tsx`
