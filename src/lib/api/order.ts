import { apiClient } from './client';
import { handleApiError } from './errors';
import type {
  Order,
  OrderItem,
  CreateOrderRequest,
  CreateOrderItemRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  GetOrderResponse,
  OrderFilters,
  CartItem,
} from '@/types/api';

// ==================== ORDER API FUNCTIONS ====================

/**
 * Create a new order
 * @param orderData - Order creation data
 * @returns Promise<CreateOrderResponse>
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    // Validate required fields
    if (!orderData.user_id) {
      throw new Error('User ID is required');
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    
    if (!orderData.shipping_address) {
      throw new Error('Shipping address is required');
    }

    // Validate order items
    for (const item of orderData.items) {
      if (!item.product_id || !item.product_name || !item.quantity || !item.product_price) {
        throw new Error('All order item fields are required');
      }
      
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0');
      }
      
      if (item.product_price <= 0) {
        throw new Error('Item price must be greater than 0');
      }
    }

    const response = await apiClient.post<CreateOrderResponse>('/v1/order/insert', orderData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Fetch all orders for the current user
 * @param filters - Optional filters for orders
 * @returns Promise<Order[]>
 */
export const fetchOrders = async (filters?: OrderFilters): Promise<Order[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.fromDate) params.append('from_date', filters.fromDate);
      if (filters.toDate) params.append('to_date', filters.toDate);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
    }
    
    const url = params.toString() ? `/v1/order?${params.toString()}` : '/v1/order';
    const response = await apiClient.get<GetOrdersResponse>(url);
    
    return response.data.orders;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Fetch a single order by ID
 * @param orderId - Order ID
 * @returns Promise<Order>
 */
export const fetchOrderById = async (orderId: string): Promise<Order> => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    const response = await apiClient.get<GetOrderResponse>(`/v1/order/${orderId}`);
    
    return response.data.order;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a unique order number
 * @param userId - User ID
 * @returns string - Formatted order number
 */
export const generateOrderNumber = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const userIdSuffix = userId.slice(-4);
  
  return `ORD-${timestamp}-${userIdSuffix}-${random}`;
};

/**
 * Convert cart items to order items
 * @param cartItems - Cart items from Zustand store
 * @returns CreateOrderItemRequest[]
 */
export const convertCartToOrderItems = (cartItems: CartItem[]): CreateOrderItemRequest[] => {
  return cartItems.map(item => ({
    product_id: item.id,
    product_name: item.name,
    product_options: JSON.stringify(item.options || {}),
    product_price: item.price,
    quantity: item.quantity,
  }));
};

/**
 * Calculate order totals
 * @param items - Order items
 * @param shippingFee - Shipping fee
 * @returns Order totals
 */
export const calculateOrderTotals = (items: CreateOrderItemRequest[], shippingFee: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = subtotal + shippingFee;
  
  return {
    subtotal,
    shippingFee,
    totalPrice,
    totalQuantity,
  };
};

/**
 * Format order status for display
 * @param status - Order status
 * @returns Formatted status string
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '결제 대기',
    'paid': '결제 완료',
    'preparing': '상품 준비중',
    'shipping': '배송중',
    'delivered': '배송 완료',
    'cancelled': '주문 취소',
    'refunded': '환불 완료',
  };
  
  return statusMap[status] || status;
};

/**
 * Get order status color for UI
 * @param status - Order status
 * @returns Tailwind color class
 */
export const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'text-yellow-600',
    'paid': 'text-green-600',
    'preparing': 'text-blue-600',
    'shipping': 'text-purple-600',
    'delivered': 'text-green-800',
    'cancelled': 'text-red-600',
    'refunded': 'text-orange-600',
  };
  
  return colorMap[status] || 'text-gray-600';
};

/**
 * Check if order can be cancelled
 * @param order - Order object
 * @returns boolean
 */
export const canCancelOrder = (order: Order): boolean => {
  const cancellableStatuses = ['pending', 'paid', 'preparing'];
  return cancellableStatuses.includes(order.status);
};

/**
 * Check if order can be refunded
 * @param order - Order object
 * @returns boolean
 */
export const canRefundOrder = (order: Order): boolean => {
  const refundableStatuses = ['delivered'];
  const orderDate = new Date(order.ordered_at);
  const now = new Date();
  const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Allow refund within 7 days of delivery
  return refundableStatuses.includes(order.status) && daysDiff <= 7;
};

/**
 * Calculate estimated delivery date
 * @param orderDate - Order date
 * @param shippingMethod - Shipping method (if available)
 * @returns Date
 */
export const calculateEstimatedDelivery = (
  orderDate: string,
  shippingMethod?: string
): Date => {
  const order = new Date(orderDate);
  const deliveryDays = shippingMethod === 'express' ? 1 : 3; // Default 3 days
  
  order.setDate(order.getDate() + deliveryDays);
  return order;
};

/**
 * Format order date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatOrderDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

/**
 * Group orders by status
 * @param orders - Array of orders
 * @returns Object with orders grouped by status
 */
export const groupOrdersByStatus = (orders: Order[]): Record<string, Order[]> => {
  return orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);
};

/**
 * Calculate total spent by user
 * @param orders - User's orders
 * @returns Total amount spent
 */
export const calculateTotalSpent = (orders: Order[]): number => {
  return orders
    .filter(order => order.status !== 'cancelled' && order.status !== 'refunded')
    .reduce((total, order) => total + order.total_price, 0);
};