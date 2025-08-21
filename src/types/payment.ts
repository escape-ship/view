// ==================== KAKAO PAY TYPES ====================

// Kakao Pay Ready Request (준비 요청)
export interface KakaoPayReadyRequest {
  partner_order_id: string;    // 주문번호
  partner_user_id: string;     // 사용자 ID
  item_name: string;           // 상품명
  quantity: number;            // int32 - 수량
  total_amount: number;        // int64 - 총 금액
  tax_free_amount: number;     // int64 - 비과세 금액
}

// Kakao Pay Ready Response (준비 응답)
export interface KakaoPayReadyResponse {
  tid: string;                        // 결제 고유번호
  next_redirect_app_url: string;      // 모바일 앱 리다이렉트 URL
  next_redirect_mobile_url: string;   // 모바일 웹 리다이렉트 URL
  next_redirect_pc_url: string;       // PC 웹 리다이렉트 URL
  android_app_scheme: string;         // 안드로이드 앱 스킴
  ios_app_scheme: string;             // iOS 앱 스킴
}

// Kakao Pay Approve Request (승인 요청)
export interface KakaoPayApproveRequest {
  tid: string;                 // 결제 고유번호
  partner_order_id: string;    // 주문번호
  partner_user_id: string;     // 사용자 ID
  pg_token: string;            // 결제승인 요청을 인증하는 토큰
}

// Kakao Pay Approve Response (승인 응답)
export interface KakaoPayApproveResponse {
  partner_order_id: string;    // 주문번호
  // 실제 Kakao Pay API에는 더 많은 필드가 있지만 백엔드에서 간소화됨
}

// Kakao Pay Cancel Request (취소 요청)
export interface KakaoPayCancelRequest {
  partner_order_id: string;         // 주문번호
  cancel_amount: string;            // 취소 금액 (string으로 전달)
  cancel_tax_free_amount: number;   // int64 - 취소 비과세 금액
  cancel_vat_amount: number;        // int64 - 취소 부가세 금액
  cancel_available_amount: number;  // int64 - 취소 가능 금액
}

// Kakao Pay Cancel Response (취소 응답)
export interface KakaoPayCancelResponse {
  partner_order_id: string;    // 주문번호
}

// ==================== PAYMENT STATUS TYPES ====================

export enum PaymentStatus {
  PENDING = 'pending',           // 결제 대기
  READY = 'ready',              // 결제 준비 완료
  IN_PROGRESS = 'in_progress',  // 결제 진행 중
  APPROVED = 'approved',        // 결제 승인 완료
  CANCELLED = 'cancelled',      // 결제 취소
  FAILED = 'failed',            // 결제 실패
  EXPIRED = 'expired',          // 결제 만료
}

export enum PaymentMethod {
  KAKAO_PAY = 'kakao_pay',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  VIRTUAL_ACCOUNT = 'virtual_account',
}

// ==================== INTERNAL PAYMENT TYPES ====================

// Frontend payment state
export interface PaymentState {
  status: PaymentStatus;
  method?: PaymentMethod;
  tid?: string;                    // Kakao Pay transaction ID
  orderId?: string;               // Order ID
  amount?: number;                // Payment amount
  error?: string;                 // Error message if failed
  redirectUrl?: string;           // URL for payment redirect
}

// Payment process data
export interface PaymentProcessData {
  orderId: string;
  userId: string;
  items: PaymentItem[];
  totalAmount: number;
  shippingFee: number;
  taxFreeAmount?: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    recipient: string;
    address: string;
    detailAddress: string;
    postalCode: string;
    phone: string;
  };
}

export interface PaymentItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, unknown>;
}

// Payment callback data (from Kakao Pay redirect)
export interface PaymentCallbackData {
  pg_token?: string;      // 결제 승인용 토큰
  tid?: string;          // 결제 고유번호
  order_id?: string;     // 주문번호
}

// ==================== PAYMENT FORM TYPES ====================

export interface PaymentFormData {
  paymentMethod: PaymentMethod;
  agreementChecked: boolean;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Shipping information
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingDetailAddress: string;
  shippingPostalCode: string;
  
  // Additional options
  memo?: string;
  useCustomerInfoForShipping: boolean;
}

// ==================== PAYMENT HISTORY TYPES ====================

export interface PaymentHistory {
  id: string;
  orderId: string;
  userId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  tid?: string;              // Kakao Pay transaction ID
  paidAt?: string;           // ISO date string
  cancelledAt?: string;      // ISO date string
  failureReason?: string;    // Failure reason if status is failed
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
}

// ==================== UTILITY TYPES ====================

// Type guard for Kakao Pay specific data
export interface IsKakaoPayment {
  method: PaymentMethod.KAKAO_PAY;
  tid: string;
  pg_token?: string;
}

// Payment error types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Common payment errors
export enum PaymentErrorCode {
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}