'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  login,
  register,
  getKakaoLoginUrl,
  handleKakaoCallback,
  logout as logoutApi,
  getCurrentUser,
  parseKakaoUserInfo,
} from '@/lib/api/auth';
import { useAuth } from '@/store/authProvider';
import { toast } from 'sonner';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  KakaoCallbackResponse,
  User,
} from '@/types/api';

// ==================== QUERY KEYS ====================

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  kakaoUrl: () => [...authKeys.all, 'kakao-url'] as const,
} as const;

// ==================== MUTATION HOOKS ====================

/**
 * Hook for user login
 */
export const useLogin = () => {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (response: LoginResponse) => {
      // Update auth context
      auth.login(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        },
        response.user
      );

      // Clear any cached auth data and refetch
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Navigate to home page
      router.push('/');

      toast.success('로그인되었습니다.');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      const errorMessage = error.userMessage || '로그인에 실패했습니다.';
      toast.error(errorMessage);
      
      auth.setError(errorMessage);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => register(userData),
    onSuccess: (response: RegisterResponse) => {
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      
      // Navigate to login page
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      
      const errorMessage = error.userMessage || '회원가입에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      // Update auth context
      auth.logout();

      // Clear all cached data
      queryClient.clear();

      // Navigate to home page
      router.push('/');

      toast.success('로그아웃되었습니다.');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      
      // Even if API call fails, logout locally
      auth.logout();
      queryClient.clear();
      router.push('/');
      
      toast.warning('로그아웃 처리 중 오류가 발생했지만 로그아웃되었습니다.');
    },
  });
};

/**
 * Hook for Kakao OAuth callback processing
 */
export const useKakaoCallback = () => {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => handleKakaoCallback(code),
    onSuccess: (response: KakaoCallbackResponse) => {
      // Parse user info from Kakao
      const kakaoUserInfo = parseKakaoUserInfo(response.user_info_json);
      
      // Create user object (you may need to adapt this based on your user structure)
      const user: User = {
        id: kakaoUserInfo.id,
        email: kakaoUserInfo.email || '',
        name: kakaoUserInfo.nickname || '',
        provider: 'kakao',
        provider_id: kakaoUserInfo.id,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update auth context
      auth.login(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        },
        user
      );

      // Clear any cached auth data
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Navigate to home page
      router.push('/');

      toast.success(`카카오 로그인 성공! ${user.name}님 환영합니다.`);
    },
    onError: (error: any) => {
      console.error('Kakao callback error:', error);
      
      const errorMessage = error.userMessage || '카카오 로그인에 실패했습니다.';
      toast.error(errorMessage);
      
      auth.setError(errorMessage);
      
      // Navigate to login page on error
      router.push('/login');
    },
  });
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to get Kakao login URL
 */
export const useKakaoLoginUrl = () => {
  return useQuery({
    queryKey: authKeys.kakaoUrl(),
    queryFn: getKakaoLoginUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get current user information
 */
export const useCurrentUser = () => {
  const auth = useAuth();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getCurrentUser,
    enabled: auth.isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: Error | unknown) => {
      // Don't retry if it's an auth error
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response &&
          error.response.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to initiate Kakao login
 */
export const useKakaoLogin = () => {
  const { data: kakaoUrl, isLoading } = useKakaoLoginUrl();

  const startKakaoLogin = () => {
    if (kakaoUrl) {
      window.location.href = kakaoUrl;
    } else {
      toast.error('카카오 로그인 URL을 가져올 수 없습니다.');
    }
  };

  return {
    startKakaoLogin,
    isLoading,
  };
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (role: 'user' | 'admin') => {
  const auth = useAuth();
  
  return {
    hasRole: auth.hasRole(role),
    isLoading: auth.isLoading,
  };
};

/**
 * Hook to require authentication (with automatic redirect)
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const auth = useAuth();
  const router = useRouter();

  // Effect to handle redirect is in the auth context
  // This hook just returns the auth state
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  };
};

/**
 * Hook to require admin role (with automatic redirect)
 */
export const useRequireAdmin = (redirectTo: string = '/') => {
  const auth = useAuth();
  const router = useRouter();

  // Check if user is admin
  const isAdmin = auth.hasRole('admin');

  // Redirect if not admin (after loading is complete)
  if (!auth.isLoading && (!auth.isAuthenticated || !isAdmin)) {
    router.push(redirectTo);
  }

  return {
    isAdmin,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
  };
};

// ==================== FORM VALIDATION HOOKS ====================

/**
 * Hook for login form validation
 */
export const useLoginValidation = () => {
  const validateLoginForm = (email: string, password: string) => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  };

  return { validateLoginForm };
};

/**
 * Hook for registration form validation
 */
export const useRegisterValidation = () => {
  const validateRegisterForm = (
    email: string,
    password: string,
    confirmPassword: string,
    name?: string
  ) => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // Name validation (if provided)
    if (name !== undefined && name.trim().length > 0 && name.trim().length < 2) {
      errors.name = '이름은 2자 이상이어야 합니다.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  };

  return { validateRegisterForm };
};