"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
  email: z.string().email("Lütfen geçerli bir e-posta adresi girin"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setEmailSent(true);
      toast.success("Şifre sıfırlama e-postası gönderildi!");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("E-posta gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-3">
          E-postanızı kontrol edin
        </h1>

        <p className="text-muted-foreground dark:text-muted-foreground/70 mb-2">
          Şifre sıfırlama bağlantısı gönderildi:
        </p>
        <p className="font-medium text-foreground dark:text-white mb-6">
          {getValues("email")}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            E-postadaki bağlantıya tıklayarak şifrenizi sıfırlayın. Bağlantı 1
            saat içinde geçerliliğini yitirecektir.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full"
          >
            Başka bir e-posta dene
          </Button>

          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="w-full text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş sayfasına dön
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">
          Şifremi Unuttum
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground/70">
          Endişelenmeyin, size sıfırlama talimatları göndereceğiz
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/80 dark:text-gray-300">
            E-posta adresi
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              className="pl-10"
              {...register("email")}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            "Sıfırlama Bağlantısı Gönder"
          )}
        </Button>

        {/* Back to Login */}
        <Link href="/auth/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-gray-900 dark:text-muted-foreground/70 dark:hover:text-white"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Giriş sayfasına dön
          </Button>
        </Link>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-accent dark:bg-gray-700/50 rounded-lg">
        <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 text-center">
          Birkaç dakika içinde e-posta almadıysanız, lütfen spam klasörünüzü
          kontrol edin veya destek ile iletişime geçin.
        </p>
      </div>
    </motion.div>
  );
}
