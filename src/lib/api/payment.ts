import { apiClient } from './client';
import { handleApiError } from './errors';
import { PaymentStatus, PaymentMethod } from '@/types/payment';
import type {
  KakaoPayReadyRequest,
  KakaoPayReadyResponse,
  KakaoPayApproveRequest,
  KakaoPayApproveResponse,
  KakaoPayCancelRequest,
  KakaoPayCancelResponse,
  PaymentProcessData,
  PaymentCallbackData,
} from '@/types/payment';
import type { CartItem } from '@/types/api';

// ==================== KAKAO PAY API FUNCTIONS ====================

/**
 * Prepare Kakao Pay payment
 * @param paymentData - Payment preparation data
 * @returns Promise<KakaoPayReadyResponse>
 */
export const kakaoPayReady = async (paymentData: KakaoPayReadyRequest): Promise<KakaoPayReadyResponse> => {
  try {
    // Validate required fields
    if (!paymentData.partner_order_id) {
      throw new Error('Partner order ID is required');
    }
    
    if (!paymentData.partner_user_id) {
      throw new Error('Partner user ID is required');
    }
    
    if (!paymentData.item_name) {
      throw new Error('Item name is required');
    }
    
    if (paymentData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    
    if (paymentData.total_amount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    const response = await apiClient.post<KakaoPayReadyResponse>('/payment/kakao/ready', paymentData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Approve Kakao Pay payment
 * @param approvalData - Payment approval data
 * @returns Promise<KakaoPayApproveResponse>
 */
export const kakaoPayApprove = async (approvalData: KakaoPayApproveRequest): Promise<KakaoPayApproveResponse> => {
  try {
    // Validate required fields
    if (!approvalData.tid) {
      throw new Error('Transaction ID (tid) is required');
    }
    
    if (!approvalData.partner_order_id) {
      throw new Error('Partner order ID is required');
    }
    
    if (!approvalData.partner_user_id) {
      throw new Error('Partner user ID is required');
    }
    
    if (!approvalData.pg_token) {
      throw new Error('PG token is required');
    }

    const response = await apiClient.post<KakaoPayApproveResponse>('/payment/kakao/approve', approvalData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Cancel Kakao Pay payment
 * @param cancelData - Payment cancellation data
 * @returns Promise<KakaoPayCancelResponse>
 */
export const kakaoPayCancel = async (cancelData: KakaoPayCancelRequest): Promise<KakaoPayCancelResponse> => {
  try {
    // Validate required fields
    if (!cancelData.partner_order_id) {
      throw new Error('Partner order ID is required');
    }
    
    if (!cancelData.cancel_amount) {
      throw new Error('Cancel amount is required');
    }

    const response = await apiClient.post<KakaoPayCancelResponse>('/payment/kakao/cancel', cancelData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

// ==================== PAYMENT PROCESS UTILITIES ====================

/**
 * Create payment request data from cart items
 * @param processData - Payment process data
 * @returns KakaoPayReadyRequest
 */
export const createPaymentRequest = (processData: PaymentProcessData): KakaoPayReadyRequest => {
  const { orderId, userId, items, totalAmount, shippingFee } = processData;
  
  // Create item name summary
  const itemName = items.length === 1 
    ? items[0].name
    : `${items[0].name} 외 ${items.length - 1}건`;
  
  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate tax-free amount (shipping fee is typically tax-free)
  const taxFreeAmount = shippingFee;

  return {
    partner_order_id: orderId,
    partner_user_id: userId,
    item_name: itemName,
    quantity: totalQuantity,
    total_amount: totalAmount,
    tax_free_amount: taxFreeAmount,
  };
};

/**
 * Process payment callback from Kakao Pay
 * @param callbackData - Callback data from Kakao Pay redirect
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns Promise<KakaoPayApproveResponse>
 */
export const processPaymentCallback = async (
  callbackData: PaymentCallbackData,
  orderId: string,
  userId: string
): Promise<KakaoPayApproveResponse> => {
  try {
    if (!callbackData.pg_token || !callbackData.tid) {
      throw new Error('Invalid payment callback data');
    }

    const approvalData: KakaoPayApproveRequest = {
      tid: callbackData.tid,
      partner_order_id: orderId,
      partner_user_id: userId,
      pg_token: callbackData.pg_token,
    };

    return await kakaoPayApprove(approvalData);
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Format payment amount for Kakao Pay (must be integer)
 * @param amount - Amount in KRW
 * @returns Formatted integer amount
 */
export const formatPaymentAmount = (amount: number): number => {
  return Math.round(amount);
};

/**
 * Calculate shipping fee based on total amount
 * @param subtotal - Subtotal amount
 * @param freeShippingThreshold - Threshold for free shipping (default: 50000 KRW)
 * @returns Shipping fee
 */
export const calculateShippingFee = (
  subtotal: number,
  freeShippingThreshold: number = 50000
): number => {
  const standardShippingFee = 3000; // 3,000 KRW
  
  return subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
};

/**
 * Validate payment amount limits
 * @param amount - Payment amount
 * @returns boolean
 */
export const isValidPaymentAmount = (amount: number): boolean => {
  const minAmount = 100; // 100 KRW minimum
  const maxAmount = 2000000; // 2,000,000 KRW maximum for Kakao Pay
  
  return amount >= minAmount && amount <= maxAmount;
};

/**
 * Get payment method display name
 * @param method - Payment method
 * @returns Display name in Korean
 */
export const getPaymentMethodName = (method: PaymentMethod): string => {
  const methodNames: Record<PaymentMethod, string> = {
    [PaymentMethod.KAKAO_PAY]: '카카오페이',
    [PaymentMethod.CREDIT_CARD]: '신용카드',
    [PaymentMethod.BANK_TRANSFER]: '무통장입금',
    [PaymentMethod.VIRTUAL_ACCOUNT]: '가상계좌',
  };
  
  return methodNames[method] || method;
};

/**
 * Get payment status display name
 * @param status - Payment status
 * @returns Display name in Korean
 */
export const getPaymentStatusName = (status: PaymentStatus): string => {
  const statusNames: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: '결제 대기',
    [PaymentStatus.READY]: '결제 준비',
    [PaymentStatus.IN_PROGRESS]: '결제 진행중',
    [PaymentStatus.APPROVED]: '결제 완료',
    [PaymentStatus.CANCELLED]: '결제 취소',
    [PaymentStatus.FAILED]: '결제 실패',
    [PaymentStatus.EXPIRED]: '결제 만료',
  };
  
  return statusNames[status] || status;
};

/**
 * Parse payment callback URL parameters
 * @param url - Callback URL with parameters
 * @returns PaymentCallbackData
 */
export const parsePaymentCallback = (url: string): PaymentCallbackData => {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    return {
      pg_token: params.get('pg_token') || undefined,
      tid: params.get('tid') || undefined,
      order_id: params.get('order_id') || undefined,
    };
  } catch (error) {
    console.error('Error parsing payment callback URL:', error);
    return {};
  }
};

/**
 * Convert cart items to payment items
 * @param cartItems - Cart items from Zustand store
 * @returns Payment items
 */
export const convertCartToPaymentItems = (cartItems: CartItem[]) => {
  return cartItems.map(item => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    options: item.options,
  }));
};

/**
 * Validate payment form data
 * @param paymentData - Payment process data
 * @returns Object with validation results
 */
export const validatePaymentData = (paymentData: PaymentProcessData) => {
  const errors: string[] = [];
  
  // Validate customer info
  if (!paymentData.customerInfo.name.trim()) {
    errors.push('고객 이름은 필수입니다.');
  }
  
  if (!paymentData.customerInfo.email.trim()) {
    errors.push('이메일은 필수입니다.');
  }
  
  if (!paymentData.customerInfo.phone.trim()) {
    errors.push('전화번호는 필수입니다.');
  }
  
  // Validate shipping address
  if (!paymentData.shippingAddress.recipient.trim()) {
    errors.push('수령인 이름은 필수입니다.');
  }
  
  if (!paymentData.shippingAddress.address.trim()) {
    errors.push('배송 주소는 필수입니다.');
  }
  
  if (!paymentData.shippingAddress.postalCode.trim()) {
    errors.push('우편번호는 필수입니다.');
  }
  
  // Validate items
  if (!paymentData.items || paymentData.items.length === 0) {
    errors.push('주문할 상품이 없습니다.');
  }
  
  // Validate payment amount
  if (!isValidPaymentAmount(paymentData.totalAmount)) {
    errors.push('결제 금액이 유효하지 않습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};