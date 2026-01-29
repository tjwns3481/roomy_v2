/**
 * @TASK P6-T6.2 - Toss Payments 타입 정의
 * @SPEC docs/planning/04-database-design.md#payments
 */

// ============================================================
// Toss Payments SDK 타입
// ============================================================

/**
 * Toss Payments SDK 로드 후 반환되는 객체 타입
 */
export interface TossPaymentsInstance {
  requestPayment: (
    paymentMethod: TossPaymentMethod,
    paymentInfo: TossPaymentInfo
  ) => Promise<void>;
  requestBillingAuth: (
    paymentMethod: 'CARD',
    params: TossBillingParams
  ) => Promise<void>;
}

export type TossPaymentMethod =
  | 'CARD'
  | 'VIRTUAL_ACCOUNT'
  | 'MOBILE_PHONE'
  | 'TRANSFER'
  | 'CULTURE_GIFT_CERTIFICATE'
  | 'BOOK_GIFT_CERTIFICATE'
  | 'GAME_GIFT_CERTIFICATE';

export interface TossPaymentInfo {
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
  flowMode?: 'DEFAULT' | 'DIRECT';
  easyPay?: string;
  appScheme?: string;
}

export interface TossBillingParams {
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

// ============================================================
// 결제 요청 관련
// ============================================================

/**
 * 결제 요청 API 요청 본문
 */
export interface PaymentRequestBody {
  plan: 'pro' | 'business';
  userId: string;
}

/**
 * 결제 요청 API 응답
 */
export interface PaymentRequestResponse {
  orderId: string;
  amount: number;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  failUrl: string;
}

/**
 * 결제 확인 API 요청 본문
 */
export interface PaymentConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// ============================================================
// Toss API 응답 타입
// ============================================================

/**
 * Toss Payments 결제 상태
 */
export type TossPaymentStatus =
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_DEPOSIT'
  | 'DONE'
  | 'CANCELED'
  | 'PARTIAL_CANCELED'
  | 'ABORTED'
  | 'EXPIRED';

/**
 * Toss Payments API 결제 승인 응답
 */
export interface TossPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  status: TossPaymentStatus;
  lastTransactionKey: string | null;
  orderId: string;
  orderName: string;
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card: TossCardInfo | null;
  virtualAccount: TossVirtualAccountInfo | null;
  transfer: TossTransferInfo | null;
  mobilePhone: TossMobilePhoneInfo | null;
  giftCertificate: TossGiftCertificateInfo | null;
  cashReceipt: TossCashReceiptInfo | null;
  cashReceipts: TossCashReceiptInfo[] | null;
  discount: TossDiscountInfo | null;
  cancels: TossCancelInfo[] | null;
  secret: string | null;
  type: 'NORMAL' | 'BILLING' | 'BRANDPAY';
  easyPay: TossEasyPayInfo | null;
  country: string;
  failure: TossFailureInfo | null;
  isPartialCancelable: boolean;
  receipt: TossReceiptInfo | null;
  checkout: TossCheckoutInfo | null;
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  method: string;
}

export interface TossCardInfo {
  amount: number;
  issuerCode: string;
  acquirerCode: string | null;
  number: string;
  installmentPlanMonths: number;
  approveNo: string;
  useCardPoint: boolean;
  cardType: string;
  ownerType: string;
  acquireStatus: string;
  isInterestFree: boolean;
  interestPayer: string | null;
}

export interface TossVirtualAccountInfo {
  accountType: string;
  accountNumber: string;
  bankCode: string;
  customerName: string;
  dueDate: string;
  refundStatus: string;
  expired: boolean;
  settlementStatus: string;
  refundReceiveAccount: TossRefundReceiveAccount | null;
}

export interface TossRefundReceiveAccount {
  bankCode: string;
  accountNumber: string;
  holderName: string;
}

export interface TossTransferInfo {
  bankCode: string;
  settlementStatus: string;
}

export interface TossMobilePhoneInfo {
  customerMobilePhone: string;
  settlementStatus: string;
  receiptUrl: string;
}

export interface TossGiftCertificateInfo {
  approveNo: string;
  settlementStatus: string;
}

export interface TossCashReceiptInfo {
  type: string;
  receiptKey: string;
  issueNumber: string;
  receiptUrl: string;
  amount: number;
  taxFreeAmount: number;
}

export interface TossDiscountInfo {
  amount: number;
}

export interface TossCancelInfo {
  cancelAmount: number;
  cancelReason: string;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  refundableAmount: number;
  easyPayDiscountAmount: number;
  canceledAt: string;
  transactionKey: string;
  receiptKey: string | null;
  cancelStatus: string;
  cancelRequestId: string | null;
}

export interface TossEasyPayInfo {
  provider: string;
  amount: number;
  discountAmount: number;
}

export interface TossFailureInfo {
  code: string;
  message: string;
}

export interface TossReceiptInfo {
  url: string;
}

export interface TossCheckoutInfo {
  url: string;
}

// ============================================================
// Toss Webhook 관련
// ============================================================

/**
 * Toss Webhook 이벤트 타입
 */
export type TossWebhookEventType =
  | 'PAYMENT_STATUS_CHANGED'
  | 'DEPOSIT_CALLBACK'
  | 'PAYOUT_STATUS_CHANGED';

/**
 * Toss Webhook 페이로드
 */
export interface TossWebhookPayload {
  eventType: TossWebhookEventType;
  createdAt: string;
  data: TossWebhookData;
}

export interface TossWebhookData {
  paymentKey: string;
  orderId: string;
  status: TossPaymentStatus;
  transactionKey?: string;
  secret?: string;
}

// ============================================================
// 결제 취소 관련
// ============================================================

export interface PaymentCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number; // 부분 취소 시
  refundReceiveAccount?: {
    bank: string;
    accountNumber: string;
    holderName: string;
  };
}

export interface PaymentCancelResponse {
  mId: string;
  version: string;
  paymentKey: string;
  status: TossPaymentStatus;
  cancels: TossCancelInfo[];
  balanceAmount: number;
}

// ============================================================
// 에러 응답
// ============================================================

export interface TossErrorResponse {
  code: string;
  message: string;
}

// ============================================================
// 내부 상태 관리용 타입
// ============================================================

export interface PendingPayment {
  orderId: string;
  userId: string;
  plan: 'pro' | 'business';
  amount: number;
  orderName: string;
  createdAt: string;
  expiresAt: string;
}
