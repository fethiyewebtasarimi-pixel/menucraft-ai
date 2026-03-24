"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "MenuCraft AI nedir?",
    answer:
      "MenuCraft AI, restoranların fiziksel menülerini yapay zeka desteğiyle dijitalleştiren bir platformdur. Menü fotoğrafınızı yüklediğinizde, yapay zekamız otomatik olarak yemekleri tanır, kategorilere ayırır, çeviri yapar ve size özelleştirilebilir bir dijital menü oluşturur. Müşterileriniz QR kod ile bu menüye kolayca erişebilir.",
  },
  {
    question: "AI menü oluşturma nasıl çalışır?",
    answer:
      "Mevcut menünüzün fotoğrafını (JPG, PNG veya PDF) yüklediğinizde, gelişmiş OCR ve yapay zeka teknolojimiz metinleri okur, yemek isimlerini, açıklamalarını ve fiyatları tanır. Ardından bu bilgileri otomatik olarak kategorilere ayırır, düzenler ve 6 farklı dile çevirir. Siz sadece son kontrolleri yapıp menünüzü yayınlarsınız. Tüm süreç ortalama 5-10 dakika sürer.",
  },
  {
    question: "Ücretsiz plan nerelere kadar yeterli?",
    answer:
      "Ücretsiz planımız, küçük işletmeler ve platformumuzu denemek isteyenler için idealdir. 1 dijital menü, 1 QR kod, temel menü düzenleme özellikleri ve Türkçe-İngilizce dil desteği sunuyoruz. Ancak AI menü oluşturma, gelişmiş analitik, marka özelleştirme ve ek dil desteği için ücretli planlarımızdan birine geçmeniz gerekir.",
  },
  {
    question: "QR kodlarım kalıcı mı?",
    answer:
      "Evet, QR kodlarınız kalıcıdır ve değişmez. Menünüzde ne kadar değişiklik yaparsanız yapın, QR kodunuz aynı kalır. Bu sayede masalarınıza yerleştirdiğiniz QR kodları tekrar bastırmanıza gerek kalmaz. Tüm güncellemeler otomatik olarak QR kodunuza yansır.",
  },
  {
    question: "Hangi dilleri destekliyorsunuz?",
    answer:
      "Şu anda 6 dili destekliyoruz: Türkçe, İngilizce, Almanca, Fransızca, Rusça ve Arapça. AI destekli otomatik çeviri sistemimiiz, menünüzü tüm bu dillere anında çevirir. Profesyonel ve Kurumsal planlarımızda özel dil ekleme taleplerinizi de değerlendirebiliriz.",
  },
  {
    question: "Mevcut menümü nasıl aktarabilirim?",
    answer:
      "Menünüzü aktarmak çok kolay! İki yöntem var: 1) AI Yükleme: Mevcut menünüzün fotoğrafını veya PDF'ini yükleyin, yapay zekamız otomatik olarak her şeyi dijitalleştirsin. 2) Manuel Giriş: Sisteme giriş yapıp menü editörümüzü kullanarak yemeklerinizi tek tek ekleyebilirsiniz. Çoğu müşterimiz AI yükleme ile 5 dakikada menülerini aktarıyor.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-white dark:bg-slate-950">
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
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Aklınıza takılan her şeyi burada yanıtladık
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 border-2 border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Başka sorularınız mı var?
          </p>
          <a
            href="mailto:destek@menucraft.ai"
            className="text-primary hover:text-primary font-semibold inline-flex items-center gap-2 group"
          >
            Bizimle İletişime Geçin
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
