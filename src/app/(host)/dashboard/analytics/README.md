# Analytics Dashboard (통계 대시보드)

> @TASK P8-S8-T1 - Touch Stay 수준의 고급 통계 대시보드

## 개요

호스트가 가이드북 조회 통계, 유입 경로, 시간대별 접속 현황을 한눈에 확인할 수 있는 고급 통계 대시보드입니다.

## 기능

### 1. 요약 통계 (Summary Stats)
- **전체 조회수**: 모든 가이드북의 누적 조회수
- **오늘 조회수**: 당일 조회수
- **가이드북 수**: 생성한 가이드북 개수
- **AI 사용량**: 플랜별 AI 생성 사용량 (used/limit)

### 2. 조회수 추이 차트 (Analytics Chart)
- **일별/주별/월별** 기간 선택
- **Area Chart + Line Chart** 조합 (Recharts)
- **그래디언트 배경**: Primary 컬러 그래디언트
- **커스텀 툴팁**: 날짜 + 조회수 포맷팅

### 3. 유입 경로 분석 (Referrer Chart)
- **Pie Chart** (Recharts)
- **유입 경로 분류**:
  - QR 코드
  - 단축 URL
  - 링크 공유
  - 직접 접속
- **퍼센티지 표시**

### 4. 시간대별 히트맵 (Heatmap Chart)
- **요일 x 시간대** (월~일 x 0~23시)
- **색상 강도**: 조회수에 따라 Primary 컬러 투명도 조절
- **호버 툴팁**: 요일, 시간, 조회수 표시

### 5. 챗봇 질문 통계 (Pro 플랜 이상)
- 총 질문 수
- 도움됨/도움 안됨 피드백 통계
- 자주 묻는 질문 Top 5

### 6. 가이드북별 통계
- 각 가이드북의 전체 조회수
- 오늘 조회수
- 순위 표시

## 파일 구조

```
src/app/(host)/dashboard/analytics/
├── page.tsx                    # 서버 컴포넌트 (데이터 로드)
├── page.test.tsx               # 페이지 테스트
├── AnalyticsClient.tsx         # 클라이언트 컴포넌트 (상호작용)
├── loading.tsx                 # 로딩 스켈레톤
└── README.md                   # 이 파일

src/components/dashboard/
├── AnalyticsChart.tsx          # 조회수 추이 차트
├── ReferrerChart.tsx           # 유입 경로 파이 차트
└── HeatmapChart.tsx            # 시간대별 히트맵

src/app/api/analytics/
└── route.ts                    # 고급 통계 API

supabase/migrations/
└── 022_analytics_enhancements.sql  # 통계 함수 (RPC)
```

## API 엔드포인트

### GET /api/stats
기본 통계 조회 (일별 조회수, 요약)

**Query Parameters:**
- `period`: `7d` | `30d` | `all` (기본: 7d)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalViews": 1234,
      "todayViews": 45,
      "guidebookCount": 3,
      "aiUsage": { "used": 5, "limit": 30 }
    },
    "chartData": [
      { "view_date": "2024-01-28", "view_count": 45 }
    ],
    "guidebookStats": [
      { "id": "...", "title": "...", "views": 500, "todayViews": 20 }
    ]
  }
}
```

### GET /api/analytics
고급 통계 조회 (유입 경로, 히트맵, 챗봇)

**Query Parameters:**
- `guidebookId`: UUID (선택, 특정 가이드북 통계)
- `type`: `all` | `referrer` | `heatmap` | `chatbot` (기본: all)
- `period`: `7d` | `30d` | `90d` (기본: 7d)

**Response:**
```json
{
  "success": true,
  "data": {
    "referrer": [
      { "name": "QR 코드", "value": 120 },
      { "name": "직접 접속", "value": 80 }
    ],
    "heatmap": [
      { "day": "월", "hour": 14, "value": 25 }
    ],
    "chatbot": {
      "totalQuestions": 42,
      "helpfulCount": 35,
      "notHelpfulCount": 7,
      "topQuestions": ["체크인 시간?", "와이파이 비밀번호?"]
    }
  }
}
```

## Database Functions

### 1. `get_referrer_stats(p_guidebook_id, p_days)`
가이드북의 유입 경로별 통계 조회

### 2. `get_user_referrer_stats(p_user_id, p_days)`
사용자의 모든 가이드북 유입 경로 통계

### 3. `get_hourly_stats(p_guidebook_id, p_days)`
시간대별 접속 통계 (히트맵용)

### 4. `get_chatbot_stats(p_guidebook_id, p_days)`
챗봇 질문 통계 (Pro 플랜 이상)

## 디자인 시스템

- **컬러**: Primary (#2563EB), Secondary (#F97316)
- **타이포그래피**: Pretendard
- **그림자**: `shadow-md`, `shadow-lg`
- **간격**: `gap-4`, `gap-6`
- **반응형**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## 테스트

```bash
npm run test -- src/app/\(host\)/dashboard/analytics/page.test.tsx
```

## 의존성

- `recharts`: 차트 라이브러리
- `date-fns`: 날짜 포맷팅
- `lucide-react`: 아이콘

## 향후 개선 사항

1. **실시간 업데이트**: WebSocket으로 실시간 조회수 갱신
2. **CSV 다운로드**: 통계 데이터 내보내기
3. **비교 모드**: 가이드북 간 통계 비교
4. **목표 설정**: 월별 조회수 목표 설정 및 진행률
5. **알림 설정**: 조회수 급증 시 알림
