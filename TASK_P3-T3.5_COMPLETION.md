# P3-T3.5 AI 사용량 추적 및 플랜별 제한 - 완료 보고서

## 태스크 정보
- **Phase**: 3
- **태스크 ID**: P3-T3.5
- **완료일**: 2024-01-28
- **상태**: COMPLETED

## 구현 내용

### 1. DB 마이그레이션 (014_create_ai_usage.sql)
- `ai_usage` 테이블 생성
  - `id`, `user_id`, `guidebook_id`, `tokens_used`, `model`, `action`, `created_at`
- `monthly_ai_usage` 뷰 생성 (월별 사용량 집계)
- `check_ai_limit()` RPC 함수 - 플랜별 제한 확인
- `record_ai_usage()` RPC 함수 - 사용량 기록
- `get_ai_usage_history()` RPC 함수 - 사용 이력 조회
- `reset_monthly_ai_usage()` 함수 - 관리자용 리셋
- RLS 정책: 본인 데이터만 조회 가능, 시스템에서만 삽입 가능

### 2. TypeScript 타입 업데이트 (database.types.ts)
- `ai_usage` 테이블 타입 추가
- RPC 함수 타입 정의 추가
  - `check_ai_limit`, `record_ai_usage`, `get_ai_usage_history`, `reset_monthly_ai_usage`
- `AI_LIMIT_EXCEEDED` 에러 코드 추가 (ai.ts)

### 3. AI 사용량 유틸리티 (src/lib/ai/usage.ts)
- `checkAiLimit()` - 사용량 제한 체크
- `recordAiUsage()` - 사용량 기록 (Service Role 사용)
- `getAiUsageHistory()` - 사용 이력 조회
- `getPlanLimits()` - 플랜별 제한 정보
- `createLimitExceededError()` - 제한 초과 에러 응답 생성

### 4. API 엔드포인트
#### GET /api/ai/usage
- 현재 사용자의 AI 사용량 정보 조회
- 응답: `{ canGenerate, usedThisMonth, limitThisMonth, remaining, plan, history? }`

#### POST /api/ai/usage
- AI 사용량 기록 (내부용)
- 요청: `{ guidebookId?, tokensUsed, model, action }`
- 제한 초과 시 429 반환

### 5. generate API 통합 (src/app/api/ai/generate/route.ts)
- 인증된 사용자의 경우 플랜별 제한 체크 추가
- 생성 후 사용량 자동 기록
- 응답에 사용량 정보 포함 (`usage: { usedThisMonth, remaining }`)

## 플랜별 제한
| 플랜 | 월간 AI 생성 횟수 | 가이드북 수 |
|------|-----------------|-----------|
| free | 3회 | 1개 |
| pro | 30회 | 5개 |
| business | 무제한 | 무제한 |

## 파일 목록
```
supabase/migrations/014_create_ai_usage.sql   # DB 마이그레이션
src/lib/ai/usage.ts                           # 사용량 유틸리티
src/lib/ai/index.ts                           # 모듈 re-export
src/app/api/ai/usage/route.ts                 # 사용량 API
src/app/api/ai/generate/route.ts              # 생성 API (수정)
src/types/database.types.ts                   # 타입 추가
src/types/ai.ts                               # 에러 코드 추가
tests/api/ai/usage.test.ts                    # API 테스트
tests/lib/ai/usage.test.ts                    # 유틸리티 테스트
tests/api/ai/generate.test.ts                 # 생성 API 테스트 수정
```

## 테스트 결과
```
tests/lib/ai/usage.test.ts  - 12/12 통과
tests/api/ai/usage.test.ts  - 7/7 통과
tests/api/ai/generate.test.ts - 13/13 통과
```

총: 32/32 테스트 통과

## API 사용 예시

### 사용량 조회
```typescript
// GET /api/ai/usage
const response = await fetch('/api/ai/usage');
const { canGenerate, remaining, plan } = await response.json();

if (!canGenerate) {
  alert(`이번 달 AI 생성 한도를 모두 사용했습니다. (플랜: ${plan})`);
}
```

### 제한 체크 후 생성
```typescript
// POST /api/ai/generate
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({ listingInfo, guidebookId }),
});

if (response.status === 429) {
  const { error, remaining } = await response.json();
  // error === 'AI_LIMIT_EXCEEDED'
  // 업그레이드 안내 표시
}
```

## 완료 기준 충족 여부
- [x] ai_usage 테이블 마이그레이션
- [x] 월별 사용량 집계 뷰
- [x] check_ai_limit RPC 함수
- [x] GET /api/ai/usage 엔드포인트
- [x] generate API에 사용량 체크 통합

---

TASK_DONE
