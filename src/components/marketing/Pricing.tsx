"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const PLANS = [
  {
    name: "Ücretsiz",
    price: { monthly: 0, yearly: 0 },
    description: "Küçük işletmeler ve denemek isteyenler için",
    features: [
      "1 dijital menü",
      "1 QR kod",
      "Temel menü düzenleme",
      "Türkçe ve İngilizce dil desteği",
      "MenuCraft AI branding",
      "Email destek",
    ],
    cta: "Ücretsiz Başla",
    popular: false,
  },
  {
    name: "Başlangıç",
    price: { monthly: 299, yearly: 2870 },
    description: "Büyüyen restoran ve kafeler için",
    features: [
      "3 dijital menü",
      "10 QR kod",
      "AI menü oluşturma",
      "6 dil desteği (otomatik çeviri)",
      "Temel analitik",
      "Marka özelleştirme",
      "QR kod tasarımı",
      "Öncelikli destek",
    ],
    cta: "Hemen Başla",
    popular: false,
  },
  {
    name: "Profesyonel",
    price: { monthly: 599, yearly: 5750 },
    description: "Ciddi restoranlar ve zincirler için",
    features: [
      "Sınırsız dijital menü",
      "Sınırsız QR kod",
      "AI menü oluşturma ve güncelleme",
      "6 dil + özel dil ekleme",
      "Gelişmiş analitik ve raporlama",
      "Tam marka özelleştirme",
      "Online sipariş sistemi",
      "Stok yönetimi",
      "API erişimi",
      "7/24 premium destek",
    ],
    cta: "Hemen Başla",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: { monthly: null, yearly: null },
    description: "Büyük zincirler ve özel ihtiyaçlar için",
    features: [
      "Profesyonel plan özellikleri",
      "Özel sunucu seçeneği",
      "Sınırsız kullanıcı ve lokasyon",
      "Özel entegrasyon desteği",
      "Adanmış hesap yöneticisi",
      "Özel eğitim ve onboarding",
      "SLA garantisi",
      "Beyaz etiket seçeneği",
    ],
    cta: "İletişim",
    popular: false,
  },
]

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Fiyatlandırma
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            İşletmenizin büyüklüğüne uygun planı seçin
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all relative",
                billingPeriod === "yearly"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              Yıllık
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                %20
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl",
                plan.popular
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-105 lg:scale-110 z-10 border-4 border-amber-400"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-amber-600 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  En Popüler
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={cn(
                  "text-2xl font-bold mb-2",
                  plan.popular ? "text-white" : "text-slate-900 dark:text-white"
                )}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p
                className={cn(
                  "text-sm mb-6",
                  plan.popular ? "text-white/90" : "text-slate-600 dark:text-slate-400"
                )}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly === null ? (
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      plan.popular ? "text-white" : "text-slate-900 dark:text-white"
                    )}
                  >
                    Özel Fiyat
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        plan.popular ? "text-white" : "text-slate-900 dark:text-white"
                      )}
                    >
                      ₺
                      {billingPeriod === "monthly"
                        ? plan.price.monthly
                        : Math.round(plan.price.yearly / 12)}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        plan.popular ? "text-white/80" : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      /ay
                    </span>
                  </div>
                )}
                {billingPeriod === "yearly" && plan.price.yearly !== null && (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      plan.popular ? "text-white/80" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Yıllık ₺{plan.price.yearly} (2 ay ücretsiz)
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className={cn(
                  "w-full mb-6",
                  plan.popular
                    ? "bg-white text-amber-600 hover:bg-slate-50"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                )}
                size="lg"
              >
                <Link href="/auth/register">{plan.cta}</Link>
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        plan.popular ? "text-white" : "text-green-600 dark:text-green-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        plan.popular ? "text-white" : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-400">
            Tüm planlar 14 gün para iade garantisi ile gelir. Kredi kartı gerekmez.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
