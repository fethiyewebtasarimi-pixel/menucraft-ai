"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Mehmet Yılmaz",
    restaurant: "Lokanta 1923",
    location: "İstanbul",
    avatar: "MY",
    rating: 5,
    quote:
      "MenuCraft AI sayesinde menümüzü dijitalleştirmek sadece 10 dakika sürdü. Müşterilerimiz artık 6 farklı dilde menüye erişebiliyor. Yabancı müşteri memnuniyetimiz %80 arttı!",
  },
  {
    name: "Ayşe Demir",
    restaurant: "Botanik Cafe & Bistro",
    location: "Ankara",
    avatar: "AD",
    rating: 5,
    quote:
      "QR kod sistemi harika çalışıyor. Garsonlarımız artık menü vermekle vakit kaybetmiyor, sipariş alma sürecimiz çok daha hızlı. Ayrıca analitik raporlar sayesinde hangi ürünlerin daha popüler olduğunu görüyoruz.",
  },
  {
    name: "Can Özkan",
    restaurant: "Keyif Restaurant",
    location: "İzmir",
    avatar: "CÖ",
    rating: 5,
    quote:
      "Basılı menülerimizi sürekli güncellemek çok maliyetliydi. Şimdi fiyat veya ürün değişikliğini 1 dakikada yapıp tüm QR kodlara yansıtabiliyoruz. Hem para hem zaman tasarrufu!",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
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
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Binlerce restoran MenuCraft AI ile dijital dönüşümünü tamamladı
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-card dark:bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-16 h-16 text-primary" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 relative z-10">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 relative z-10">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {testimonial.avatar}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.restaurant}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Decorative Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              4.9/5
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Ortalama Puan
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              10,000+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Mutlu Müşteri
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              %98
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Memnuniyet Oranı
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              500K+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Aylık Görüntülenme
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
