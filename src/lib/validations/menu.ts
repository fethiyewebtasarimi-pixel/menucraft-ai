import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(200, "Kategori adı en fazla 200 karakter olabilir"),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Transform: convert 0 or empty to null/undefined for optional number fields
const optionalPositiveNumber = z.coerce.number().optional().nullable()
  .transform(val => (val === 0 || val === null || val === undefined) ? undefined : val);

// Tags can arrive as comma-separated string or array
const tagsField = z.union([
  z.array(z.string().max(100)),
  z.string().transform(val => val ? val.split(",").map(s => s.trim()).filter(Boolean) : []),
]).default([]);

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçimi gereklidir"),
  name: z.string().min(1, "Yemek adı gereklidir").max(200, "Yemek adı en fazla 200 karakter olabilir"),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  description: z.string().max(2000, "Açıklama en fazla 2000 karakter olabilir").optional(),
  descriptionTranslations: z.record(z.string(), z.string()).optional(),
  price: z.coerce.number().nonnegative("Fiyat 0'dan küçük olamaz"),
  discountPrice: optionalPositiveNumber,
  image: z.string().optional(),
  calories: optionalPositiveNumber,
  protein: optionalPositiveNumber,
  carbs: optionalPositiveNumber,
  fat: optionalPositiveNumber,
  fiber: optionalPositiveNumber,
  sugar: optionalPositiveNumber,
  sodium: optionalPositiveNumber,
  servingSize: z.string().max(200).optional().nullable(),
  ingredients: z.array(z.string().max(200)).default([]),
  nutritionVerified: z.boolean().default(false),
  prepTime: optionalPositiveNumber,
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isChefRecommended: z.boolean().default(false),
  allergens: z.array(z.string().max(100)).default([]),
  tags: tagsField,
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
