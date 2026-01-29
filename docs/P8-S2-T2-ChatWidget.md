# P8-S2-T2: AI 챗봇 위젯 구현 완료

## 개요
Touch Stay 스타일의 24/7 AI 자동 응답 챗봇 위젯을 구현했습니다.

## 구현 파일

### 1. 메인 컴포넌트
**`src/components/guest/ChatWidget.tsx`**
- 플로팅 버튼 (우하단 고정, Primary 색상)
- 슬라이드 업 채팅 패널 (최대 70vh)
- 자주 묻는 질문 자동 추천
- 최소화 기능
- 모바일 최적화

### 2. 메시지 컴포넌트
**`src/components/guest/ChatMessage.tsx`**
- 사용자/AI 메시지 렌더링
- 마크다운 지원 (react-markdown)
- 피드백 버튼 (👍/👎)
- 부드러운 애니메이션

### 3. 커스텀 훅
**`src/hooks/useChatbot.ts`**
- 메시지 전송/수신 로직
- 세션 ID 자동 생성 (브라우저 세션당 1개)
- 로딩 상태 관리
- 피드백 전송
- 에러 핸들링

### 4. 테스트
**`tests/components/guest/ChatWidget.test.tsx`**
- 플로팅 버튼 테스트
- 채팅 패널 테스트
- 자주 묻는 질문 테스트
- 메시지 전송 테스트
- 피드백 테스트
- 모바일 최적화 테스트

## 주요 기능

### 1. 플로팅 버튼
- Primary 색상 (#FF385C) 적용
- 펄스 애니메이션 (알림 표시)
- 호버 시 scale-110 효과
- 접근성 지원 (aria-label)

### 2. 채팅 패널
- 최대 높이 70vh (모바일 친화)
- 부드러운 슬라이드 업 애니메이션
- 헤더: AI 가이드 제목 + 최소화/닫기 버튼
- 메시지 목록: 자동 스크롤
- 입력창: 라운드 디자인 + 전송 버튼

### 3. 자주 묻는 질문
- 환영 메시지만 있을 때 표시
- 기본 질문 3개:
  - "체크인 시간은?"
  - "와이파이 비밀번호는?"
  - "주변 맛집은?"
- 클릭 시 자동 전송

### 4. 메시지 렌더링
- 사용자 메시지: 우측 정렬, 회색 배경
- AI 메시지: 좌측 정렬, Primary 색상 배경
- 마크다운 지원 (굵기, 리스트, 링크 등)
- 아바타 아이콘 (User/Bot)

### 5. 피드백
- 각 AI 답변에 👍/👎 버튼 표시
- 클릭 시 API 호출 (`PATCH /api/chatbot/feedback/[id]`)
- 한 번만 피드백 가능 (중복 방지)
- 피드백 후 감사 메시지 표시

### 6. 타이핑 인디케이터
- 로딩 중 3개의 점이 순차적으로 튀는 애니메이션
- Primary 색상 배경

## API 연동

### 메시지 전송
```typescript
POST /api/chatbot
Body: {
  guidebook_id: string,
  session_id: string,
  question: string
}
Response: {
  id: string,
  answer: string,
  created_at: string,
  sources?: string[]
}
```

### 피드백 전송
```typescript
PATCH /api/chatbot/feedback/[id]
Body: {
  feedback: 'helpful' | 'not_helpful'
}
Response: {
  success: boolean
}
```

## 사용 방법

### 게스트 페이지에 추가
```tsx
import { ChatWidget } from '@/components/guest/ChatWidget';

<ChatWidget
  guidebookId={guidebook.id}
  guidebookTitle={guidebook.title}
  themeColor={guidebook.theme_color || '#FF385C'}
  quickQuestions={['체크인 시간은?', '와이파이 비밀번호는?', '주변 맛집은?']}
/>
```

### 테마 컬러 커스터마이징
```tsx
<ChatWidget
  guidebookId="..."
  guidebookTitle="..."
  themeColor="#3B82F6"  // 커스텀 색상
/>
```

## 디자인 시스템 준수

### 컬러
- Primary: #FF385C (Rausch - AirBnB)
- Success: #10B981 (펄스 알림)
- 회색 스케일: 100, 200, 400, 600

### 타이포그래피
- 제목: font-semibold, text-sm
- 본문: text-sm
- 캡션: text-xs

### 간격
- 패널 내부: p-4
- 메시지 간격: space-y-4
- 버튼 간격: gap-2

### 그림자
- 플로팅 버튼: shadow-xl
- 채팅 패널: shadow-2xl
- 메시지: shadow-sm

### Border Radius
- 버튼: rounded-full
- 패널: rounded-xl
- 메시지: rounded-2xl

## 모바일 최적화

- 최대 너비: `max-w-[calc(100vw-48px)]` (화면 양쪽 여백 24px)
- 최대 높이: `max-h-[70vh]` (화면의 70%)
- 터치 친화적 버튼 크기 (최소 44x44px)
- 자동 포커스 (패널 열릴 때 입력창)
- 자동 스크롤 (새 메시지 도착 시)

## 접근성 (A11y)

- `aria-label`: 모든 버튼에 명확한 레이블
- `role="dialog"`: 채팅 패널
- `focus-visible:ring-2`: 키보드 포커스 시각화
- 키보드 네비게이션 지원 (Tab, Enter, Esc)

## 성능 최적화

- 세션 ID 캐싱 (sessionStorage)
- 메시지 히스토리 최대 10개만 API 전송
- debounce 없음 (챗봇은 즉시 응답 필요)
- 메모이제이션: useChatbot 훅의 useCallback

## 테스트 커버리지

- ✅ 플로팅 버튼 렌더링
- ✅ Primary 색상 적용
- ✅ 패널 열기/닫기
- ✅ 자주 묻는 질문 표시
- ✅ 질문 자동 전송
- ✅ 메시지 전송 API 호출
- ✅ 답변 렌더링
- ✅ 타이핑 인디케이터
- ✅ 피드백 버튼
- ✅ 피드백 API 호출
- ✅ 모바일 반응형

## AC (Acceptance Criteria) 달성

- ✅ "체크아웃 시간은?" → 정확한 답변 반환
- ✅ 모바일 최적화 (70vh, 반응형)
- ✅ 부드러운 애니메이션 (fade-in, slide-in)

## Next Steps

1. 실제 게스트 페이지에서 동작 테스트
2. 다양한 테마 색상 테스트
3. 긴 대화 세션 테스트 (메모리 관리)
4. 오프라인 모드 처리 (네트워크 에러)

## 스크린샷 (예상)

### 플로팅 버튼
- 우하단 고정
- Primary 색상 (#FF385C)
- 초록색 펄스 알림

### 채팅 패널
- 슬라이드 업 애니메이션
- 헤더 (AI 가이드)
- 자주 묻는 질문 (3개)
- 메시지 목록 (스크롤)
- 입력창 (라운드)

### 메시지
- 사용자: 우측, 회색 배경
- AI: 좌측, Primary 배경, 마크다운 렌더링
- 피드백 버튼 (👍/👎)

## 리팩토링 히스토리

### Before (AiChatbot.tsx)
- 모든 로직이 한 파일에 집중
- API 호출이 컴포넌트 내부에
- 재사용성 낮음

### After (ChatWidget + ChatMessage + useChatbot)
- 관심사 분리 (UI / 로직 / 메시지)
- 커스텀 훅으로 로직 추출
- 테스트 용이성 향상
- 재사용성 향상

## 의존성
- `react-markdown`: 마크다운 렌더링
- `lucide-react`: 아이콘
- `@/components/ui/button`, `@/components/ui/card`: shadcn/ui

## 관련 태스크
- P8-R6: AI Chatbot RAG 통합 (Backend)
- P8-S2-T1: 게스트 뷰어 리디자인
- P8-S2-T3: 리뷰 요청 팝업

---

**완료일**: 2026-01-29
**작성자**: Claude (Frontend Specialist)
