# P8-R1: chatbot_log 리소스 구현 완료

## 작업 내용

### 1. 데이터베이스 마이그레이션 (026_chatbot_logs.sql)

#### 테이블: chatbot_logs
```sql
- id: UUID (PK)
- guidebook_id: UUID (FK → guidebooks)
- session_id: TEXT (익명 세션 ID)
- question: TEXT (게스트 질문)
- answer: TEXT (AI 답변)
- feedback: TEXT (helpful | not_helpful | null)
- created_at: TIMESTAMPTZ
```

#### 인덱스
- `idx_chatbot_logs_guidebook_id`: 가이드북별 로그 조회 성능 향상
- `idx_chatbot_logs_session_id`: 세션별 대화 조회 성능 향상
- `idx_chatbot_logs_created_at`: 시간순 조회 성능 향상
- `idx_chatbot_logs_guidebook_created`: 가이드북 + 시간순 복합 인덱스 (대시보드용)

#### RLS 정책
- **삽입**: 공개 (게스트가 챗봇 사용)
- **조회**: 호스트는 자신의 가이드북 로그만 조회
- **업데이트**: 피드백 업데이트만 허용 (공개)
- **삭제**: 호스트는 자신의 가이드북 로그만 삭제

#### Helper 함수
- `get_chatbot_stats(p_guidebook_id)`: 가이드북별 챗봇 통계 조회
  - total_questions: 총 질문 수
  - helpful_count: 도움 됨 피드백 수
  - not_helpful_count: 도움 안 됨 피드백 수
  - avg_session_length: 평균 세션 길이

---

### 2. TypeScript 타입 (src/types/chatbot.ts)

```typescript
- ChatbotLog: DB Row 타입
- ChatbotMessageRequest: 질문/답변 요청
- ChatbotMessageResponse: 질문/답변 응답
- ChatbotFeedbackRequest: 피드백 업데이트 요청
- ChatbotLogsResponse: 로그 목록 응답 (페이지네이션)
- ChatbotStats: 챗봇 통계
- FrequentQuestion: 자주 묻는 질문 (미래 확장용)
```

---

### 3. API Routes

#### POST /api/chatbot
- **목적**: 챗봇 질문/답변 저장
- **인증**: 불필요 (게스트 접근 허용)
- **요청**:
  ```json
  {
    "guidebook_id": "uuid",
    "session_id": "string",
    "question": "string"
  }
  ```
- **응답**: `{ id, answer, created_at }`
- **현재 상태**: 임시 답변 반환 (실제 AI 연동은 P8-R6에서 구현)

#### GET /api/chatbot/[guidebookId]
- **목적**: 가이드북의 챗봇 대화 로그 조회
- **인증**: 필요 (호스트만 자신의 가이드북 로그 조회 가능)
- **쿼리 파라미터**: `page`, `limit`, `session_id` (옵션)
- **응답**: `{ logs, total, page, limit }`

#### GET /api/chatbot/[guidebookId]/stats
- **목적**: 가이드북의 챗봇 통계 조회
- **인증**: 필요 (호스트만 자신의 가이드북 통계 조회 가능)
- **응답**: `ChatbotStats`

#### PATCH /api/chatbot/feedback/[id]
- **목적**: 챗봇 로그의 피드백 업데이트
- **인증**: 불필요 (게스트가 피드백 제공)
- **요청**: `{ feedback: 'helpful' | 'not_helpful' }`
- **응답**: `{ success: true }`

---

## 테스트 커버리지

- [x] POST /api/chatbot - 질문/답변 저장
- [x] POST /api/chatbot - 필수 필드 검증
- [x] POST /api/chatbot - UUID 형식 검증
- [x] POST /api/chatbot - 가이드북 존재 여부 확인
- [x] PATCH /api/chatbot/feedback/[id] - 피드백 업데이트
- [x] PATCH /api/chatbot/feedback/[id] - 유효성 검증
- [x] GET /api/chatbot/[guidebookId] - 인증 체크
- [x] GET /api/chatbot/[guidebookId]/stats - 인증 체크

---

## 파일 구조

```
worktree/phase-8-production/
├── supabase/migrations/
│   └── 026_chatbot_logs.sql (테이블, 인덱스, RLS, Helper 함수)
├── src/
│   ├── types/
│   │   └── chatbot.ts (타입 정의)
│   └── app/api/chatbot/
│       ├── route.ts (POST - 질문/답변 저장)
│       ├── [guidebookId]/
│       │   ├── route.ts (GET - 로그 목록 조회)
│       │   └── stats/
│       │       └── route.ts (GET - 통계 조회)
│       └── feedback/
│           └── [id]/
│               └── route.ts (PATCH - 피드백 업데이트)
└── tests/api/
    └── chatbot.test.ts (API 테스트)
```

---

## 향후 작업 (P8-R6)

- [ ] OpenAI API 연동 (RAG 기반 답변 생성)
- [ ] 가이드북 콘텐츠 벡터화 (Embedding)
- [ ] Pinecone/Supabase Vector 연동
- [ ] 자주 묻는 질문 자동 추출
- [ ] 챗봇 성능 모니터링 대시보드

---

## 보안 고려사항

1. **RLS 정책**: 호스트는 자신의 가이드북 로그만 조회 가능
2. **익명화**: session_id로 게스트 개인정보 보호
3. **공개 API**: 게스트가 챗봇 사용 및 피드백 제공 가능
4. **Rate Limiting**: 향후 추가 (남용 방지)

---

## 성능 최적화

1. **인덱스**: 가이드북 + 시간순 복합 인덱스로 대시보드 쿼리 최적화
2. **페이지네이션**: 기본 50개 제한, 최대 100개
3. **RPC 함수**: 통계 계산을 DB 레벨에서 처리하여 네트워크 오버헤드 감소

---

## 완료 확인

- [x] 마이그레이션 파일 생성
- [x] TypeScript 타입 정의
- [x] API Routes 구현
- [x] 테스트 파일 작성
- [x] 타입 체크 통과
- [x] 문서화

---

**태스크 상태**: ✅ 완료
**다음 태스크**: P8-R2 (branding 리소스 API 구현)
