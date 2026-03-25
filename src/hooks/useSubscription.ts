import { useQuery } from '@tanstack/react-query';
import {
  resolveEffectivePlan,
  hasFeature,
  getLimit,
  isOrderTypeAllowed,
  getAllowedOrderTypes,
  type FeatureKey,
  type PlanName,
} from '@/lib/feature-gate';

export interface SubscriptionData {
  id: string;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
  trialPlan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | null;
  trialEndsAt?: string | null;
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

export function useFeatureGate() {
  const { data: profile, isLoading } = useUserProfile();
  const subscription = profile?.subscription;

  const effectivePlan = subscription
    ? resolveEffectivePlan(subscription)
    : 'FREE' as PlanName;

  return {
    plan: effectivePlan,
    isTrialing: subscription?.status === 'TRIALING',
    trialEndsAt: subscription?.trialEndsAt,
    can: (feature: FeatureKey) => hasFeature(effectivePlan, feature),
    limit: (feature: FeatureKey) => getLimit(effectivePlan, feature),
    canOrderType: (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') =>
      isOrderTypeAllowed(effectivePlan, type),
    allowedOrderTypes: getAllowedOrderTypes(effectivePlan),
    isLoading,
  };
}
