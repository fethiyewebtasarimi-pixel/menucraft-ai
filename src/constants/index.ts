export const APP_NAME = "MenuCraft AI";
export const APP_DESCRIPTION =
  "AI destekli dijital menü platformu. Menünüzün fotoğrafını çekin, saniyeler içinde dijital menünüz hazır!";

export const CURRENCIES = [
  { value: "TRY", label: "Türk Lirası (₺)", symbol: "₺" },
  { value: "USD", label: "Amerikan Doları ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "İngiliz Sterlini (£)", symbol: "£" },
  { value: "AED", label: "BAE Dirhemi (د.إ)", symbol: "د.إ" },
  { value: "SAR", label: "Suudi Riyali (﷼)", symbol: "﷼" },
];

export const LANGUAGES = [
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export const ALLERGENS = [
  "Gluten",
  "Süt Ürünleri",
  "Yumurta",
  "Fıstık",
  "Kabuklu Deniz Ürünleri",
  "Balık",
  "Soya",
  "Kereviz",
  "Hardal",
  "Susam",
  "Kükürt Dioksit",
  "Lupin",
  "Yumuşakçalar",
  "Kuruyemiş",
];

export const FOOD_TAGS = [
  "Popüler",
  "Yeni",
  "Şef Önerisi",
  "Acılı",
  "Vegan",
  "Vejetaryen",
  "Glutensiz",
  "Organik",
  "Ev Yapımı",
  "Mevsimlik",
  "Sınırlı Stok",
  "Ekonomik",
];

export const MENU_TYPES = [
  { value: "DINE_IN", label: "Restoran Menüsü" },
  { value: "TAKEAWAY", label: "Paket Servis" },
  { value: "DELIVERY", label: "Kurye Menüsü" },
  { value: "BREAKFAST", label: "Kahvaltı" },
  { value: "LUNCH", label: "Öğle Yemeği" },
  { value: "DINNER", label: "Akşam Yemeği" },
  { value: "DRINKS", label: "İçecekler" },
  { value: "DESSERT", label: "Tatlılar" },
  { value: "SEASONAL", label: "Mevsimsel" },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Pazar" },
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
];

export const ORDER_STATUS_MAP = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "Hazırlanıyor", color: "bg-primary/10 text-primary" },
  READY: { label: "Hazır", color: "bg-green-100 text-green-800" },
  SERVED: { label: "Servis Edildi", color: "bg-emerald-100 text-emerald-800" },
  COMPLETED: { label: "Tamamlandı", color: "bg-muted/50 text-foreground" },
  CANCELLED: { label: "İptal Edildi", color: "bg-red-100 text-red-800" },
};

export const PLANS = [
  {
    name: "Free",
    slug: "FREE",
    price: 0,
    yearlyPrice: 0,
    description: "Küçük işletmeler için ideal başlangıç",
    features: [
      "1 restoran",
      "1 menü",
      "20 yemek limiti",
      "3 AI kredi",
      "Temel QR kod",
      "Temel analitik",
    ],
    limitations: [
      "MenuCraft filigranı",
      "Sipariş özelliği yok",
      "Garson çağırma yok",
      "Tek dil",
    ],
  },
  {
    name: "Starter",
    slug: "STARTER",
    price: 299,
    yearlyPrice: 239,
    description: "Büyüyen işletmeler için",
    popular: false,
    features: [
      "1 restoran",
      "3 menü",
      "100 yemek limiti",
      "50 AI kredi/ay",
      "Özel QR kod tasarımı",
      "Filigran yok",
      "Garson çağırma",
      "Masada sipariş (Dine-in)",
      "2 dil desteği",
      "E-posta desteği",
    ],
    limitations: [],
  },
  {
    name: "Professional",
    slug: "PROFESSIONAL",
    price: 599,
    yearlyPrice: 479,
    description: "Profesyonel işletmeler için en popüler plan",
    popular: true,
    features: [
      "5 restoran",
      "Sınırsız menü",
      "Sınırsız yemek",
      "200 AI kredi/ay",
      "Premium QR kod (logolu)",
      "Sınırsız dil desteği",
      "Garson çağırma",
      "Tüm sipariş tipleri (Dine-in, Paket, Gel Al)",
      "Gelişmiş analitik",
      "Öncelikli destek",
    ],
    limitations: [],
  },
  {
    name: "Enterprise",
    slug: "ENTERPRISE",
    price: -1,
    yearlyPrice: -1,
    description: "Büyük zincirler ve özel ihtiyaçlar için",
    features: [
      "Sınırsız restoran",
      "Sınırsız her şey",
      "Özel entegrasyonlar",
      "API erişimi",
      "Özel hesap yöneticisi",
      "SLA garantisi",
      "Beyaz etiket opsiyonu",
    ],
    limitations: [],
  },
];

export const FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lora", label: "Lora" },
  { value: "Nunito", label: "Nunito" },
  { value: "Raleway", label: "Raleway" },
];
