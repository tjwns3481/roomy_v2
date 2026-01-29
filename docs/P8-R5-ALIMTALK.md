# P8-R5: 알림톡 발송 로그 리소스

> **@TASK P8-R5** - 카카오 알림톡 발송 및 이력 추적 (Business 플랜 전용)

## 개요

카카오 비즈니스 메시지 API를 통해 게스트에게 알림톡을 발송하고, 발송 이력을 추적하는 기능입니다.

## 구현 내용

### 1. Database Schema

**테이블**: `alimtalk_logs`

```sql
CREATE TABLE alimtalk_logs (
  id UUID PRIMARY KEY,
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id),
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- 발송 정보
  template_code VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100),

  -- 상태 추적
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- 에러 처리
  error_message TEXT,
  error_code VARCHAR(50),

  -- 메타데이터
  message_content TEXT,
  kakao_message_id VARCHAR(100),
  template_params JSONB,
  cost_krw INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**인덱스**:
- `idx_alimtalk_logs_guidebook_id` - 가이드북별 조회
- `idx_alimtalk_logs_user_id` - 사용자별 조회
- `idx_alimtalk_logs_status` - 상태별 필터링
- `idx_alimtalk_logs_sent_at` - 시간순 정렬

**RLS 정책**:
- 조회: 본인 가이드북만
- 삽입: Business 플랜만
- 업데이트/삭제: 본인 로그만

### 2. API Endpoints

#### POST /api/notifications/alimtalk/send

알림톡 발송

**Request**:
```json
{
  "guidebookId": "uuid",
  "templateCode": "GUIDEBOOK_SHARE_001",
  "recipientPhone": "010-1234-5678",
  "recipientName": "홍길동",
  "templateParams": {
    "recipientName": "홍길동",
    "guidebookTitle": "제주 숙소 가이드",
    "guidebookUrl": "https://roomy.app/g/jeju-stay"
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "messageId": "MOCK_1706432100_abc123",
  "message": "알림톡이 발송되었습니다."
}
```

**Response (Error)**:
```json
{
  "error": {
    "code": "PLAN_REQUIRED",
    "message": "알림톡 발송은 Business 플랜에서만 사용 가능합니다.",
    "upgradeUrl": "/settings/billing"
  }
}
```

**에러 코드**:
- `UNAUTHORIZED` (401) - 로그인 필요
- `PLAN_REQUIRED` (402) - Business 플랜 필요
- `INVALID_PHONE` (400) - 잘못된 전화번호
- `INVALID_TEMPLATE` (400) - 잘못된 템플릿
- `NOT_FOUND` (404) - 가이드북 없음
- `SEND_FAILED` (500) - 발송 실패

#### GET /api/notifications/alimtalk/send

사용 가능한 템플릿 목록 조회

**Response**:
```json
{
  "templates": [
    {
      "code": "GUIDEBOOK_SHARE_001",
      "name": "가이드북 공유 알림",
      "variables": ["recipientName", "guidebookTitle", "guidebookUrl"],
      "description": "게스트에게 가이드북 링크를 전송합니다."
    }
  ]
}
```

#### GET /api/notifications/alimtalk

발송 이력 조회

**Query Parameters**:
- `guidebook_id` (optional) - 가이드북 필터
- `limit` (default: 50) - 페이지 크기
- `offset` (default: 0) - 페이지 오프셋

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "guidebook_id": "uuid",
      "template_code": "GUIDEBOOK_SHARE_001",
      "recipient_phone": "010-1234-5678",
      "recipient_name": "홍길동",
      "status": "sent",
      "sent_at": "2024-01-28T10:00:00Z",
      "message_content": "가이드북 공유 알림",
      "cost_krw": 8,
      "created_at": "2024-01-28T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

### 3. 라이브러리: `@/lib/kakao/alimtalk.ts`

**주요 함수**:

```typescript
// 알림톡 발송
export async function sendAlimtalk(params: SendAlimtalkParams): Promise<AlimtalkResult>

// 템플릿 메시지 생성
export function buildTemplateMessage(template: string, params: Record<string, string>): string

// 전화번호 검증
export function isValidPhoneNumber(phone: string): boolean

// 템플릿 검증
export function validateTemplate(templateCode: string, params: Record<string, string>): { valid: boolean; error?: string }
```

**Mock Mode**:
- 개발 환경에서는 실제 API 호출 없이 Mock 응답 반환
- `KAKAO_ALIMTALK_API_KEY` 환경 변수 없으면 자동으로 Mock 모드
- 90% 성공률로 랜덤 응답

### 4. 템플릿 정의

```typescript
export const ALIMTALK_TEMPLATES = {
  GUIDEBOOK_SHARE: {
    code: 'GUIDEBOOK_SHARE_001',
    variables: ['recipientName', 'guidebookTitle', 'guidebookUrl'],
    description: '게스트에게 가이드북 링크를 전송합니다.',
  },
  CHECK_IN_INFO: {
    code: 'CHECK_IN_INFO_001',
    variables: ['recipientName', 'propertyName', 'checkInDate', 'guidebookUrl'],
    description: '체크인 전 가이드북과 숙소 정보를 전송합니다.',
  },
  WIFI_INFO: {
    code: 'WIFI_INFO_001',
    variables: ['propertyName', 'wifiName', 'wifiPassword'],
    description: 'Wi-Fi 접속 정보를 전송합니다.',
  },
  EMERGENCY_CONTACT: {
    code: 'EMERGENCY_CONTACT_001',
    variables: ['propertyName', 'hostPhone', 'emergencyPhone'],
    description: '긴급 상황 시 연락처를 전송합니다.',
  },
};
```

## 환경 변수

```bash
# .env.local

# 카카오 알림톡 설정 (프로덕션 전용)
KAKAO_ALIMTALK_API_KEY=your_kakao_api_key
KAKAO_SENDER_KEY=your_sender_key
KAKAO_API_URL=https://kapi.kakao.com/v1/alimtalk
```

## 사용 예시

### 프론트엔드에서 알림톡 발송

```typescript
// src/hooks/useAlimtalk.ts
async function sendGuidebookShare(guidebookId: string, recipientPhone: string, recipientName: string) {
  const response = await fetch('/api/notifications/alimtalk/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guidebookId,
      templateCode: 'GUIDEBOOK_SHARE_001',
      recipientPhone,
      recipientName,
      templateParams: {
        recipientName,
        guidebookTitle: 'My Guidebook',
        guidebookUrl: `https://roomy.app/g/${slug}`,
      },
    }),
  });

  return response.json();
}
```

### 발송 이력 조회

```typescript
async function getAlimtalkLogs(guidebookId: string) {
  const response = await fetch(`/api/notifications/alimtalk?guidebook_id=${guidebookId}`);
  return response.json();
}
```

## 보안

1. **RLS 정책**: 사용자는 본인 가이드북의 로그만 조회 가능
2. **플랜 체크**: Business 플랜 사용자만 발송 가능
3. **전화번호 검증**: 한국 전화번호 형식만 허용 (010-xxxx-xxxx)
4. **비밀키 보호**: 카카오 API 키는 서버에서만 사용

## 비용

- 카카오 알림톡 발송 비용: 약 8원/건 (템플릿당 다름)
- `cost_krw` 필드에 자동 기록

## 테스트

```bash
# 테스트 실행
npm test -- src/app/api/notifications/alimtalk

# 특정 테스트
npm test -- src/app/api/notifications/alimtalk/send/route.test.ts
```

**테스트 커버리지**:
- ✅ 인증 검증
- ✅ Business 플랜 체크
- ✅ 전화번호 검증
- ✅ 템플릿 검증
- ✅ 알림톡 발송 성공
- ✅ 알림톡 발송 실패
- ✅ 발송 이력 조회
- ✅ 페이지네이션

## 참고 문서

- [카카오 비즈니스 메시지 API](https://kakaobusiness.gitbook.io/main/ad/bizmessage)
- [알림톡 템플릿 등록 가이드](https://kakaobusiness.gitbook.io/main/ad/bizmessage/template)

## 다음 단계

1. 카카오 비즈니스 계정 생성
2. 템플릿 등록 및 승인 대기
3. 프로덕션 환경에 API 키 설정
4. 프론트엔드 UI 구현 (대시보드 알림 발송 버튼)

---

**완료일**: 2026-01-29
**담당자**: Backend Specialist (Claude Code)
