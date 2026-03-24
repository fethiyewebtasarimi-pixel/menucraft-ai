"use client"

import { motion } from "framer-motion"
import { Camera, Sparkles, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: 1,
    icon: Camera,
    title: "Menü Fotoğrafını Yükleyin",
    description:
      "Mevcut menünüzün fotoğrafını çekin veya yükleyin. PDF, JPG, PNG formatları desteklenir.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "AI Menüyü Oluşturur",
    description:
      "Yapay zeka menünüzü otomatik olarak analiz eder, kategorilere ayırır ve 6 dile çevirir.",
  },
  {
    number: 3,
    icon: QrCode,
    title: "QR Kodu Paylaşın",
    description:
      "Özel QR kodunuzu masalarınıza yerleştirin. Müşterileriniz anında dijital menüye erişsin.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sadece 3 basit adımda dijital menünüzü oluşturun ve müşterilerinize sunun
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connecting Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connecting Dots */}
                <div className="hidden md:flex absolute top-24 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-slate-950 z-10" />

                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    {/* Number Badge */}
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-xl rounded-full mb-6">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl">
                        <step.icon className="w-8 h-8 text-primary dark:text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/80" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Ortalama kurulum süresi sadece <span className="font-bold text-primary">5 dakika</span>
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a href="/auth/register" className="inline-block bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/30 transition-all">
              Hemen Başlayın - Ücretsiz
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
