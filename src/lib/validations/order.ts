import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Yemek seçimi gereklidir"),
  quantity: z.number().int().positive("Miktar pozitif olmalıdır"),
  notes: z.string().max(500).optional(),
  modifiers: z.any().optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).default("DINE_IN"),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(20).optional(),
  customerEmail: z.string().max(255).email().optional().or(z.literal("")),
  customerAddress: z.string().max(500).optional(),
  customerNote: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1, "En az bir ürün eklemelisiniz"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SERVED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
