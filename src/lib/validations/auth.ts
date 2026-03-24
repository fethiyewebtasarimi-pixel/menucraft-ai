import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır")
  .max(128, "Şifre en fazla 128 karakter olabilir")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
  );

export const loginSchema = z.object({
  email: z.string().max(255).email("Geçerli bir email adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir").max(128),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır").max(100, "İsim en fazla 100 karakter olabilir"),
    email: z.string().max(255).email("Geçerli bir email adresi giriniz"),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().max(20).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().max(255).email("Geçerli bir email adresi giriniz"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const resetPasswordApiSchema = z.object({
  email: z.string().max(255).email(),
  token: z.string().min(1),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
