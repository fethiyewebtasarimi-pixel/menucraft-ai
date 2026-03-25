import { z } from "zod";

export const qrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  tableId: z.string().max(100).optional(),
  styleType: z.enum(["CLASSIC", "ROUNDED", "DOTS"]).optional(),
  colorPrimary: z.string().max(20).optional(),
  colorBackground: z.string().max(20).optional(),
});

export const updateQRCodeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tableId: z.string().max(100).nullable().optional(),
  styleType: z.enum(["CLASSIC", "ROUNDED", "DOTS"]).optional(),
  colorPrimary: z.string().max(20).optional(),
  colorBackground: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export type CreateQRCodeInput = z.infer<typeof qrCodeSchema>;
export type UpdateQRCodeInput = z.infer<typeof updateQRCodeSchema>;
