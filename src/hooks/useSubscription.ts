import { useQuery } from '@tanstack/react-query';

export interface SubscriptionData {
  id: string;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  aiCredits: number;
  aiCreditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription: SubscriptionData | null;
  restaurants: {
    id: string;
    name: string;
    slug: string;
  }[];
}

async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
  });
}
