# Project Memory

## 기본 정보

- **프로젝트명**: Vibe Store
- **설명**: 바이브랩스 유튜브 채널의 라이브 코딩 콘텐츠용 디지털 상품 쇼핑몰 스캘레톤
- **시작일**: 2026-01-25
- **기술 스택**: Next.js 15 + Supabase + Vercel + Toss Payments

## 아키텍처

- **프레임워크**: Next.js 15 (App Router)
- **백엔드**: Next.js API Routes + Supabase
- **프론트엔드**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **데이터베이스**: Supabase PostgreSQL
- **인증**: Supabase Auth (Kakao, Google, Magic Link)
- **결제**: Toss Payments
- **상태관리**: Zustand
- **테스트**: Vitest + Playwright

## 핵심 기능 (MVP)

1. **FEAT-0**: 온보딩/인증 (소셜 로그인, 매직 링크, 비회원 주문)
2. **FEAT-1**: 디지털 상품 판매 (리스트, 상세, 장바구니, 결제, 다운로드)
3. **FEAT-2**: 관리자 기능 (상품 관리, 주문 관리)

## Top 리스크

- **Supabase RLS 보안 정책 설정 복잡도**
  - 완화: RLS 정책 템플릿화 + 라이브에서 단계별 설명

## 특이사항

- 타겟: 비개발자 (AI로 커스터마이징 가능한 수준)
- 검증된 가설: 완전 비개발자(교육업 종사자)가 쇼핑몰 구축 성공
- 성공 지표: 유튜브 구독자 5천 → 1만 (3개월)

## MCP 서버

- Context7: 최신 라이브러리 문서 검색
- Gemini 3.0 Pro: 프론트엔드 디자인 AI
