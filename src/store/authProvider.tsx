'use client';

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  ReactNode 
} from 'react';
import { tokenStorage, type TokenPair } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User, LoginResponse, KakaoUserInfo } from '@/types/api';

// ==================== TYPES ====================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthContextType extends AuthState {
  login: (tokens: TokenPair, user?: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  isTokenExpired: () => boolean;
  getUserRole: () => 'user' | 'admin' | null;
  hasRole: (role: 'user' | 'admin') => boolean;
}

// ==================== ACTIONS ====================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { tokens: TokenPair; user?: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'CLEAR_ERROR' };

// ==================== REDUCER ====================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check stored tokens
  error: null,
  accessToken: null,
  refreshToken: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'LOGIN_SUCCESS':
      const { tokens, user } = action.payload;
      return {
        ...state,
        user: user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ==================== UTILITY FUNCTIONS ====================

  const isTokenExpired = (): boolean => {
    const { accessToken } = tokenStorage.getTokens();
    
    if (!accessToken) return true;
    
    try {
      // Decode JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Check if token is expired (with 30 second buffer)
      return payload.exp < (now + 30);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  };

  const getUserRole = (): 'user' | 'admin' | null => {
    return state.user?.role || null;
  };

  const hasRole = (role: 'user' | 'admin'): boolean => {
    return getUserRole() === role;
  };

  // ==================== AUTH METHODS ====================

  const login = (tokens: TokenPair, user?: User) => {
    try {
      // Store tokens
      tokenStorage.setTokens(tokens);
      
      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { tokens, user },
      });
      
      toast.success('로그인되었습니다.');
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: '로그인 처리 중 오류가 발생했습니다.',
      });
    }
  };

  const logout = () => {
    try {
      // Clear stored tokens
      tokenStorage.clearTokens();
      
      // Update state
      dispatch({ type: 'LOGOUT' });
      
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with logout even if there's an error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken } = tokenStorage.getTokens();
        
        if (accessToken && refreshToken) {
          // Check if token is expired
          if (!isTokenExpired()) {
            // Token is valid, update state
            dispatch({
              type: 'SET_TOKENS',
              payload: { accessToken, refreshToken },
            });
            
            // TODO: Optionally fetch user info from the token or API
            // For now, we'll just set authenticated state
            
          } else {
            // Token is expired, clear it
            tokenStorage.clearTokens();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenStorage.clearTokens();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // ==================== TOKEN REFRESH HANDLING ====================

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (state.isAuthenticated && state.accessToken) {
      // Set up token refresh check every 5 minutes
      refreshInterval = setInterval(() => {
        if (isTokenExpired()) {
          console.log('Token expired, user will be logged out');
          logout();
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [state.isAuthenticated, state.accessToken]);

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setUser,
    setError,
    setLoading,
    clearError,
    isTokenExpired,
    getUserRole,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ==================== UTILITY HOOKS ====================

// Hook to require authentication
export const useRequireAuth = (redirectTo: string = '/login') => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, redirectTo]);
  
  return auth;
};

// Hook to check authentication status
export const useAuthStatus = () => {
  const auth = useAuth();
  
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  };
};

// Hook to get user permissions
export const usePermissions = () => {
  const auth = useAuth();
  
  return {
    isAdmin: auth.hasRole('admin'),
    isUser: auth.hasRole('user'),
    getUserRole: auth.getUserRole,
    hasRole: auth.hasRole,
  };
};