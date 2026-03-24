"use client"

import { motion } from "framer-motion"
import { Sparkles, QrCode, Globe, ShoppingBag, BarChart3, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Sparkles,
    title: "AI Menü Oluşturma",
    description:
      "Menü fotoğrafınızı yükleyin, yapay zeka otomatik olarak yemekleri tanısın, kategorilere ayırsın ve açıklamaları oluştursun.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: QrCode,
    title: "QR Kod Yönetimi",
    description:
      "Özelleştirilebilir QR kodlar oluşturun, masalarınıza atayın, her masa için ayrı analitik verilerine erişin.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Globe,
    title: "Çoklu Dil Desteği",
    description:
      "Menünüz otomatik olarak 6 dile çevrilir: Türkçe, İngilizce, Almanca, Fransızca, Rusça ve Arapça.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: ShoppingBag,
    title: "Sipariş Sistemi",
    description:
      "Müşterileriniz QR koddan menüye erişsin, sipariş versin. Siparişleri gerçek zamanlı olarak takip edin.",
    gradient: "from-primary to-red-600",
  },
  {
    icon: BarChart3,
    title: "Detaylı Analitik",
    description:
      "Hangi yemekler daha çok görüntüleniyor, hangi saatlerde sipariş alıyorsunuz, müşteri davranışlarını analiz edin.",
    gradient: "from-primary to-yellow-600",
  },
  {
    icon: Palette,
    title: "Marka Özelleştirme",
    description:
      "Kendi markanızı yansıtın. Logo, renkler, fontlar ve temalarla menünüzü özelleştirin.",
    gradient: "from-indigo-500 to-purple-600",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
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
            Güçlü Özellikler
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Dijital menünüzü yönetmek için ihtiyacınız olan her şey, tek bir platformda
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative"
            >
              <div className="relative h-full bg-card dark:bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/50 overflow-hidden">
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Accent Border Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={cn("h-full bg-gradient-to-r", feature.gradient)} />
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={cn(
                      "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br",
                      feature.gradient,
                      "transform group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 dark:text-slate-400">
            Ve daha fazlası... Sürekli yeni özellikler ekliyoruz.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
