import { apiClient, tokenStorage } from './client';
import { handleApiError } from './errors';
import { toast } from 'sonner';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  KakaoLoginUrlResponse,
  KakaoCallbackRequest,
  KakaoCallbackResponse,
  KakaoUserInfo,
  User,
} from '@/types/api';
import type { TokenPair } from './client';

// ==================== AUTHENTICATION API FUNCTIONS ====================

/**
 * Login with email and password
 * @param credentials - Login credentials
 * @returns Promise<LoginResponse>
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }

    const response = await apiClient.post<LoginResponse>('/login', credentials);
    
    // Store tokens after successful login
    const tokens: TokenPair = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
    
    tokenStorage.setTokens(tokens);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Register a new user account
 * @param userData - Registration data
 * @returns Promise<RegisterResponse>
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength (minimum requirements)
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const response = await apiClient.post<RegisterResponse>('/register', userData);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Get Kakao login URL
 * @returns Promise<string> - Kakao login URL
 */
export const getKakaoLoginUrl = async (): Promise<string> => {
  try {
    const response = await apiClient.get<KakaoLoginUrlResponse>('/oauth/kakao/login');
    
    return response.data.login_url;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Handle Kakao OAuth callback
 * @param code - Authorization code from Kakao
 * @returns Promise<KakaoCallbackResponse>
 */
export const handleKakaoCallback = async (code: string): Promise<KakaoCallbackResponse> => {
  try {
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const requestData: KakaoCallbackRequest = { code };
    const response = await apiClient.post<KakaoCallbackResponse>('/oauth/kakao/callback', requestData);
    
    // Store tokens after successful Kakao login
    const tokens: TokenPair = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
    
    tokenStorage.setTokens(tokens);
    
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * Refresh authentication tokens
 * @returns Promise<TokenPair>
 */
export const refreshAuthTokens = async (): Promise<TokenPair> => {
  try {
    const { refreshToken } = tokenStorage.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    const tokens: TokenPair = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
    
    // Update stored tokens
    tokenStorage.setTokens(tokens);
    
    return tokens;
  } catch (error: any) {
    // If refresh fails, clear tokens
    tokenStorage.clearTokens();
    throw handleApiError(error);
  }
};

/**
 * Logout user (clear local tokens)
 * @returns Promise<void>
 */
export const logout = async (): Promise<void> => {
  try {
    // Note: The backend doesn't have a logout endpoint in the spec,
    // so we just clear local tokens
    tokenStorage.clearTokens();
    
    toast.success('Successfully logged out');
  } catch (error: any) {
    console.error('Logout error:', error);
    // Even if there's an error, clear tokens
    tokenStorage.clearTokens();
    throw error;
  }
};

/**
 * Get current user information from token
 * This function would typically call a /me endpoint, but since it's not in the spec,
 * we'll decode it from the JWT token
 * @returns Promise<User | null>
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { accessToken } = tokenStorage.getTokens();
    
    if (!accessToken) {
      return null;
    }

    // Decode JWT payload to get user info
    // Note: This is a simple implementation. In production, you might want to call a /me endpoint
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    
    // Extract user information from token payload
    const user: User = {
      id: payload.sub || payload.user_id || '',
      email: payload.email || '',
      name: payload.name || '',
      role: payload.role || 'user',
      created_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : '',
      updated_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : '',
    };
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
  const { accessToken } = tokenStorage.getTokens();
  
  if (!accessToken) return false;
  
  try {
    // Check if token is expired
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const now = Date.now() / 1000;
    
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse Kakao user info from JSON string
 * @param userInfoJson - JSON string containing user info
 * @returns KakaoUserInfo
 */
export const parseKakaoUserInfo = (userInfoJson: string): KakaoUserInfo => {
  try {
    return JSON.parse(userInfoJson);
  } catch (error) {
    console.error('Error parsing Kakao user info:', error);
    return { id: '' };
  }
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export const validatePassword = (password: string) => {
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = validations.minLength && 
    (validations.hasUpperCase || validations.hasLowerCase) && 
    validations.hasNumbers;

  return {
    isValid,
    validations,
    score: Object.values(validations).filter(Boolean).length,
  };
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate a secure redirect URL for Kakao OAuth
 * @returns string
 */
export const getKakaoRedirectUri = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/kakao/callback`;
};

/**
 * Handle authentication errors with user-friendly messages
 * @param error - Error object
 * @returns string - User-friendly error message
 */
export const getAuthErrorMessage = (error: any): string => {
  const message = error?.message || error?.response?.data?.message;
  
  if (!message) return 'An unexpected error occurred';
  
  // Map common authentication errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'User not found': '등록되지 않은 이메일입니다.',
    'Password incorrect': '비밀번호가 올바르지 않습니다.',
    'Email already exists': '이미 등록된 이메일입니다.',
    'Invalid email format': '올바른 이메일 형식이 아닙니다.',
    'Password too weak': '비밀번호는 8자 이상이어야 합니다.',
    'Account locked': '계정이 잠겨있습니다. 고객센터에 문의하세요.',
    'Email not verified': '이메일 인증이 필요합니다.',
  };
  
  return errorMappings[message] || message;
};

/**
 * Store user session data
 * @param user - User object
 */
export const storeUserSession = (user: User): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_session', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

/**
 * Get stored user session
 * @returns User | null
 */
export const getStoredUserSession = (): User | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_session');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

/**
 * Clear user session data
 */
export const clearUserSession = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};