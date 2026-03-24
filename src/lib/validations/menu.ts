import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(200, "Kategori adı en fazla 200 karakter olabilir"),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
  image: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçimi gereklidir"),
  name: z.string().min(1, "Yemek adı gereklidir").max(200, "Yemek adı en fazla 200 karakter olabilir"),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  description: z.string().max(2000, "Açıklama en fazla 2000 karakter olabilir").optional(),
  descriptionTranslations: z.record(z.string(), z.string()).optional(),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  discountPrice: z.number().positive().optional().nullable(),
  image: z.string().max(500).optional(),
  calories: z.number().int().positive().optional().nullable(),
  protein: z.number().positive().optional().nullable(),
  carbs: z.number().positive().optional().nullable(),
  fat: z.number().positive().optional().nullable(),
  fiber: z.number().positive().optional().nullable(),
  sugar: z.number().positive().optional().nullable(),
  sodium: z.number().positive().optional().nullable(),
  servingSize: z.string().max(200).optional().nullable(),
  ingredients: z.array(z.string().max(200)).default([]),
  nutritionVerified: z.boolean().default(false),
  prepTime: z.number().int().positive().optional().nullable(),
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isChefRecommended: z.boolean().default(false),
  allergens: z.array(z.string().max(100)).default([]),
  tags: z.array(z.string().max(100)).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

export const menuSchema = z.object({
  name: z.string().min(1, "Menü adı gereklidir").max(200, "Menü adı en fazla 200 karakter olabilir"),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
  type: z
    .enum([
      "DINE_IN",
      "TAKEAWAY",
      "DELIVERY",
      "BREAKFAST",
      "LUNCH",
      "DINNER",
      "DRINKS",
      "DESSERT",
      "SEASONAL",
    ])
    .default("DINE_IN"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const menuItemVariantSchema = z.object({
  name: z.string().min(1, "Varyant adı gereklidir").max(200, "Varyant adı en fazla 200 karakter olabilir"),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  sortOrder: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuInput = z.infer<typeof menuSchema>;
export type MenuItemVariantInput = z.infer<typeof menuItemVariantSchema>;
