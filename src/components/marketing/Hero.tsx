"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  { label: "10,000+ Restoran", value: "10K+" },
  { label: "%40 Satış Artışı", value: "40%" },
  { label: "5 Dakikada Hazır", value: "5 dk" },
  { label: "6 Dil Desteği", value: "6 Dil" },
]

export default function Hero() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-white font-medium">
                AI Destekli Dijital Menü Platformu
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Menünüzü Fotoğraflayın,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Saniyeler İçinde
              </span>
              <br />
              Dijital Menünüz Hazır
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 max-w-2xl"
            >
              Yapay zeka ile menü fotoğrafınızı analiz edin, otomatik dijital
              menü oluşturun, QR kod ile müşterilerinize sunun.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-lg px-8 py-6 shadow-2xl shadow-primary/50"
              >
                <Link href="/auth/register">
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("#how-it-works")}
                className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10"
              >
                <Play className="mr-2 w-5 h-5" />
                Nasıl Çalışır?
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto w-full max-w-sm">
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-8 -left-8 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      Menü Oluşturuldu
                    </div>
                    <div className="text-slate-400 text-xs">2 saniye önce</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-8 -right-8 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      AI Aktif
                    </div>
                    <div className="text-slate-400 text-xs">6 dil desteği</div>
                  </div>
                </div>
              </motion.div>

              {/* Phone Frame */}
              <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] overflow-hidden">
                  {/* Notch */}
                  <div className="h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto" />

                  {/* Screen Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-24 bg-gradient-to-r from-primary to-primary/80 rounded-lg" />
                      <div className="h-8 w-8 bg-slate-700 rounded-full" />
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="h-32 bg-slate-700 rounded-xl" />
                      <div className="h-4 bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-slate-700 rounded w-20" />
                        <div className="h-8 w-8 bg-primary rounded-full" />
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="h-24 bg-slate-700 rounded-xl" />
                      <div className="h-4 bg-slate-700 rounded w-2/3" />
                      <div className="h-4 bg-slate-700 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
    </section>
  )
}
