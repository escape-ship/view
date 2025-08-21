'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  fetchOrders,
  fetchOrderById,
  convertCartToOrderItems,
  calculateOrderTotals,
  generateOrderNumber,
} from '@/lib/api/order';
import { useAuth } from '@/store/authProvider';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type {
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderFilters,
  CartItem,
} from '@/types/api';

// ==================== QUERY KEYS ====================

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  user: (userId: string) => [...orderKeys.all, 'user', userId] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch user's orders
 * @param filters - Optional order filters
 * @param options - TanStack Query options
 */
export const useOrders = (
  filters?: OrderFilters,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  const auth = useAuth();

  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => fetchOrders(filters),
    enabled: auth.isAuthenticated && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes (orders change more frequently)
    ...options,
  });
};

/**
 * Hook to fetch a single order by ID
 * @param orderId - Order ID
 * @param options - TanStack Query options
 */
export const useOrder = (
  orderId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  const auth = useAuth();

  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId && auth.isAuthenticated && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch orders by status
 * @param status - Order status
 * @param options - TanStack Query options
 */
export const useOrdersByStatus = (
  status: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useOrders(
    { status },
    options
  );
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => createOrder(orderData),
    onSuccess: (response: CreateOrderResponse, variables: CreateOrderRequest) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      
      // Clear cart after successful order
      clearCart();
      
      toast.success('주문이 성공적으로 생성되었습니다.');
      
      // Navigate to order confirmation or payment page
      router.push(`/order/confirmation/${response.id}`);
    },
    onError: (error: any) => {
      console.error('Create order error:', error);
      
      const errorMessage = error.userMessage || '주문 생성에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to create order from current cart
 */
export const useCreateOrderFromCart = () => {
  const auth = useAuth();
  const { items: cartItems } = useCartStore();
  const createOrderMutation = useCreateOrder();

  const createOrderFromCart = (orderFormData: {
    shippingAddress: string;
    paymentMethod: string;
    memo?: string;
    shippingFee?: number;
  }) => {
    if (!auth.user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }

    // Convert cart items to order items
    const orderItems = convertCartToOrderItems(cartItems);
    
    // Calculate totals
    const shippingFee = orderFormData.shippingFee || 0;
    const { totalPrice, totalQuantity } = calculateOrderTotals(orderItems, shippingFee);
    
    // Generate order number
    const orderNumber = generateOrderNumber(auth.user.id);

    // Create order request
    const orderRequest: CreateOrderRequest = {
      user_id: auth.user.id,
      order_number: orderNumber,
      status: 'pending',
      total_price: totalPrice,
      quantity: totalQuantity,
      payment_method: orderFormData.paymentMethod,
      shipping_fee: shippingFee,
      shipping_address: orderFormData.shippingAddress,
      paid_at: '', // Will be set after payment
      memo: orderFormData.memo || '',
      items: orderItems,
    };

    return createOrderMutation.mutate(orderRequest);
  };

  return {
    createOrderFromCart,
    isLoading: createOrderMutation.isPending,
    error: createOrderMutation.error,
  };
};

/**
 * Hook to get order statistics
 */
export const useOrderStats = () => {
  const auth = useAuth();
  
  const { data: orders, isLoading } = useOrders({}, {
    enabled: auth.isAuthenticated,
  });

  const stats = orders ? {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, order) => sum + order.total_price, 0),
  } : null;

  return {
    stats,
    isLoading,
  };
};

/**
 * Hook to prefetch order details
 */
export const usePrefetchOrder = () => {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: orderKeys.detail(orderId),
      queryFn: () => fetchOrderById(orderId),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook to get recent orders
 * @param limit - Number of recent orders to fetch
 */
export const useRecentOrders = (limit: number = 5) => {
  return useOrders({
    limit,
    sort: 'ordered_at',
    order: 'desc',
  });
};