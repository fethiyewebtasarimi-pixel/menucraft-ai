import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

/**
 * Lazy trial expiry check. Call in API routes that need plan info.
 * If trial has expired, downgrades to FREE and notifies user.
 */
export async function checkAndExpireTrial(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  // Check if trial has expired
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) <= new Date()
  ) {
    const updated = await prisma.subscription.updateMany({
      where: {
        id: subscription.id,
        status: "TRIALING",
      },
      data: {
        status: "ACTIVE",
        plan: "FREE",
        trialPlan: null,
        trialEndsAt: null,
        aiCredits: 3,
        aiCreditsUsed: 0,
      },
    });

    if (updated.count > 0) {
      await createNotification({
        userId,
        type: "SUBSCRIPTION",
        title: "Deneme Süreniz Sona Erdi",
        message:
          "Professional deneme süreniz sona erdi. Ücretsiz plana geçirildiniz. Özelliklerden faydalanmaya devam etmek için planınızı yükseltin.",
        data: { action: "trial_expired" },
      });
    }

    return await prisma.subscription.findUnique({ where: { userId } });
  }

  // Send trial warning notifications (3 day and 1 day)
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt
  ) {
    const daysRemaining = getTrialDaysRemaining(subscription);

    if (daysRemaining !== null && (daysRemaining === 3 || daysRemaining === 1)) {
      const existingWarning = await prisma.notification.findFirst({
        where: {
          userId,
          type: "SUBSCRIPTION",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!existingWarning) {
        await createNotification({
          userId,
          type: "SUBSCRIPTION",
          title: "Deneme Süreniz Bitiyor",
          message: `Professional deneme sürenizin bitmesine ${daysRemaining} gün kaldı. Planınızı yükselterek tüm özelliklerden faydalanmaya devam edin!`,
          data: { action: `trial_warning_${daysRemaining}d` },
        });
      }
    }
  }

  return subscription;
}

/**
 * Get trial days remaining. Returns null if not on trial.
 */
export function getTrialDaysRemaining(subscription: {
  status: string;
  trialEndsAt?: Date | string | null;
}): number | null {
  if (subscription.status !== "TRIALING" || !subscription.trialEndsAt)
    return null;
  const end = new Date(subscription.trialEndsAt);
  const now = new Date();
  if (end <= now) return 0;
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
