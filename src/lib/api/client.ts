import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Types for token management
interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Extended types for request retry and error messages
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ExtendedAxiosError extends AxiosError {
  userMessage?: string;
}

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

// Token storage utilities
const TOKEN_STORAGE_KEY = 'auth_tokens';

const tokenStorage = {
  getTokens(): AuthTokens {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null };
    }
    
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return { accessToken: null, refreshToken: null };
      
      const tokens: TokenPair = JSON.parse(stored);
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch (error) {
      console.error('Failed to parse stored tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  },

  setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const client = axios.create({
    baseURL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (config) => {
      const { accessToken } = tokenStorage.getTokens();
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      // Add request logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });
      }
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle auth and errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🟢 API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;
      
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`🔴 API Error: ${error.response?.status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          message: error.message,
          response: error.response?.data,
        });
      }

      // Handle 401 Unauthorized - Token refresh logic
      if (error.response?.status === 401 && originalRequest) {
        const { refreshToken } = tokenStorage.getTokens();
        
        const extendedRequest = originalRequest as ExtendedAxiosRequestConfig;
        if (refreshToken && !extendedRequest._retry) {
          extendedRequest._retry = true;
          
          try {
            // Attempt to refresh the token
            const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
              refresh_token: refreshToken,
            });
            
            const newTokens: TokenPair = refreshResponse.data;
            tokenStorage.setTokens(newTokens);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            }
            
            return client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            tokenStorage.clearTokens();
            
            // Only show toast if we're in the browser
            if (typeof window !== 'undefined') {
              toast.error('Session expired. Please log in again.');
              
              // Redirect to login page
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token or retry already attempted
          tokenStorage.clearTokens();
          
          if (typeof window !== 'undefined') {
            toast.error('Authentication required. Please log in.');
            window.location.href = '/login';
          }
        }
      }

      // Handle other HTTP errors with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        let message = 'An error occurred. Please try again.';
        
        switch (status) {
          case 400:
            message = (data && typeof data === 'object' && 'message' in data ? data.message : 'Invalid request. Please check your input.') as string;
            break;
          case 403:
            message = 'You do not have permission to perform this action.';
            break;
          case 404:
            message = 'The requested resource was not found.';
            break;
          case 422:
            message = (data && typeof data === 'object' && 'message' in data ? data.message : 'Validation error. Please check your input.') as string;
            break;
          case 429:
            message = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            message = 'Service temporarily unavailable. Please try again later.';
            break;
        }
        
        // Show error toast only for non-auth errors
        if (status !== 401 && typeof window !== 'undefined') {
          toast.error(message);
        }
        
        // Attach user-friendly message to error
        (error as ExtendedAxiosError).userMessage = message;
      } else if (error.request) {
        // Network error
        const message = 'Network error. Please check your connection and try again.';
        
        if (typeof window !== 'undefined') {
          toast.error(message);
        }
        
        (error as ExtendedAxiosError).userMessage = message;
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Export the configured client
export const apiClient = createApiClient();

// Export token management utilities for use in auth context
export { tokenStorage };

// Export types
export type { TokenPair, AuthTokens };

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { accessToken } = tokenStorage.getTokens();
  return !!accessToken;
};

// Utility function to logout (clear tokens)
export const logout = (): void => {
  tokenStorage.clearTokens();
  
  if (typeof window !== 'undefined') {
    toast.success('Logged out successfully');
    window.location.href = '/';
  }
};