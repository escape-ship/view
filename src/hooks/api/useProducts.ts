'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProductById,
  fetchProductsByCategory,
  searchProducts,
  createProduct,
  parseProductOptions,
  parseProductsOptions,
} from '@/lib/api/product';
import { toast } from 'sonner';
import type {
  Product,
  ProductWithOptions,
  ProductFilters,
  CreateProductRequest,
  CreateProductResponse,
} from '@/types/api';

// ==================== QUERY KEYS ====================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  search: (query: string, filters?: ProductFilters) => [...productKeys.all, 'search', query, filters] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch all products with optional filters
 * @param filters - Optional product filters
 * @param options - TanStack Query options
 */
export const useProducts = (
  filters?: ProductFilters,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    select?: (data: Product[]) => any;
  }
) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch products with parsed options
 * @param filters - Optional product filters
 * @param options - TanStack Query options
 */
export const useProductsWithOptions = (
  filters?: ProductFilters,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: [...productKeys.list(filters), 'with-options'],
    queryFn: async () => {
      const products = await fetchProducts(filters);
      return parseProductsOptions(products);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single product by ID
 * @param id - Product ID
 * @param options - TanStack Query options
 */
export const useProduct = (
  id: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes (individual products change less frequently)
    ...options,
  });
};

/**
 * Hook to fetch a single product with parsed options
 * @param id - Product ID
 * @param options - TanStack Query options
 */
export const useProductWithOptions = (
  id: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: [...productKeys.detail(id), 'with-options'],
    queryFn: async () => {
      const product = await fetchProductById(id);
      return parseProductOptions(product);
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch products by category
 * @param category - Category name or ID
 * @param filters - Optional additional filters
 * @param options - TanStack Query options
 */
export const useProductsByCategory = (
  category: string,
  filters?: Omit<ProductFilters, 'category'>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  const combinedFilters = { ...filters, category };
  
  return useQuery({
    queryKey: productKeys.list(combinedFilters),
    queryFn: () => fetchProductsByCategory(category, filters),
    enabled: !!category && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to search products
 * @param query - Search query
 * @param filters - Optional additional filters
 * @param options - TanStack Query options
 */
export const useProductSearch = (
  query: string,
  filters?: Omit<ProductFilters, 'search'>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => searchProducts(query, filters),
    enabled: !!query.trim() && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes (search results change more frequently)
    ...options,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new product (admin only)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: CreateProductRequest) => createProduct(productData),
    onSuccess: (data: CreateProductResponse) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      
      toast.success('상품이 성공적으로 등록되었습니다.');
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      toast.error(error.userMessage || '상품 등록에 실패했습니다.');
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to get product categories (derived from products)
 * @param options - TanStack Query options
 */
export const useProductCategories = (
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: async () => {
      const products = await fetchProducts();
      const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
      return categories;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (categories change infrequently)
    ...options,
  });
};

/**
 * Hook to prefetch a product (for performance optimization)
 * @param id - Product ID to prefetch
 */
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => fetchProductById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
};

/**
 * Hook to prefetch products by category (for performance optimization)
 * @param category - Category to prefetch
 * @param filters - Optional filters
 */
export const usePrefetchProductsByCategory = () => {
  const queryClient = useQueryClient();
  
  return (category: string, filters?: Omit<ProductFilters, 'category'>) => {
    const combinedFilters = { ...filters, category };
    
    queryClient.prefetchQuery({
      queryKey: productKeys.list(combinedFilters),
      queryFn: () => fetchProductsByCategory(category, filters),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook to optimistically update product cache
 */
export const useOptimisticProductUpdate = () => {
  const queryClient = useQueryClient();
  
  return (productId: string, updater: (old: Product) => Product) => {
    queryClient.setQueryData(
      productKeys.detail(productId),
      (old: Product | undefined) => {
        if (!old) return old;
        return updater(old);
      }
    );
  };
};

// ==================== DERIVED STATE HOOKS ====================

/**
 * Hook to get featured products (could be based on some criteria)
 * @param limit - Number of featured products to return
 */
export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: [...productKeys.all, 'featured', limit],
    queryFn: async () => {
      const products = await fetchProducts({
        limit,
        sort: 'created_at',
        order: 'desc',
      });
      return parseProductsOptions(products);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get related products (by category)
 * @param productId - Current product ID
 * @param category - Product category
 * @param limit - Number of related products
 */
export const useRelatedProducts = (
  productId: string,
  category: string,
  limit: number = 4
) => {
  return useQuery({
    queryKey: [...productKeys.all, 'related', productId, category, limit],
    queryFn: async () => {
      const products = await fetchProductsByCategory(category, { limit: limit + 1 });
      // Exclude the current product and limit results
      return parseProductsOptions(
        products.filter(p => p.id !== productId).slice(0, limit)
      );
    },
    enabled: !!productId && !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};