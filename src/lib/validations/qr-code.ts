import { z } from "zod";

export const qrCodeSchema = z.object({
  tableId: z.string().max(100).optional(),
  style: z.enum(["CLASSIC", "MODERN", "ROUNDED", "DOTS", "BRANDED"]).optional(),
  foregroundColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
});

export const updateQRCodeSchema = z.object({
  tableId: z.string().max(100).nullable().optional(),
  style: z.enum(["CLASSIC", "MODERN", "ROUNDED", "DOTS", "BRANDED"]).optional(),
  foregroundColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export type CreateQRCodeInput = z.infer<typeof qrCodeSchema>;
export type UpdateQRCodeInput = z.infer<typeof updateQRCodeSchema>;
