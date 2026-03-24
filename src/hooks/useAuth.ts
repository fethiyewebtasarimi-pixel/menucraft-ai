import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: ReturnType<typeof useSession>['data'];
}

/**
 * Custom authentication hook that wraps next-auth's useSession
 * Provides a clean interface for accessing authentication state
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }
    : null;

  return {
    user,
    isLoading,
    isAuthenticated,
    session,
  };
}
