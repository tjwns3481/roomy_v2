# Preferences

> 사용자 선호도 및 코딩 스타일

## 코딩 스타일

- 언어: TypeScript (strict mode)
- 프레임워크 스타일: Next.js App Router (서버 컴포넌트 우선)
- CSS: Tailwind CSS + shadcn/ui
- 상태관리: Zustand (간단하고 직관적)
- 폼: React Hook Form + Zod

## 네이밍 규칙

- 파일: kebab-case (`product-card.tsx`)
- 컴포넌트: PascalCase (`ProductCard`)
- 함수: camelCase (`getProducts`)
- 상수: UPPER_SNAKE (`MAX_QUANTITY`)
- DB 테이블/컬럼: snake_case (`order_items`, `created_at`)

## 커밋 메시지

- Conventional Commits (한글 가능)
- 예: `feat(products): 상품 상세 페이지 구현`

## 기타 선호

- 주석: 핵심 로직에 한글 주석 추가 (라이브 코딩 친화적)
- 에러 처리: 명시적으로 처리 (건너뛰지 않기)
- 보안: RLS 우선, service_role_key 최소 사용
