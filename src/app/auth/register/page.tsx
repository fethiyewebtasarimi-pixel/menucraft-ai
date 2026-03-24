"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, Chrome, Check } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Registration failed");
        return;
      }

      toast.success("Account created successfully!");

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please sign in manually.");
        router.push("/auth/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create your account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start crafting amazing menus with AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
            Full name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="pl-10"
              {...register("name")}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

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
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
            Phone number{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="pl-10"
              {...register("phone")}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-gray-700 dark:text-gray-300"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register("password")}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-gray-700 dark:text-gray-300"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register("confirmPassword")}
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            disabled={isLoading || isGoogleLoading}
            className="mt-1"
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Sign Up Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create account
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Chrome className="mr-2 h-5 w-5 text-blue-600" />
              Sign up with Google
            </>
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
