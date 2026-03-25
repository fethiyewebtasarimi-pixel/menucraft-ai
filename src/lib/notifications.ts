import { prisma } from "@/lib/prisma";

type NotificationType = "NEW_ORDER" | "ORDER_STATUS" | "NEW_REVIEW" | "SYSTEM" | "SUBSCRIPTION";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: (input.data as any) || undefined,
      },
    });
  } catch (error) {
    console.error("[CREATE_NOTIFICATION]", error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Create notification when a new order is placed
 */
export async function notifyNewOrder(
  userId: string,
  orderNumber: string,
  restaurantName: string,
  total: number
) {
  return createNotification({
    userId,
    type: "NEW_ORDER",
    title: "Yeni Sipariş",
    message: `${restaurantName} için #${orderNumber} numaralı yeni sipariş alındı. Tutar: ₺${total.toFixed(2)}`,
    data: { orderNumber, restaurantName, total },
  });
}

/**
 * Create notification when a new review is posted
 */
export async function notifyNewReview(
  userId: string,
  restaurantName: string,
  rating: number,
  customerName?: string
) {
  return createNotification({
    userId,
    type: "NEW_REVIEW",
    title: "Yeni Yorum",
    message: `${customerName || "Bir müşteri"} ${restaurantName} için ${rating} yıldız verdi.`,
    data: { restaurantName, rating, customerName },
  });
}
