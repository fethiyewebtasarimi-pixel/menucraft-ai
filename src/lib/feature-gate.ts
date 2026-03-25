export type FeatureKey =
  | "ordering"
  | "orderDineIn"
  | "orderTakeaway"
  | "orderDelivery"
  | "waiterCall"
  | "analytics"
  | "customQR"
  | "watermark"
  | "maxRestaurants"
  | "maxMenus"
  | "maxItems"
  | "aiCredits";

export type PlanName = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

const FEATURE_MATRIX: Record<FeatureKey, Record<PlanName, boolean | number>> = {
  ordering:       { FREE: false, STARTER: true,  PROFESSIONAL: true,   ENTERPRISE: true },
  orderDineIn:    { FREE: false, STARTER: true,  PROFESSIONAL: true,   ENTERPRISE: true },
  orderTakeaway:  { FREE: false, STARTER: false, PROFESSIONAL: true,   ENTERPRISE: true },
  orderDelivery:  { FREE: false, STARTER: false, PROFESSIONAL: true,   ENTERPRISE: true },
  waiterCall:     { FREE: false, STARTER: true,  PROFESSIONAL: true,   ENTERPRISE: true },
  analytics:      { FREE: false, STARTER: false, PROFESSIONAL: true,   ENTERPRISE: true },
  customQR:       { FREE: false, STARTER: true,  PROFESSIONAL: true,   ENTERPRISE: true },
  watermark:      { FREE: true,  STARTER: false, PROFESSIONAL: false,  ENTERPRISE: false },
  maxRestaurants: { FREE: 1,     STARTER: 1,     PROFESSIONAL: 5,      ENTERPRISE: 999999 },
  maxMenus:       { FREE: 1,     STARTER: 3,     PROFESSIONAL: 999999, ENTERPRISE: 999999 },
  maxItems:       { FREE: 20,    STARTER: 100,   PROFESSIONAL: 999999, ENTERPRISE: 999999 },
  aiCredits:      { FREE: 3,     STARTER: 50,    PROFESSIONAL: 200,    ENTERPRISE: 999999 },
};

export function hasFeature(plan: PlanName, feature: FeatureKey): boolean {
  return !!FEATURE_MATRIX[feature][plan];
}

export function getLimit(plan: PlanName, feature: FeatureKey): number {
  return Number(FEATURE_MATRIX[feature][plan]);
}

export function isOrderTypeAllowed(
  plan: PlanName,
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY"
): boolean {
  const mapping = {
    DINE_IN: "orderDineIn",
    TAKEAWAY: "orderTakeaway",
    DELIVERY: "orderDelivery",
  } as const;
  return hasFeature(plan, mapping[orderType]);
}

export function getAllowedOrderTypes(
  plan: PlanName
): ("DINE_IN" | "TAKEAWAY" | "DELIVERY")[] {
  const types: ("DINE_IN" | "TAKEAWAY" | "DELIVERY")[] = [];
  if (hasFeature(plan, "orderDineIn")) types.push("DINE_IN");
  if (hasFeature(plan, "orderTakeaway")) types.push("TAKEAWAY");
  if (hasFeature(plan, "orderDelivery")) types.push("DELIVERY");
  return types;
}

export function resolveEffectivePlan(subscription: {
  plan: PlanName | string;
  status: string;
  trialPlan?: PlanName | string | null;
  trialEndsAt?: Date | string | null;
} | null): PlanName {
  if (!subscription) return "FREE";

  if (
    subscription.status === "TRIALING" &&
    subscription.trialPlan &&
    subscription.trialEndsAt
  ) {
    const trialEnd = new Date(subscription.trialEndsAt);
    if (trialEnd > new Date()) {
      return subscription.trialPlan as PlanName;
    }
  }

  return subscription.plan as PlanName;
}
