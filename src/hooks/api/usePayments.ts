'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  kakaoPayReady,
  kakaoPayApprove,
  kakaoPayCancel,
  createPaymentRequest,
  processPaymentCallback,
  calculateShippingFee,
  isValidPaymentAmount,
  parsePaymentCallback,
} from '@/lib/api/payment';
import { useAuth } from '@/store/authProvider';
import { useCartStore } from '@/store/cartStore';
import { orderKeys } from './useOrders';
import { toast } from 'sonner';
import type {
  KakaoPayReadyRequest,
  KakaoPayReadyResponse,
  KakaoPayApproveRequest,
  KakaoPayApproveResponse,
  KakaoPayCancelRequest,
  KakaoPayCancelResponse,
  PaymentProcessData,
  PaymentCallbackData,
  PaymentStatus,
} from '@/types/payment';

// ==================== MUTATION HOOKS ====================

/**
 * Hook to prepare Kakao Pay payment
 */
export const useKakaoPayReady = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (paymentData: KakaoPayReadyRequest) => kakaoPayReady(paymentData),
    onSuccess: (response: KakaoPayReadyResponse) => {
      // Store transaction ID for later use
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kakao_pay_tid', response.tid);
      }

      // Redirect to Kakao Pay
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      const redirectUrl = isMobile 
        ? response.next_redirect_mobile_url 
        : response.next_redirect_pc_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No redirect URL received from Kakao Pay');
      }
    },
    onError: (error: any) => {
      console.error('Kakao Pay ready error:', error);
      
      const errorMessage = error.userMessage || '카카오페이 결제 준비에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to approve Kakao Pay payment
 */
export const useKakaoPayApprove = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (approvalData: KakaoPayApproveRequest) => kakaoPayApprove(approvalData),
    onSuccess: (response: KakaoPayApproveResponse) => {
      // Clear stored transaction ID
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('kakao_pay_tid');
      }

      // Invalidate orders cache (new order will appear)
      queryClient.invalidateQueries({ queryKey: orderKeys.all });

      toast.success('결제가 완료되었습니다.');
      
      // Navigate to payment success page
      router.push(`/payment/success?order_id=${response.partner_order_id}`);
    },
    onError: (error: any) => {
      console.error('Kakao Pay approve error:', error);
      
      const errorMessage = error.userMessage || '결제 승인에 실패했습니다.';
      toast.error(errorMessage);
      
      // Navigate to payment failure page
      router.push('/payment/failure');
    },
  });
};

/**
 * Hook to cancel Kakao Pay payment
 */
export const useKakaoPayCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cancelData: KakaoPayCancelRequest) => kakaoPayCancel(cancelData),
    onSuccess: (response: KakaoPayCancelResponse) => {
      // Invalidate orders cache (order status will change)
      queryClient.invalidateQueries({ queryKey: orderKeys.all });

      toast.success('결제가 취소되었습니다.');
    },
    onError: (error: any) => {
      console.error('Kakao Pay cancel error:', error);
      
      const errorMessage = error.userMessage || '결제 취소에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to initiate payment from cart
 */
export const usePaymentFromCart = () => {
  const auth = useAuth();
  const { items: cartItems } = useCartStore();
  const kakaoPayReadyMutation = useKakaoPayReady();

  const initiatePayment = (paymentData: {
    shippingAddress: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    memo?: string;
  }) => {
    if (!auth.user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = calculateShippingFee(subtotal);
    const totalAmount = subtotal + shippingFee;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Validate payment amount
    if (!isValidPaymentAmount(totalAmount)) {
      toast.error('결제 금액이 유효하지 않습니다.');
      return;
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${auth.user.id.slice(-4)}`;

    // Create item name
    const itemName = cartItems.length === 1 
      ? cartItems[0].name
      : `${cartItems[0].name} 외 ${cartItems.length - 1}건`;

    // Create payment request
    const paymentRequest: KakaoPayReadyRequest = {
      partner_order_id: orderNumber,
      partner_user_id: auth.user.id,
      item_name: itemName,
      quantity: totalQuantity,
      total_amount: totalAmount,
      tax_free_amount: shippingFee, // Shipping is typically tax-free
    };

    // Store payment context for later use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payment_context', JSON.stringify({
        orderNumber,
        cartItems,
        paymentData,
        shippingFee,
        totalAmount,
      }));
    }

    return kakaoPayReadyMutation.mutate(paymentRequest);
  };

  return {
    initiatePayment,
    isLoading: kakaoPayReadyMutation.isPending,
    error: kakaoPayReadyMutation.error,
  };
};

/**
 * Hook to handle payment callback
 */
export const usePaymentCallback = () => {
  const auth = useAuth();
  const kakaoPayApproveMutation = useKakaoPayApprove();

  const handleCallback = (callbackUrl: string) => {
    if (!auth.user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      // Parse callback data
      const callbackData = parsePaymentCallback(callbackUrl);
      
      if (!callbackData.pg_token || !callbackData.tid) {
        throw new Error('Invalid payment callback data');
      }

      // Get stored transaction ID and order info
      const storedTid = typeof window !== 'undefined' 
        ? sessionStorage.getItem('kakao_pay_tid') 
        : null;
      
      const paymentContext = typeof window !== 'undefined'
        ? sessionStorage.getItem('payment_context')
        : null;

      if (!paymentContext) {
        throw new Error('Payment context not found');
      }

      const { orderNumber } = JSON.parse(paymentContext);

      // Create approval request
      const approvalData: KakaoPayApproveRequest = {
        tid: callbackData.tid,
        partner_order_id: orderNumber,
        partner_user_id: auth.user.id,
        pg_token: callbackData.pg_token,
      };

      return kakaoPayApproveMutation.mutate(approvalData);
    } catch (error: any) {
      console.error('Payment callback error:', error);
      toast.error('결제 처리 중 오류가 발생했습니다.');
    }
  };

  return {
    handleCallback,
    isLoading: kakaoPayApproveMutation.isPending,
    error: kakaoPayApproveMutation.error,
  };
};

/**
 * Hook to cancel order payment
 */
export const useCancelOrderPayment = () => {
  const kakaoPayCancelMutation = useKakaoPayCancel();

  const cancelPayment = (orderId: string, cancelAmount: number) => {
    const cancelData: KakaoPayCancelRequest = {
      partner_order_id: orderId,
      cancel_amount: cancelAmount.toString(),
      cancel_tax_free_amount: 0,
      cancel_vat_amount: 0,
      cancel_available_amount: cancelAmount,
    };

    return kakaoPayCancelMutation.mutate(cancelData);
  };

  return {
    cancelPayment,
    isLoading: kakaoPayCancelMutation.isPending,
    error: kakaoPayCancelMutation.error,
  };
};

// ==================== PAYMENT FLOW HOOKS ====================

/**
 * Hook for complete payment flow (cart → order → payment)
 */
export const useCompletePaymentFlow = () => {
  const paymentFromCart = usePaymentFromCart();
  const auth = useAuth();
  const { items: cartItems } = useCartStore();

  const startPaymentFlow = (formData: {
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
    paymentMethod: 'kakao_pay';
    memo?: string;
  }) => {
    // Validate required data
    if (!auth.isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }

    // Format shipping address
    const fullShippingAddress = `${formData.shippingAddress.address} ${formData.shippingAddress.detailAddress} (${formData.shippingAddress.postalCode})`;

    // Start payment process
    paymentFromCart.initiatePayment({
      shippingAddress: fullShippingAddress,
      customerInfo: formData.customerInfo,
      memo: formData.memo,
    });
  };

  return {
    startPaymentFlow,
    isLoading: paymentFromCart.isLoading,
    error: paymentFromCart.error,
  };
};

/**
 * Hook to get payment summary from cart
 */
export const usePaymentSummary = () => {
  const { items: cartItems } = useCartStore();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    subtotal,
    shippingFee,
    totalAmount,
    totalItems,
    isValid: cartItems.length > 0 && isValidPaymentAmount(totalAmount),
  };
};

/**
 * Hook to handle payment errors with user-friendly messages
 */
export const usePaymentErrorHandler = () => {
  const router = useRouter();

  const handlePaymentError = (error: any, context?: string) => {
    console.error(`Payment error (${context}):`, error);

    // Clear any stored payment data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kakao_pay_tid');
      sessionStorage.removeItem('payment_context');
    }

    // Show appropriate error message
    const errorMessage = error.userMessage || '결제 처리 중 오류가 발생했습니다.';
    toast.error(errorMessage);

    // Navigate to appropriate error page
    router.push('/payment/failure');
  };

  return { handlePaymentError };
};