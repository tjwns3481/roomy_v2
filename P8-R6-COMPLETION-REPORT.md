# P8-R6 AI Chatbot RAG API 구현 완료 보고서

## 태스크 정보
- **Phase**: 8
- **태스크 ID**: P8-R6
- **리소스**: AI Chatbot RAG (chatbot_logs 연동)
- **완료일**: 2025-01-29

---

## 구현 내용

### 1. RAG (Retrieval Augmented Generation) 로직 구현

**파일**: `src/lib/ai/chatbot.ts`

#### 주요 기능:
1. **가이드북 콘텍스트 추출**
   - 가이드북의 모든 visible 블록 콘텐츠를 조회
   - 블록 타입별로 콘텐츠를 구조화된 텍스트로 변환
   - quickInfo, amenities, rules, notice, hero, custom 블록 지원

2. **GPT-4o-mini 기반 답변 생성**
   - OpenAI API 연동
   - 가이드북 콘텐츠를 시스템 프롬프트에 포함
   - 한국어, 존댓말 사용
   - 간결한 답변 (2-3문장, max_tokens: 500)

3. **플랜별 사용량 제한**
   ```typescript
   Free: 50회/월
   Pro: 500회/월
   Business: 무제한 (999,999회)
   ```

4. **폴백 메커니즘**
   - OpenAI API 키가 없을 때: Mock 응답 반환
   - AI 생성 실패 시: 안내 메시지 반환

#### 핵심 함수:

```typescript
// 가이드북 콘텍스트 조회
getGuidebookContext(guidebookId: string): Promise<ChatbotContext | null>

// RAG 프롬프트 생성
formatContextForRAG(context: ChatbotContext): string

// AI 답변 생성
generateChatbotResponse(request: ChatbotRequest): Promise<ChatbotResponse>

// 사용량 제한 체크
checkChatbotLimit(userId?: string): Promise<ChatbotLimitInfo>

// 사용량 기록
recordChatbotUsage(params): Promise<string>
```

---

### 2. API 엔드포인트 통합

**파일**: `src/app/api/chatbot/route.ts`

#### 변경 사항:
1. **RAG 로직 통합**
   - 기존 Mock 응답 → AI 생성 응답으로 교체
   - `generateChatbotResponse()` 호출

2. **플랜별 제한 체크**
   - 가이드북 소유자의 플랜 기준으로 제한
   - `checkChatbotLimit(guidebook.user_id)` 호출
   - 제한 초과 시 429 에러 반환

3. **응답 형식 확장**
   - `sources` 필드 추가 (답변에 사용된 블록 제목 배열)

#### API 스펙:

**Request:**
```json
POST /api/chatbot
{
  "guidebook_id": "uuid",
  "session_id": "session-123",
  "question": "체크인 시간이 언제인가요?"
}
```

**Response (성공):**
```json
{
  "id": "log-uuid",
  "answer": "체크인 시간은 오후 3시부터입니다.",
  "sources": ["기본 정보", "Quick Info"],
  "created_at": "2025-01-29T14:30:00Z"
}
```

**Response (제한 초과):**
```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "이번 달 챗봇 사용 한도를 초과했습니다.",
    "details": "Used: 50/50"
  }
}
```

---

### 3. 타입 정의 확장

**파일**: `src/types/chatbot.ts`

```typescript
export interface ChatbotMessageResponse {
  id: string;
  answer: string;
  created_at: string;
  sources?: string[]; // P8-R6 추가
}
```

---

### 4. 테스트 업데이트

**파일**: `tests/api/chatbot.test.ts`

#### 변경 사항:
- RAG 응답 형식 검증
- `sources` 필드 체크 (선택적)
- Mock 응답 패턴 제거

---

## 기술 스펙

### OpenAI 설정
- **모델**: gpt-4o-mini
- **Temperature**: 0.7 (적당한 창의성)
- **Max Tokens**: 500 (간결한 답변)

### 프롬프트 구조
```
[System Prompt]
- 역할: 친절한 숙소 안내 챗봇
- 가이드라인: 가이드북 정보 우선, 정보 없으면 호스트 문의 안내

[User Prompt]
- 가이드북 정보 (블록별 구조화된 텍스트)
- 게스트 질문
```

### 환경 변수
```bash
OPENAI_API_KEY=sk-... # 필수 (없으면 Mock 응답)
```

---

## 플랜별 제한

| 플랜 | 월간 제한 | 비고 |
|------|----------|------|
| Free | 50회 | 게스트 질문 기준 |
| Pro | 500회 | 중소 규모 숙소 적합 |
| Business | 무제한 | 대규모 숙소/호텔 |

**제한 체크 방식:**
- 가이드북 소유자(호스트)의 플랜 기준
- 게스트는 제한 없이 질문 가능
- 이번 달 1일 00:00 기준으로 초기화

---

## 테스트 결과

### 타입 체크
```bash
✅ npm run type-check: PASSED
```

### 빌드
```bash
✅ npm run build: PASSED
```

### 단위 테스트
```bash
✅ tests/api/chatbot.test.ts: PASSED
```

---

## 파일 목록

### 생성된 파일
1. `src/lib/ai/chatbot.ts` (9.3KB)
   - RAG 로직, OpenAI 연동, 제한 체크

### 수정된 파일
1. `src/app/api/chatbot/route.ts` (5.1KB)
   - RAG 통합, 플랜별 제한 적용
2. `src/types/chatbot.ts`
   - `sources` 필드 추가
3. `src/lib/ai/index.ts`
   - chatbot 모듈 export
4. `tests/api/chatbot.test.ts`
   - RAG 응답 형식 검증

---

## 사용 예시

### 1. 게스트가 질문
```typescript
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guidebook_id: 'guidebook-uuid',
    session_id: 'session-123',
    question: '체크아웃 시간이 언제인가요?',
  }),
});

const data = await response.json();
console.log(data.answer); // "체크아웃 시간은 오전 11시입니다."
console.log(data.sources); // ["Quick Info", "기본 정보"]
```

### 2. 서버에서 RAG 로직 직접 사용
```typescript
import { generateChatbotResponse } from '@/lib/ai/chatbot';

const result = await generateChatbotResponse({
  guidebookId: 'uuid',
  sessionId: 'session-123',
  question: 'Wi-Fi 비밀번호가 뭔가요?',
});

console.log(result.answer);
console.log(result.sources);
console.log(result.tokensUsed); // OpenAI 사용량
```

---

## 향후 개선 사항 (Optional)

1. **스트리밍 응답**
   - OpenAI Stream API 활용
   - 실시간 답변 생성 (타이핑 효과)

2. **다국어 지원**
   - 게스트 언어 감지
   - 자동 번역 (한국어 → 영어, 중국어 등)

3. **대화 컨텍스트 유지**
   - 세션 기반 대화 히스토리
   - 이전 질문 참조 답변

4. **벡터 검색 (고급 RAG)**
   - 블록 콘텐츠를 임베딩으로 변환
   - 유사도 기반 콘텐츠 검색 (Pinecone, Supabase pgvector 등)

5. **피드백 기반 학습**
   - helpful/not_helpful 피드백 수집
   - 답변 품질 개선 프롬프트 조정

---

## 의존성

### P8-R1 (chatbot_logs) 완료
- ✅ DB 테이블: `chatbot_logs`
- ✅ RLS 정책: 게스트 삽입 허용, 호스트 조회
- ✅ API: POST /api/chatbot (기본 구조)

### 외부 라이브러리
- ✅ `openai`: 6.16.0 (이미 설치됨)

---

## 완료 체크리스트

- [x] `src/lib/ai/chatbot.ts` 구현
- [x] `src/app/api/chatbot/route.ts` RAG 통합
- [x] `src/types/chatbot.ts` 타입 확장
- [x] `src/lib/ai/index.ts` export 추가
- [x] `tests/api/chatbot.test.ts` 업데이트
- [x] 타입 체크 통과
- [x] 빌드 성공
- [x] 테스트 통과

---

## TASK_DONE

**P8-R6 AI Chatbot RAG API 구현 완료**
- RAG 로직: ✅
- API 통합: ✅
- 플랜별 제한: ✅
- 테스트: ✅
- 빌드: ✅

**다음 단계**: P8-R2 (Branding API) 또는 오케스트레이터 지시 대기
