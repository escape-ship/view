// Base API Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Error response structure
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  fields?: Record<string, string[]>;
}

// ==================== PRODUCT TYPES ====================

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // int64
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;
  options_json: string; // JSON string containing product options
}

// Parsed product options (after JSON parsing)
export interface ProductOptions {
  [key: string]: string | number | boolean | string[];
}

// Product with parsed options
export interface ProductWithOptions extends Omit<Product, 'options_json'> {
  options: ProductOptions;
}

// Product API Requests
export interface CreateProductRequest {
  name: string;
  category: number; // int64
  price: number; // int64
  image_url: string;
  description: string;
  options_json: string; // JSON string
}

// Product API Responses
export interface GetProductsResponse {
  products: Product[];
}

export interface GetProductByIdResponse {
  product: Product;
}

export interface CreateProductResponse {
  message: string;
}

// ==================== USER/ACCOUNT TYPES ====================

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin';
  provider?: 'local' | 'kakao';
  provider_id?: string;
}

// Authentication requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

// Authentication responses
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

// Kakao OAuth types
export interface KakaoLoginUrlResponse {
  login_url: string;
}

export interface KakaoCallbackRequest {
  code: string;
}

export interface KakaoCallbackResponse {
  access_token: string;
  refresh_token: string;
  user_info_json: string; // JSON string containing user info
}

// Parsed Kakao user info
export interface KakaoUserInfo {
  id: string;
  email?: string;
  nickname?: string;
  profile_image?: string;
  [key: string]: any;
}

// ==================== ORDER TYPES ====================

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number; // int64
  quantity: number; // int32
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_price: number; // int64
  quantity: number; // int32
  payment_method: string;
  shipping_fee: number; // int32
  shipping_address: string;
  ordered_at: string;
  paid_at: string;
  memo: string;
  items: OrderItem[];
}

// Order creation request
export interface CreateOrderRequest {
  user_id: string;
  order_number: string;
  status: string;
  total_price: number; // int64
  quantity: number; // int32
  payment_method: string;
  shipping_fee: number; // int32
  shipping_address: string;
  paid_at: string;
  memo: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  product_id: string;
  product_name: string;
  product_options: string; // JSON string
  product_price: number; // int64
  quantity: number; // int32
}

// Order API responses
export interface CreateOrderResponse {
  id: string;
}

export interface GetOrdersResponse {
  orders: Order[];
}

export interface GetOrderResponse {
  order: Order;
}

// ==================== SHARED TYPES ====================

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common query filters
export interface ProductFilters extends PaginationParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface OrderFilters extends PaginationParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// ==================== CART TYPES (for reference) ====================
// These are used in the Zustand store

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, unknown>;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// ==================== FORM TYPES ====================

// Login form
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration form
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  phone?: string;
  agreeToTerms: boolean;
}

// Order form
export interface OrderFormData {
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
  paymentMethod: 'kakao_pay' | 'card' | 'bank_transfer';
  memo?: string;
}