import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/auth-context';
import { ErrorBoundary } from '../components/common/error-boundary';

const queryClient = new QueryClient();
export function AppProviders({ children }: { children: ReactNode }) {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider></ErrorBoundary>;
}
