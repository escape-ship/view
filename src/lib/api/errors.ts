import { AxiosError } from 'axios';

// Custom error classes
export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly userMessage: string;
  public readonly originalError?: any;

  constructor(
    message: string,
    userMessage?: string,
    status?: number,
    code?: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.userMessage = userMessage || message;
    this.originalError = originalError;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required', originalError?: any) {
    super(message, 'Please log in to continue', 401, 'AUTHENTICATION_REQUIRED', originalError);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access forbidden', originalError?: any) {
    super(message, 'You do not have permission to perform this action', 403, 'ACCESS_FORBIDDEN', originalError);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ApiError {
  public readonly fields?: Record<string, string[]>;

  constructor(message = 'Validation failed', fields?: Record<string, string[]>, originalError?: any) {
    super(message, 'Please check your input and try again', 422, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error', originalError?: any) {
    super(message, 'Please check your connection and try again', undefined, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'Server error', status = 500, originalError?: any) {
    super(message, 'Server error occurred. Please try again later', status, 'SERVER_ERROR', originalError);
    this.name = 'ServerError';
  }
}

// Error response types from backend
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
  fields?: Record<string, string[]>;
}

// Utility function to convert Axios errors to our custom errors
export const handleApiError = (error: AxiosError): ApiError => {
  if (!error.response) {
    // Network error
    return new NetworkError('Unable to connect to the server', error);
  }

  const { status, data } = error.response;
  const errorData = data as ErrorResponse;
  const message = errorData?.message || error.message;

  switch (status) {
    case 400:
      return new ApiError(
        message,
        'Invalid request. Please check your input.',
        status,
        'BAD_REQUEST',
        error
      );

    case 401:
      return new AuthenticationError(message, error);

    case 403:
      return new AuthorizationError(message, error);

    case 404:
      return new ApiError(
        message,
        'The requested resource was not found.',
        status,
        'NOT_FOUND',
        error
      );

    case 422:
      return new ValidationError(message, errorData?.fields, error);

    case 429:
      return new ApiError(
        message,
        'Too many requests. Please wait a moment and try again.',
        status,
        'RATE_LIMITED',
        error
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, error);

    default:
      return new ApiError(
        message,
        'An unexpected error occurred. Please try again.',
        status,
        'UNKNOWN_ERROR',
        error
      );
  }
};

// Type guards
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isServerError = (error: any): error is ServerError => {
  return error instanceof ServerError;
};

// Utility to extract user-friendly error message
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Utility to extract validation field errors
export const getValidationErrors = (error: any): Record<string, string[]> | null => {
  if (isValidationError(error)) {
    return error.fields || null;
  }
  
  return null;
};