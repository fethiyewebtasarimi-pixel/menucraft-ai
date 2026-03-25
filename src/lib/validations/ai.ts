import { z } from "zod";

export const generateDescriptionSchema = z.object({
  menuItemName: z.string().min(1, "Menu item name is required").max(500),
  language: z.enum(["tr", "en"]).default("tr"),
  tone: z.enum(["casual", "formal", "appetizing"]).default("appetizing"),
});

export const nutritionSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  ingredients: z.array(z.string().max(200)).max(50).default([]),
});

export const visionAnalyzeSchema = z.object({
  image: z.string().min(1),
  mimeType: z.string().max(50).default("image/jpeg"),
});

export const enhanceImageSchema = z.object({
  image: z.string().min(1),
  mimeType: z.string().max(50).default("image/jpeg"),
  dishName: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;
export type NutritionInput = z.infer<typeof nutritionSchema>;
export type VisionAnalyzeInput = z.infer<typeof visionAnalyzeSchema>;
export type EnhanceImageInput = z.infer<typeof enhanceImageSchema>;
