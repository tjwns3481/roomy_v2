# Roomy 기여 가이드

Roomy에 기여해주셔서 감사합니다! 이 가이드는 프로젝트에 기여하는 방법을 설명합니다.

## 목차

1. [행동 규칙](#행동-규칙)
2. [시작하기](#시작하기)
3. [개발 환경 설정](#개발-환경-설정)
4. [브랜치 전략](#브랜치-전략)
5. [커밋 메시지](#커밋-메시지)
6. [코드 스타일](#코드-스타일)
7. [테스트 작성](#테스트-작성)
8. [Pull Request](#pull-request)
9. [코드 리뷰](#코드-리뷰)
10. [자주 묻는 질문](#자주-묻는-질문)

## 행동 규칙

### 우리의 약속

모든 기여자와 유지관리자는 다음을 약속합니다:

- 차별, 괴롭힘, 혐오 없이 존중받는 환경 조성
- 나이, 신체, 장애, 인종, 종교, 성별 등 무관하게 대우
- 건설적이고 긍정적인 피드백 제공
- 동료의 아이디어와 관점 존중

### 받을 수 없는 행동

다음 행동은 용납되지 않습니다:

- 성적 언어 또는 이미지
- 인신공격, 욕설
- 공개/비공개 괴롭힘
- 정보 무단 공개 (개인 정보)

위반 시 community@roomy.example.com으로 신고하세요.

## 시작하기

### 1단계: 저장소 포크

GitHub 웹사이트에서 "Fork" 버튼을 클릭합니다.

```bash
# 포크한 저장소 복제
git clone https://github.com/your-username/roomy.git
cd roomy_v2

# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/original-repo/roomy.git
```

### 2단계: 브랜치 생성

```bash
# main 브랜치 업데이트
git fetch upstream
git checkout main
git merge upstream/main

# 작업 브랜치 생성
git checkout -b feat/my-feature
# 또는
git checkout -b fix/my-bug-fix
```

### 3단계: 개발 환경 설정

아래 [개발 환경 설정](#개발-환경-설정) 섹션을 따르세요.

### 4단계: 코드 작성

[코드 스타일](#코드-스타일) 가이드를 따르면서 코드를 작성합니다.

### 5단계: 테스트

```bash
# 테스트 실행
npm run test

# 특정 파일 테스트
npm run test -- src/components/MyComponent.test.tsx

# 감시 모드
npm run test:watch
```

### 6단계: 커밋

[커밋 메시지](#커밋-메시지) 가이드를 따르면서 커밋합니다.

```bash
git add .
git commit -m "feat(editor): 새로운 기능 추가"
```

### 7단계: Push 및 Pull Request

```bash
# 변경사항 푸시
git push origin feat/my-feature

# GitHub에서 Pull Request 생성
```

## 개발 환경 설정

### 필수 조건

- Node.js 18.17 이상
- npm 9.0 이상
- Git
- VS Code (권장) + ESLint, Prettier 확장

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# .env.local 편집
# NEXT_PUBLIC_SUPABASE_URL, OPENAI_API_KEY 등 설정
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

### IDE 설정

**VS Code 권장 확장**:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "unifiedjs.vscode-mdx",
    "firsttris.vscode-jest-runner",
    "ms-dotnettools.csharp"
  ]
}
```

**.vscode/settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

## 브랜치 전략

### 브랜치 네이밍

```
feat/feature-name        # 새 기능
fix/bug-name            # 버그 수정
docs/documentation      # 문서
refactor/refactoring    # 코드 리팩토링
test/test-feature       # 테스트 추가
chore/maintenance       # 의존성 업데이트 등
perf/optimization       # 성능 최적화
style/formatting        # 코드 스타일 수정
```

### Phase 기반 브랜치

대규모 피처는 Phase 기반 브랜치로 관리합니다:

```
phase-7-docs-and-onboarding
phase-8-analytics
```

## 커밋 메시지

### 형식

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 (type)

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드, 의존성 등

### 범위 (scope)

```
editor, viewer, auth, api, ui, block, guidebook
```

### 제목 (subject)

- 명령형 동사로 시작 ("add", "fix", not "added", "fixed")
- 첫 글자는 소문자
- 마침표 없음
- 50자 이하

### 본문 (body)

- 선택사항
- 왜 변경했는지 설명
- 72자 줄 바꿈
- 여러 단락 가능

### 바닥글 (footer)

```
Fixes #123
Closes #456
BREAKING CHANGE: 설명
```

### 예시

```
feat(editor): 블록 추가 기능 구현

사용자가 새로운 블록 타입을 에디터에 추가할 수 있도록 구현했습니다.
드래그 앤 드롭으로 편리한 추가 경험을 제공합니다.

- NoticeBlockEditor 컴포넌트 추가
- NoticeBlock 타입 정의
- 통합 테스트 작성

Fixes #234
```

## 코드 스타일

### 파일 네이밍

```typescript
// 컴포넌트: PascalCase
src/components/GuideEditor.tsx
src/components/blocks/HeroBlock.tsx

// 유틸리티: camelCase
src/lib/utils.ts
src/lib/validators.ts

// 테스트: filename.test.ts
src/components/__tests__/Button.test.tsx
```

### 컴포넌트 작성

**Server Component 우선**:

```typescript
// ✅ 좋음: Server Component (기본값)
export default function Dashboard() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ 피해야할 것: 불필요한 'use client'
'use client';

export default function Dashboard() {
  // 서버 작업 필요 없음
}
```

**클라이언트 컴포넌트**:

```typescript
// ✅ 필요할 때만 'use client'
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 타입 정의

```typescript
// ❌ any 사용 금지
function process(data: any) {}

// ✅ 명시적 타입
interface GuideData {
  id: string;
  title: string;
  blocks: Block[];
}

function process(data: GuideData): void {}
```

### 임포트 정렬

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. 외부 라이브러리
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 3. 로컬 임포트
import { fetchGuide } from '@/lib/api';
import type { Guide } from '@/types/guide';

// 4. 스타일
import styles from './Component.module.css';
```

### 에러 처리

```typescript
// ✅ 좋음
try {
  const data = await fetchData();
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// ❌ 피해야할 것
try {
  const data = await fetchData();
} catch (e: any) {
  console.log(e);
}
```

### 린팅 및 포맷팅

```bash
# ESLint로 코드 검사
npm run lint

# Prettier로 자동 포맷
npx prettier --write .

# 타입 체크
npm run type-check
```

## 테스트 작성

### 테스트 구조

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 테스트 커버리지

```bash
# 커버리지 리포트 생성
npm run test -- --coverage

# 커버리지 임계값: 80% 이상
# 새로운 기능은 최소 80% 커버리지 필요
```

### 테스트 명명

```typescript
// ❌ 피해야할 것
it('works', () => {});

// ✅ 좋음
it('should render error message when API fails', () => {});
it('should disable submit button while loading', () => {});
```

## Pull Request

### PR 제목

```
[P7-T7.10] 프로젝트 문서화 및 사용자 온보딩

또는

feat(docs): 프로젝트 문서화 및 사용자 온보딩
```

### PR 설명 템플릿

```markdown
## 설명
이 PR은 [무엇을 하는가]를 구현합니다.

## 변경사항
- 기능 1 추가
- 버그 2 수정
- 성능 3 개선

## 테스트 방법
1. localhost:3000/path로 이동
2. 버튼을 클릭
3. 결과 확인

## 스크린샷 (UI 변경 시)
[스크린샷 첨부]

## 체크리스트
- [ ] 로컬에서 테스트 완료
- [ ] 테스트 작성
- [ ] 문서 업데이트
- [ ] 커밋 메시지 정확함

## 관련 이슈
Fixes #123
```

### PR 크기

- **작음**: 1-200 줄 (권장)
- **중간**: 200-500 줄
- **큼**: 500+ 줄 (분할 권장)

작은 PR이 더 빠르게 리뷰되고 병합됩니다.

### PR 확인사항

PR을 제출하기 전에:

- [ ] `npm run test` 통과
- [ ] `npm run lint` 통과
- [ ] `npm run type-check` 통과
- [ ] `npm run build` 성공
- [ ] 커밋 메시지 정확함
- [ ] 관련 문서 업데이트됨
- [ ] 테스트 케이스 포함됨

## 코드 리뷰

### 리뷰 기준

```
1. 기능성
   - 요구사항 충족하는가?
   - 버그는 없는가?

2. 코드 품질
   - 코드 스타일 일관성
   - 타입 안정성
   - 재사용 가능성

3. 성능
   - 불필요한 렌더링?
   - API 호출 최적화?
   - 번들 크기 영향?

4. 보안
   - RLS 정책 준수?
   - 입력값 검증?

5. 테스트
   - 충분한 테스트?
   - 엣지 케이스 처리?

6. 문서
   - README 업데이트?
   - 코드 주석 충분?
```

### 리뷰 댓글 예시

```markdown
✅ 좋은 예:
"이 부분은 useCallback으로 최적화할 수 있을 것 같습니다:
[코드 블록]

이렇게 하면 불필요한 재렌더링을 방지할 수 있습니다."

❌ 피해야할 것:
"이건 틀렸어요" (설명 없음)
```

## 자주 묻는 질문

### Q: 어떤 문제부터 시작하면 좋을까요?

A: `good first issue`, `help wanted` 레이블이 있는 이슈부터 시작하세요.

### Q: 큰 기능을 추가하고 싶어요.

A: 먼저 이슈를 생성하고 유지관리자와 논의하세요. 큰 변경사항은 미리 합의 후 진행하면 좋습니다.

### Q: PR이 병합되지 않았어요.

A: 다음을 확인하세요:
- 모든 CI 체크 통과?
- 리뷰 피드백 반영?
- 충돌해결 완료?

### Q: 환경 변수를 어떻게 설정하나요?

A: `.env.example`을 `.env.local`로 복사하고 값을 입력하세요. 실제 API 키는 공개하지 마세요.

### Q: 특정 이슈에 할당받으려면?

A: 이슈 댓글에 "@assign-to-me" 또는 "I'd like to work on this"라고 작성하세요.

### Q: 버그를 발견했어요.

A: GitHub Issues에서 새 이슈를 생성하고:
1. 버그 재현 단계
2. 예상 동작
3. 실제 동작
4. 환경 정보 (OS, 브라우저 등)

를 포함하세요.

---

**감사합니다! 🙏**

Roomy를 더 좋은 서비스로 만드는 데 도움을 주셔서 감사합니다.

질문이 있으신가요? [discussions](https://github.com/roomy/roomy/discussions)에서 질문하세요.
