'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/store/authProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: Error | unknown) => {
              // Don't retry on authentication errors
              if (error && typeof error === 'object' && 'response' in error && 
                  error.response && typeof error.response === 'object' && 'status' in error.response &&
                  (error.response.status === 401 || error.response.status === 403)) {
                return false;
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error: Error | unknown) => {
              // Don't retry mutations on client errors (4xx)
              if (error && typeof error === 'object' && 'response' in error && 
                  error.response && typeof error.response === 'object' && 'status' in error.response &&
                  typeof error.response.status === 'number' &&
                  error.response.status >= 400 && error.response.status < 500) {
                return false;
              }
              // Retry once for server errors (5xx)
              return failureCount < 1;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        
        {/* React Query DevTools (only in development) */}
        {process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
