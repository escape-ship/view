import { apiClient } from './client';
import { handleApiError } from './errors';
import type {
  Product,
  ProductWithOptions,
  GetProductsResponse,
  GetProductByIdResponse,
  CreateProductRequest,
  CreateProductResponse,
  ProductFilters,
  PaginatedResponse,
} from '@/types/api';

// ==================== PRODUCT API FUNCTIONS ====================

/**
 * Fetch all products
 * @param filters - Optional filters for products
 * @returns Promise<Product[]>
 */
export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
    }
    
    const url = params.toString() ? `/products?${params.toString()}` : '/products';
    const response = await apiClient.get<GetProductsResponse>(url);
    
    return response.data.products;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Fetch a single product by ID
 * @param id - Product ID
 * @returns Promise<Product>
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }
    
    const response = await apiClient.get<GetProductByIdResponse>(`/products/${id}`);
    
    return response.data.product;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Create a new product (admin only)
 * @param productData - Product creation data
 * @returns Promise<CreateProductResponse>
 */
export const createProduct = async (productData: CreateProductRequest): Promise<CreateProductResponse> => {
  try {
    const response = await apiClient.post<CreateProductResponse>('/products', productData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Fetch products by category
 * @param category - Category name or ID
 * @param filters - Optional additional filters
 * @returns Promise<Product[]>
 */
export const fetchProductsByCategory = async (
  category: string,
  filters?: Omit<ProductFilters, 'category'>
): Promise<Product[]> => {
  return fetchProducts({ ...filters, category });
};

/**
 * Search products by name or description
 * @param query - Search query
 * @param filters - Optional additional filters
 * @returns Promise<Product[]>
 */
export const searchProducts = async (
  query: string,
  filters?: Omit<ProductFilters, 'search'>
): Promise<Product[]> => {
  return fetchProducts({ ...filters, search: query });
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse product options from JSON string
 * @param product - Product with options_json
 * @returns ProductWithOptions
 */
export const parseProductOptions = (product: Product): ProductWithOptions => {
  try {
    const options = product.options_json ? JSON.parse(product.options_json) : {};
    
    return {
      ...product,
      options,
    };
  } catch (error) {
    console.error('Error parsing product options:', error);
    
    return {
      ...product,
      options: {},
    };
  }
};

/**
 * Parse multiple products' options
 * @param products - Array of products
 * @returns ProductWithOptions[]
 */
export const parseProductsOptions = (products: Product[]): ProductWithOptions[] => {
  return products.map(parseProductOptions);
};

/**
 * Format product price for display
 * @param price - Price in cents or smallest currency unit
 * @returns Formatted price string
 */
export const formatProductPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
};

/**
 * Calculate discounted price
 * @param originalPrice - Original price
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discounted price
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercent: number): number => {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  
  return Math.round(originalPrice * (1 - discountPercent / 100));
};

/**
 * Check if product is in stock
 * @param product - Product object
 * @returns boolean
 */
export const isProductInStock = (product: ProductWithOptions): boolean => {
  const stock = product.options.stock;
  
  if (typeof stock === 'number') {
    return stock > 0;
  }
  
  if (typeof stock === 'string') {
    const stockNumber = parseInt(stock, 10);
    return !isNaN(stockNumber) && stockNumber > 0;
  }
  
  // If stock is not defined or cannot be parsed, assume in stock
  return true;
};

/**
 * Get product stock quantity
 * @param product - Product object
 * @returns Stock quantity or null if not available
 */
export const getProductStock = (product: ProductWithOptions): number | null => {
  const stock = product.options.stock;
  
  if (typeof stock === 'number') {
    return stock;
  }
  
  if (typeof stock === 'string') {
    const stockNumber = parseInt(stock, 10);
    return isNaN(stockNumber) ? null : stockNumber;
  }
  
  return null;
};

/**
 * Get product categories (for filtering)
 * This would typically come from a separate API endpoint,
 * but for now we'll extract from products
 * @param products - Array of products
 * @returns Unique categories
 */
export const getProductCategories = (products: Product[]): string[] => {
  const categories = products.map(product => product.category);
  return Array.from(new Set(categories)).filter(Boolean);
};

/**
 * Sort products by various criteria
 * @param products - Array of products
 * @param sortBy - Sort criteria
 * @param order - Sort order
 * @returns Sorted products
 */
export const sortProducts = (
  products: Product[],
  sortBy: 'name' | 'price' | 'created_at',
  order: 'asc' | 'desc' = 'asc'
): Product[] => {
  return [...products].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ko');
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Filter products by price range
 * @param products - Array of products
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Filtered products
 */
export const filterProductsByPriceRange = (
  products: Product[],
  minPrice?: number,
  maxPrice?: number
): Product[] => {
  return products.filter(product => {
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    return true;
  });
};