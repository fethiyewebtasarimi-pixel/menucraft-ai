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
  email: z.string().email("Please enter a valid email address"),
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
      toast.success("Sifre sifirlama e-postasi gonderildi!");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("E-posta gonderilemedi. Lutfen tekrar deneyin.");
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

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Check your email
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          We've sent a password reset link to:
        </p>
        <p className="font-medium text-gray-900 dark:text-white mb-6">
          {getValues("email")}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Click the link in the email to reset your password. The link will
            expire in 1 hour.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full"
          >
            Try another email
          </Button>

          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="w-full text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Forgot password?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
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
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        {/* Back to Login */}
        <Link href="/auth/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          If you don't receive an email within a few minutes, please check your
          spam folder or contact support.
        </p>
      </div>
    </motion.div>
  );
}
