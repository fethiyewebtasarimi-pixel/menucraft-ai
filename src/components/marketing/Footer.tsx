"use client"

import { ChefHat, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Nasıl Çalışır?", href: "#how-it-works" },
    { label: "Özellikler", href: "#features" },
    { label: "Fiyatlandırma", href: "#pricing" },
    { label: "S.S.S.", href: "#faq" },
  ],
  company: [
    { label: "Hakkımızda", href: "#faq" },
    { label: "İletişim", href: "mailto:destek@menucraft.ai" },
  ],
  support: [
    { label: "S.S.S.", href: "#faq" },
    { label: "Destek", href: "mailto:destek@menucraft.ai" },
  ],
  legal: [
    { label: "Gizlilik Politikası", href: "/privacy" },
    { label: "Kullanım Şartları", href: "/terms" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MenuCraft AI</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm">
              Yapay zeka destekli dijital menü platformu ile restoranınızı
              dijital çağa taşıyın. Müşteri deneyimini geliştirin, satışlarınızı
              artırın.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:destek@menucraft.ai"
                className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">destek@menucraft.ai</span>
              </a>
              <a
                href="tel:+905551234567"
                className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">+90 (555) 123 45 67</span>
              </a>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Maslak, Büyükdere Cd. No:255
                  <br />
                  34398 Sarıyer/İstanbul
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Ürün</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Destek</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Yasal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-sm text-slate-400">
            © {currentYear} MenuCraft AI. Tüm hakları saklıdır.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 bg-slate-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Language */}
          <div className="text-sm text-slate-400">
            🇹🇷 Türkçe
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-slate-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-xs text-slate-500">256-bit SSL Şifreleme</div>
            <div className="text-xs text-slate-500">KVKK Uyumlu</div>
            <div className="text-xs text-slate-500">ISO 27001 Sertifikalı</div>
            <div className="text-xs text-slate-500">%99.9 Uptime Garantisi</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
