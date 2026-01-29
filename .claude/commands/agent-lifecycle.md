---
description: 에이전트 생성, 유지, 종료 규칙
---

# 에이전트 생명주기 관리

## 에이전트 생성 규칙

1. **오케스트레이터만 에이전트 호출 가능**
2. **Task 도구를 통해서만 호출**
3. **Phase 번호 전달 필수**

```
┌─────────────────────────────────────────────────────────┐
│  사용자 요청                                             │
│       ↓                                                 │
│  /orchestrate (오케스트레이터)                           │
│       ↓                                                 │
│  Plan 모드 → 승인 → Task 도구                           │
│       ↓                                                 │
│  서브 에이전트 (backend/frontend/database/test)         │
│       ↓                                                 │
│  완료 보고 → 병합 승인 요청                              │
└─────────────────────────────────────────────────────────┘
```

---

## 에이전트 종료 조건

| 조건 | 행동 |
|------|------|
| 태스크 완료 | 결과 보고 후 자동 종료 |
| 에러 10회 초과 | 작업 중단, 상황 보고 |
| 사용자 취소 | 즉시 종료 |

---

## Git Worktree 생명주기

### 생성

```bash
# Phase 1+ 태스크 시작 시
git worktree add worktree/phase-1-auth -b phase/1-auth
```

### 유지

- 해당 Phase의 모든 태스크가 완료될 때까지 유지
- 여러 에이전트가 동일 Worktree에서 작업 가능

### 종료

```bash
# Phase 완료 및 main 병합 후
git worktree remove worktree/phase-1-auth
git branch -d phase/1-auth
```

---

## 에이전트 간 통신 규칙

### Handoff (작업 인계)

- 완료된 작업 결과를 다음 에이전트에게 전달
- 필수 포함: 변경 파일, API 스펙, 주의사항

### Bug Report (버그 보고)

- 테스트 실패 시 구현 에이전트에게 전송
- 필수 포함: 실패 테스트, 원인 분석, 기대 수정

### Broadcast (전체 공지)

- Phase 완료, 중요 변경사항 등
- 모든 관련 에이전트에게 전달

---

## 병합 규칙

1. **사용자 승인 필수**
2. **모든 테스트 통과 필수**
3. **빌드 성공 필수**

```bash
# 병합 전 체크
npm run lint && npm run type-check && npm run test && npm run build

# 병합 (사용자 승인 후)
git checkout main
git merge phase/1-auth
git push
```
