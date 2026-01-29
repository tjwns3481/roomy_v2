/**
 * @TASK P8-R5 - 카카오 알림톡 클라이언트
 *
 * 카카오 비즈니스 메시지 API를 통해 알림톡을 발송합니다.
 * 실제 발송을 위해서는 카카오 비즈니스 계정과 템플릿 승인이 필요합니다.
 *
 * @see https://kakaobusiness.gitbook.io/main/ad/bizmessage
 */

// ============================================
// Types
// ============================================

export interface AlimtalkTemplate {
  code: string; // 템플릿 코드
  name: string; // 템플릿 이름
  variables: string[]; // 템플릿 변수 (#{변수명} 형식)
  description: string;
}

export interface SendAlimtalkParams {
  templateCode: string;
  recipientPhone: string;
  recipientName?: string;
  templateParams: Record<string, string>;
  guidebookId: string;
}

export interface AlimtalkResult {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AlimtalkConfig {
  apiKey: string;
  senderKey: string;
  apiUrl: string;
}

// ============================================
// Mock Mode (개발 환경용)
// ============================================

const MOCK_MODE = !process.env.KAKAO_ALIMTALK_API_KEY;

/**
 * Mock 알림톡 발송 (개발/테스트 환경)
 */
async function sendAlimtalkMock(params: SendAlimtalkParams): Promise<AlimtalkResult> {
  console.log('[MOCK] 알림톡 발송 시뮬레이션:', {
    templateCode: params.templateCode,
    recipientPhone: params.recipientPhone,
    recipientName: params.recipientName,
    templateParams: params.templateParams,
  });

  // 전화번호 형식 검증
  if (!isValidPhoneNumber(params.recipientPhone)) {
    return {
      success: false,
      error: {
        code: 'INVALID_PHONE',
        message: '유효하지 않은 전화번호 형식입니다.',
      },
    };
  }

  // Mock 성공 응답 (90% 성공률)
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    return {
      success: true,
      messageId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return {
      success: false,
      error: {
        code: 'MOCK_RANDOM_FAILURE',
        message: 'Mock 랜덤 실패 (10% 확률)',
      },
    };
  }
}

// ============================================
// 실제 알림톡 발송 (프로덕션)
// ============================================

/**
 * 카카오 알림톡 발송
 *
 * @see https://kakaobusiness.gitbook.io/main/ad/bizmessage/api
 */
async function sendAlimtalkReal(
  params: SendAlimtalkParams,
  config: AlimtalkConfig
): Promise<AlimtalkResult> {
  try {
    // 전화번호 정규화 (010-1234-5678 -> 01012345678)
    const normalizedPhone = normalizePhoneNumber(params.recipientPhone);

    // 카카오 API 호출
    const response = await fetch(`${config.apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        senderKey: config.senderKey,
        templateCode: params.templateCode,
        recipientNo: normalizedPhone,
        recipientName: params.recipientName,
        templateParameter: params.templateParams,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || 'KAKAO_API_ERROR',
          message: data.message || '알림톡 발송 실패',
        },
      };
    }

    return {
      success: true,
      messageId: data.messageId || data.id,
    };
  } catch (error) {
    console.error('[Kakao Alimtalk] 발송 실패:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '네트워크 오류',
      },
    };
  }
}

// ============================================
// Public API
// ============================================

/**
 * 알림톡 발송 (Mock/Real 자동 선택)
 */
export async function sendAlimtalk(params: SendAlimtalkParams): Promise<AlimtalkResult> {
  if (MOCK_MODE) {
    return sendAlimtalkMock(params);
  }

  const config: AlimtalkConfig = {
    apiKey: process.env.KAKAO_ALIMTALK_API_KEY!,
    senderKey: process.env.KAKAO_SENDER_KEY!,
    apiUrl: process.env.KAKAO_API_URL || 'https://kapi.kakao.com/v1/alimtalk',
  };

  return sendAlimtalkReal(params, config);
}

/**
 * 템플릿 메시지 생성
 */
export function buildTemplateMessage(
  template: string,
  params: Record<string, string>
): string {
  let message = template;

  // #{변수명} 형식의 변수를 실제 값으로 치환
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(new RegExp(`#{${key}}`, 'g'), value);
  }

  return message;
}

/**
 * 전화번호 정규화 (하이픈 제거)
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[-\s]/g, '');
}

/**
 * 전화번호 형식 검증
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // 한국 전화번호 형식: 010으로 시작하는 11자리
  return /^010\d{8}$/.test(normalized);
}

// ============================================
// 템플릿 정의 (카카오 비즈니스에 등록된 템플릿)
// ============================================

export const ALIMTALK_TEMPLATES: Record<string, AlimtalkTemplate> = {
  GUIDEBOOK_SHARE: {
    code: 'GUIDEBOOK_SHARE_001',
    name: '가이드북 공유 알림',
    variables: ['recipientName', 'guidebookTitle', 'guidebookUrl'],
    description: '게스트에게 가이드북 링크를 전송합니다.',
  },
  CHECK_IN_INFO: {
    code: 'CHECK_IN_INFO_001',
    name: '체크인 정보 안내',
    variables: ['recipientName', 'propertyName', 'checkInDate', 'guidebookUrl'],
    description: '체크인 전 가이드북과 숙소 정보를 전송합니다.',
  },
  WIFI_INFO: {
    code: 'WIFI_INFO_001',
    name: 'Wi-Fi 정보 안내',
    variables: ['propertyName', 'wifiName', 'wifiPassword'],
    description: 'Wi-Fi 접속 정보를 전송합니다.',
  },
  EMERGENCY_CONTACT: {
    code: 'EMERGENCY_CONTACT_001',
    name: '긴급 연락처 안내',
    variables: ['propertyName', 'hostPhone', 'emergencyPhone'],
    description: '긴급 상황 시 연락처를 전송합니다.',
  },
};

/**
 * 템플릿 유효성 검증
 */
export function validateTemplate(
  templateCode: string,
  params: Record<string, string>
): { valid: boolean; error?: string } {
  const template = Object.values(ALIMTALK_TEMPLATES).find((t) => t.code === templateCode);

  if (!template) {
    return {
      valid: false,
      error: `유효하지 않은 템플릿 코드: ${templateCode}`,
    };
  }

  // 필수 변수 체크
  const missingVars = template.variables.filter((v) => !params[v]);
  if (missingVars.length > 0) {
    return {
      valid: false,
      error: `필수 변수 누락: ${missingVars.join(', ')}`,
    };
  }

  return { valid: true };
}
