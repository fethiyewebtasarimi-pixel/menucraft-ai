import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(2, "Restoran adı en az 2 karakter olmalıdır").max(200, "Restoran adı en fazla 200 karakter olabilir"),
  slug: z
    .string()
    .min(2, "Slug en az 2 karakter olmalıdır")
    .max(200, "Slug en fazla 200 karakter olabilir")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug sadece küçük harf, rakam ve tire içerebilir"
    )
    .optional(),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(255).email("Geçerli bir email giriniz").optional().or(z.literal("")),
  website: z.string().max(500).url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  currency: z.string().max(10).default("TRY"),
  timezone: z.string().max(50).default("Europe/Istanbul"),
});

export const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir renk kodu giriniz"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir renk kodu giriniz"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir renk kodu giriniz"),
  fontFamily: z.string().max(100),
  menuLayout: z.enum(["GRID", "LIST", "COMPACT", "MAGAZINE"]),
  headerStyle: z.enum(["MODERN", "CLASSIC", "MINIMAL", "HERO"]),
  showLogo: z.boolean(),
  showCover: z.boolean(),
  customCSS: z.string().max(10000).optional(),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
