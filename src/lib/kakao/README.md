# 카카오 알림톡 클라이언트

> @TASK P8-R5 - 카카오 비즈니스 메시지 API 통합

## 개요

Roomy 가이드북과 연동하여 게스트에게 알림톡을 발송하는 라이브러리입니다.

## 설치

```bash
# 환경 변수 설정
cp .env.example .env.local

# .env.local 파일에 추가
KAKAO_ALIMTALK_API_KEY=your_api_key
KAKAO_SENDER_KEY=your_sender_key
```

## 사용법

### 1. 기본 발송

```typescript
import { sendAlimtalk } from '@/lib/kakao/alimtalk';

const result = await sendAlimtalk({
  templateCode: 'GUIDEBOOK_SHARE_001',
  recipientPhone: '010-1234-5678',
  recipientName: '홍길동',
  templateParams: {
    recipientName: '홍길동',
    guidebookTitle: '제주 숙소 가이드',
    guidebookUrl: 'https://roomy.app/g/jeju-stay',
  },
  guidebookId: 'uuid',
});

if (result.success) {
  console.log('발송 성공:', result.messageId);
} else {
  console.error('발송 실패:', result.error);
}
```

### 2. 전화번호 검증

```typescript
import { isValidPhoneNumber } from '@/lib/kakao/alimtalk';

if (isValidPhoneNumber('010-1234-5678')) {
  // 발송 로직
}
```

### 3. 템플릿 검증

```typescript
import { validateTemplate, ALIMTALK_TEMPLATES } from '@/lib/kakao/alimtalk';

const validation = validateTemplate('GUIDEBOOK_SHARE_001', {
  recipientName: '홍길동',
  guidebookTitle: '제주 숙소',
  guidebookUrl: 'https://...',
});

if (!validation.valid) {
  console.error(validation.error);
}
```

### 4. 템플릿 목록 조회

```typescript
import { ALIMTALK_TEMPLATES } from '@/lib/kakao/alimtalk';

// 모든 템플릿 출력
Object.values(ALIMTALK_TEMPLATES).forEach((template) => {
  console.log(`${template.name}: ${template.code}`);
  console.log(`필수 변수: ${template.variables.join(', ')}`);
});
```

## API 사용

### 알림톡 발송 API

```typescript
const response = await fetch('/api/notifications/alimtalk/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guidebookId: 'uuid',
    templateCode: 'GUIDEBOOK_SHARE_001',
    recipientPhone: '010-1234-5678',
    recipientName: '홍길동',
    templateParams: {
      recipientName: '홍길동',
      guidebookTitle: '제주 숙소',
      guidebookUrl: 'https://roomy.app/g/jeju',
    },
  }),
});

const data = await response.json();
```

### 발송 이력 조회 API

```typescript
const response = await fetch('/api/notifications/alimtalk?guidebook_id=uuid&limit=10');
const { data, pagination } = await response.json();

data.forEach((log) => {
  console.log(`${log.recipient_name}: ${log.status}`);
});
```

## 템플릿

### 1. 가이드북 공유 (GUIDEBOOK_SHARE_001)

게스트에게 가이드북 링크를 전송합니다.

**필수 변수**:
- `recipientName` - 수신자 이름
- `guidebookTitle` - 가이드북 제목
- `guidebookUrl` - 가이드북 URL

**예시**:
```
안녕하세요 #{recipientName}님!
#{guidebookTitle} 가이드북이 공유되었습니다.
아래 링크에서 확인하세요:
#{guidebookUrl}
```

### 2. 체크인 안내 (CHECK_IN_INFO_001)

체크인 전 숙소 정보를 전송합니다.

**필수 변수**:
- `recipientName` - 수신자 이름
- `propertyName` - 숙소 이름
- `checkInDate` - 체크인 날짜
- `guidebookUrl` - 가이드북 URL

### 3. Wi-Fi 정보 (WIFI_INFO_001)

Wi-Fi 접속 정보를 전송합니다.

**필수 변수**:
- `propertyName` - 숙소 이름
- `wifiName` - Wi-Fi 이름
- `wifiPassword` - Wi-Fi 비밀번호

### 4. 긴급 연락처 (EMERGENCY_CONTACT_001)

긴급 상황 시 연락처를 전송합니다.

**필수 변수**:
- `propertyName` - 숙소 이름
- `hostPhone` - 호스트 전화번호
- `emergencyPhone` - 긴급 연락처

## Mock 모드

개발 환경에서는 자동으로 Mock 모드로 실행됩니다.

```typescript
// KAKAO_ALIMTALK_API_KEY가 없으면 Mock 모드
const result = await sendAlimtalk({...});
// → 실제 API 호출 없이 Mock 응답 반환
```

**Mock 동작**:
- 90% 확률로 성공 응답
- 10% 확률로 랜덤 실패
- `messageId`: `MOCK_{timestamp}_{random}`

## 에러 처리

```typescript
const result = await sendAlimtalk({...});

if (!result.success) {
  switch (result.error?.code) {
    case 'INVALID_PHONE':
      // 전화번호 재입력 요청
      break;
    case 'KAKAO_API_ERROR':
      // 카카오 API 오류
      break;
    case 'NETWORK_ERROR':
      // 네트워크 오류
      break;
  }
}
```

## 보안 주의사항

1. **서버에서만 사용**: API 키를 클라이언트에 노출하지 마세요.
2. **전화번호 암호화**: 개인정보 보호를 위해 DB에 암호화 저장 권장
3. **Rate Limiting**: 남용 방지를 위해 발송 빈도 제한 고려

## 비용

- 알림톡 발송 비용: 약 8원/건
- 템플릿당 비용이 다를 수 있으므로 카카오 비즈니스 콘솔 확인 필요

## 참고

- [카카오 비즈니스 메시지 API](https://kakaobusiness.gitbook.io/main/ad/bizmessage)
- [템플릿 등록 가이드](https://kakaobusiness.gitbook.io/main/ad/bizmessage/template)
