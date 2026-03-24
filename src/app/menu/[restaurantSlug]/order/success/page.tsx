"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Clock, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

function SuccessContent({ params }: { params: { restaurantSlug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const accentColor = "#f59e0b";

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [accentColor, "#fbbf24", "#f97316"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [accentColor, "#fbbf24", "#f97316"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-accent dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <CheckCircle
                className="w-16 h-16"
                style={{ color: accentColor }}
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground dark:text-white mb-3"
          >
            Siparişiniz Alındı!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground dark:text-gray-400 mb-6"
          >
            Siparişiniz başarıyla oluşturuldu ve restoran tarafından hazırlanmaya
            başlanacak.
          </motion.p>

          {/* Order Number */}
          {orderNumber && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-accent dark:bg-gray-800 rounded-xl p-4 mb-6"
            >
              <div className="text-sm text-muted-foreground dark:text-gray-400 mb-1">
                Sipariş Numaranız
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: accentColor }}
              >
                {orderNumber}
              </div>
            </motion.div>
          )}

          {/* Estimated Time */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-muted-foreground dark:text-gray-400 mb-8"
          >
            <Clock className="w-5 h-5" />
            <span>Tahmini Hazırlanma Süresi: 20-30 dakika</span>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Siparişinizin durumunu telefon numaranıza SMS olarak
              bilgilendireceğiz.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <button
              onClick={() => router.push(`/menu/${params.restaurantSlug}`)}
              className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <Home className="w-5 h-5" />
              <span>Menüye Dön</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl bg-muted/50 dark:bg-gray-800 text-foreground/80 dark:text-gray-300 font-semibold transition-all hover:bg-muted dark:hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </motion.div>

          {/* Thank You Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground dark:text-gray-400 mt-8"
          >
            Bizi tercih ettiğiniz için teşekkür ederiz! 🎉
          </motion.p>
        </motion.div>

        {/* Additional Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          <div className="bg-card dark:bg-gray-900 rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">📱</div>
            <div className="text-xs text-muted-foreground dark:text-gray-400">
              SMS ile takip
            </div>
          </div>
          <div className="bg-card dark:bg-gray-900 rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-muted-foreground dark:text-gray-400">
              Hızlı hazırlık
            </div>
          </div>
          <div className="bg-card dark:bg-gray-900 rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">✨</div>
            <div className="text-xs text-muted-foreground dark:text-gray-400">
              Taze malzemeler
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-accent dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    }>
      <SuccessContent params={params} />
    </Suspense>
  );
}
