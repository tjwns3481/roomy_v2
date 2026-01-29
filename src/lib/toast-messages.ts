// @TASK P7-T7.7 - 토스트 메시지 상수
// @SPEC docs/planning/06-tasks.md#P7-T7.7

/**
 * 공통 토스트 메시지 상수
 *
 * 일관된 메시지를 위해 여기서 관리합니다.
 */
export const TOAST_MESSAGES = {
  // === 저장 관련 ===
  SAVE_SUCCESS: '저장되었습니다',
  SAVE_ERROR: '저장에 실패했습니다',
  SAVE_LOADING: '저장 중...',

  // === 복사 관련 ===
  COPY_SUCCESS: '클립보드에 복사되었습니다',
  COPY_ERROR: '복사에 실패했습니다',

  // === 삭제 관련 ===
  DELETE_SUCCESS: '삭제되었습니다',
  DELETE_ERROR: '삭제에 실패했습니다',
  DELETE_CONFIRM: '정말 삭제하시겠습니까?',

  // === 인증 관련 ===
  LOGIN_SUCCESS: '로그인되었습니다',
  LOGIN_ERROR: '로그인에 실패했습니다',
  LOGOUT_SUCCESS: '로그아웃되었습니다',
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다',
  SIGNUP_ERROR: '회원가입에 실패했습니다',
  AUTH_REQUIRED: '로그인이 필요합니다',

  // === 결제 관련 ===
  PAYMENT_SUCCESS: '결제가 완료되었습니다',
  PAYMENT_ERROR: '결제에 실패했습니다',
  PAYMENT_LOADING: '결제 처리 중...',
  SUBSCRIPTION_SUCCESS: '구독이 완료되었습니다',
  SUBSCRIPTION_CANCEL_SUCCESS: '구독이 취소되었습니다',

  // === 공유 관련 ===
  SHARE_SUCCESS: '공유 링크가 생성되었습니다',
  SHARE_ERROR: '공유 링크 생성에 실패했습니다',
  QR_DOWNLOAD_SUCCESS: 'QR 코드가 다운로드되었습니다',
  QR_DOWNLOAD_ERROR: 'QR 코드 다운로드에 실패했습니다',

  // === AI 생성 관련 ===
  AI_GENERATING: 'AI가 콘텐츠를 생성 중입니다...',
  AI_SUCCESS: 'AI 생성이 완료되었습니다',
  AI_ERROR: 'AI 생성에 실패했습니다',
  AI_LIMIT_EXCEEDED: 'AI 생성 횟수가 초과되었습니다',

  // === 가이드북 관련 ===
  GUIDEBOOK_CREATE_SUCCESS: '가이드북이 생성되었습니다',
  GUIDEBOOK_CREATE_ERROR: '가이드북 생성에 실패했습니다',
  GUIDEBOOK_UPDATE_SUCCESS: '가이드북이 수정되었습니다',
  GUIDEBOOK_UPDATE_ERROR: '가이드북 수정에 실패했습니다',
  GUIDEBOOK_DELETE_SUCCESS: '가이드북이 삭제되었습니다',
  GUIDEBOOK_DELETE_ERROR: '가이드북 삭제에 실패했습니다',
  GUIDEBOOK_ARCHIVE_SUCCESS: '가이드북이 보관되었습니다',
  GUIDEBOOK_LIMIT_EXCEEDED: '가이드북 생성 제한을 초과했습니다',

  // === 업로드 관련 ===
  UPLOAD_SUCCESS: '파일이 업로드되었습니다',
  UPLOAD_ERROR: '파일 업로드에 실패했습니다',
  UPLOAD_LOADING: '파일 업로드 중...',
  UPLOAD_SIZE_ERROR: '파일 크기가 너무 큽니다',
  UPLOAD_TYPE_ERROR: '지원하지 않는 파일 형식입니다',

  // === 일반 에러 ===
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
  PERMISSION_DENIED: '권한이 없습니다',

  // === 성공 메시지 ===
  UPDATE_SUCCESS: '수정되었습니다',
  CREATE_SUCCESS: '생성되었습니다',
  SEND_SUCCESS: '전송되었습니다',

  // === 플랜 제한 ===
  PLAN_UPGRADE_REQUIRED: '프리미엄 플랜으로 업그레이드가 필요합니다',
  PLAN_LIMIT_WARNING: (current: number, limit: number) =>
    `${current}/${limit}개 사용 중입니다. 곧 제한에 도달합니다.`,
} as const;

/**
 * 특정 액션별 토스트 메시지 생성기
 */
export const createToastMessages = {
  /**
   * 저장 중 Promise 메시지
   */
  saving: () => ({
    loading: TOAST_MESSAGES.SAVE_LOADING,
    success: TOAST_MESSAGES.SAVE_SUCCESS,
    error: TOAST_MESSAGES.SAVE_ERROR,
  }),

  /**
   * 삭제 중 Promise 메시지
   */
  deleting: (itemName?: string) => ({
    loading: `${itemName || '항목'}을 삭제 중...`,
    success: TOAST_MESSAGES.DELETE_SUCCESS,
    error: TOAST_MESSAGES.DELETE_ERROR,
  }),

  /**
   * 업로드 중 Promise 메시지
   */
  uploading: () => ({
    loading: TOAST_MESSAGES.UPLOAD_LOADING,
    success: TOAST_MESSAGES.UPLOAD_SUCCESS,
    error: TOAST_MESSAGES.UPLOAD_ERROR,
  }),

  /**
   * AI 생성 중 Promise 메시지
   */
  aiGenerating: () => ({
    loading: TOAST_MESSAGES.AI_GENERATING,
    success: TOAST_MESSAGES.AI_SUCCESS,
    error: TOAST_MESSAGES.AI_ERROR,
  }),

  /**
   * 결제 중 Promise 메시지
   */
  processing: () => ({
    loading: TOAST_MESSAGES.PAYMENT_LOADING,
    success: TOAST_MESSAGES.PAYMENT_SUCCESS,
    error: TOAST_MESSAGES.PAYMENT_ERROR,
  }),
};
