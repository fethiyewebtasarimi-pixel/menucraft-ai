"use client";

import { useState, useRef } from "react";
import {
  FileDown,
  Printer,
  Palette,
  Type,
  LayoutGrid,
  Eye,
  ChefHat,
  AlertTriangle,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useRestaurants } from "@/hooks/useRestaurant";
import { useMenuItems, useCategories } from "@/hooks/useMenu";

const ALLERGEN_ICONS: Record<string, string> = {
  Gluten: "🌾",
  "Süt Ürünleri": "🥛",
  Yumurta: "🥚",
  Fıstık: "🥜",
  "Kabuklu Deniz Ürünleri": "🦐",
  Balık: "🐟",
  Soya: "🫘",
  Kereviz: "🥬",
  Hardal: "🟡",
  Susam: "🟤",
  "Kükürt Dioksit": "🍷",
  Lupin: "🌱",
  Yumuşakçalar: "🐚",
  Kuruyemiş: "🌰",
};

type Template = "modern" | "classic" | "minimal" | "elegant";
type Layout = "single" | "double";

interface MenuSettings {
  template: Template;
  layout: Layout;
  showImages: boolean;
  showCalories: boolean;
  showAllergens: boolean;
  showDescription: boolean;
  showNutrition: boolean;
  primaryColor: string;
  restaurantName: string;
  subtitle: string;
  footerText: string;
}

const TEMPLATES: Record<Template, { name: string; description: string }> = {
  modern: { name: "Modern", description: "Temiz çizgiler, büyük görseller" },
  classic: { name: "Klasik", description: "Geleneksel restoran menüsü" },
  minimal: { name: "Minimal", description: "Sade ve şık" },
  elegant: { name: "Zarif", description: "Lüks ve sofistike" },
};

export default function PrintMenuPage() {
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const { data: menuItems, isLoading } = useMenuItems(restaurant?.id);
  const { data: categories } = useCategories(restaurant?.id);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [settings, setSettings] = useState<MenuSettings>({
    template: "modern",
    layout: "single",
    showImages: true,
    showCalories: true,
    showAllergens: true,
    showDescription: true,
    showNutrition: false,
    primaryColor: "#d97706",
    restaurantName: restaurant?.name || "",
    subtitle: "Menü",
    footerText: "Afiyet olsun!",
  });

  // Update restaurant name when loaded
  if (restaurant?.name && !settings.restaurantName) {
    setSettings((s) => ({ ...s, restaurantName: restaurant.name }));
  }

  // Group items by category
  const groupedItems = (menuItems || []).reduce(
    (acc: Record<string, typeof menuItems>, item: any) => {
      const catName =
        categories?.find((c: any) => c.id === item.categoryId)?.name ||
        "Diğer";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(item);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = printRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: settings.layout === "double" ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${settings.restaurantName || "menu"}-menu.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const templateClasses: Record<Template, string> = {
    modern: "font-sans",
    classic: "font-serif",
    minimal: "font-sans",
    elegant: "font-serif",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileDown className="h-8 w-8 text-primary" />
            Basıma Hazır Menü
          </h1>
          <p className="text-muted-foreground mt-1">
            Menünüzü özelleştirin ve PDF olarak indirin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Yazdır
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/80 text-white"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            PDF İndir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          {/* Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Şablon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.entries(TEMPLATES) as [Template, { name: string; description: string }][]).map(
                ([key, tmpl]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSettings((s) => ({ ...s, template: key }))
                    }
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      settings.template === key
                        ? "border-primary bg-primary/5 dark:bg-primary/5"
                        : "border-transparent hover:border-muted"
                    }`}
                  >
                    <p className="font-medium text-sm">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tmpl.description}
                    </p>
                  </button>
                )
              )}
            </CardContent>
          </Card>

          {/* Layout */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Düzen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={settings.layout}
                onValueChange={(v: Layout) =>
                  setSettings((s) => ({ ...s, layout: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Tek Sütun</SelectItem>
                  <SelectItem value="double">Çift Sütun</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Style */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Stil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Ana Renk</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4" />
                İçerik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Restoran Adı</label>
                <Input
                  value={settings.restaurantName}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      restaurantName: e.target.value,
                    }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Alt Başlık</label>
                <Input
                  value={settings.subtitle}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, subtitle: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Alt Bilgi</label>
                <Input
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, footerText: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                {[
                  { key: "showImages" as const, label: "Görseller" },
                  { key: "showDescription" as const, label: "Açıklamalar" },
                  { key: "showCalories" as const, label: "Kalori" },
                  { key: "showAllergens" as const, label: "Alerjenler" },
                  { key: "showNutrition" as const, label: "Besin Değerleri" },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{opt.label}</span>
                    <Switch
                      checked={settings[opt.key]}
                      onCheckedChange={(v) =>
                        setSettings((s) => ({ ...s, [opt.key]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div
              ref={printRef}
              className={`bg-white text-black p-8 min-h-[800px] ${templateClasses[settings.template]}`}
            >
              {/* Header */}
              <div
                className={`text-center mb-8 pb-6 ${
                  settings.template === "elegant"
                    ? "border-b-2"
                    : settings.template === "classic"
                    ? "border-b-4 border-double"
                    : "border-b"
                }`}
                style={{ borderColor: settings.primaryColor }}
              >
                {settings.template === "elegant" && (
                  <div
                    className="text-xs tracking-[0.5em] uppercase mb-2"
                    style={{ color: settings.primaryColor }}
                  >
                    ★ ★ ★
                  </div>
                )}
                <h1
                  className={`font-bold ${
                    settings.template === "modern"
                      ? "text-4xl"
                      : settings.template === "elegant"
                      ? "text-5xl italic"
                      : settings.template === "minimal"
                      ? "text-3xl tracking-widest uppercase"
                      : "text-4xl"
                  }`}
                  style={{ color: settings.primaryColor }}
                >
                  {settings.restaurantName || "Restoran Adı"}
                </h1>
                <p
                  className={`mt-2 ${
                    settings.template === "minimal"
                      ? "text-xs tracking-[0.3em] uppercase text-gray-500"
                      : "text-lg text-gray-600"
                  }`}
                >
                  {settings.subtitle}
                </p>
              </div>

              {/* Menu Items */}
              <div
                className={
                  settings.layout === "double"
                    ? "grid grid-cols-2 gap-x-8"
                    : ""
                }
              >
                {Object.entries(groupedItems).map(
                  ([categoryName, catItems]: [string, any]) => (
                    <div key={categoryName} className="mb-8 break-inside-avoid">
                      {/* Category Header */}
                      <div
                        className={`mb-4 ${
                          settings.template === "modern"
                            ? "border-l-4 pl-3"
                            : settings.template === "elegant"
                            ? "text-center"
                            : settings.template === "minimal"
                            ? "border-b pb-1"
                            : "border-b-2 pb-2"
                        }`}
                        style={{ borderColor: settings.primaryColor }}
                      >
                        <h2
                          className={`font-bold ${
                            settings.template === "modern"
                              ? "text-xl"
                              : settings.template === "elegant"
                              ? "text-2xl italic"
                              : settings.template === "minimal"
                              ? "text-sm tracking-[0.3em] uppercase"
                              : "text-xl"
                          }`}
                          style={{ color: settings.primaryColor }}
                        >
                          {categoryName}
                        </h2>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {catItems.map((item: any) => (
                          <div
                            key={item.id}
                            className={`flex gap-3 ${
                              settings.template === "elegant" ? "py-2" : ""
                            }`}
                          >
                            {/* Image */}
                            {settings.showImages && item.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <h3
                                  className={`font-semibold ${
                                    settings.template === "elegant"
                                      ? "italic"
                                      : settings.template === "minimal"
                                      ? "text-sm"
                                      : ""
                                  }`}
                                >
                                  {item.name}
                                </h3>
                                <div
                                  className={`flex-shrink-0 font-bold ${
                                    settings.template === "elegant"
                                      ? "text-lg"
                                      : ""
                                  }`}
                                  style={{ color: settings.primaryColor }}
                                >
                                  {settings.template === "classic" ? (
                                    <>
                                      <span className="border-b border-dotted border-gray-400 inline-block w-8" />{" "}
                                    </>
                                  ) : null}
                                  ₺
                                  {typeof item.price === "object"
                                    ? Number(item.price).toFixed(2)
                                    : Number(item.price).toFixed(2)}
                                </div>
                              </div>

                              {settings.showDescription && item.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {settings.showCalories && item.calories && (
                                  <span className="text-[10px] text-primary font-medium">
                                    {item.calories} kcal
                                  </span>
                                )}
                                {settings.showAllergens &&
                                  item.allergens?.length > 0 && (
                                    <span className="text-[10px]">
                                      {item.allergens
                                        .map(
                                          (a: string) =>
                                            ALLERGEN_ICONS[a] || "⚠️"
                                        )
                                        .join(" ")}
                                    </span>
                                  )}
                                {item.isVegan && (
                                  <span className="text-[10px] text-green-600">
                                    🌱V
                                  </span>
                                )}
                                {item.isSpicy && (
                                  <span className="text-[10px]">🌶️</span>
                                )}
                              </div>

                              {settings.showNutrition &&
                                (item.protein || item.carbs || item.fat) && (
                                  <div className="text-[9px] text-gray-400 mt-0.5">
                                    {item.protein && `P:${item.protein}g `}
                                    {item.carbs && `K:${item.carbs}g `}
                                    {item.fat && `Y:${item.fat}g`}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Allergen Legend */}
              {settings.showAllergens && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">
                    ALERJEN BİLGİLERİ
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {Object.entries(ALLERGEN_ICONS).map(([name, icon]) => (
                      <span key={name} className="text-[9px] text-gray-400">
                        {icon} {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div
                className="mt-8 pt-4 text-center border-t"
                style={{ borderColor: settings.primaryColor }}
              >
                <p
                  className={`${
                    settings.template === "elegant"
                      ? "italic text-lg"
                      : settings.template === "minimal"
                      ? "text-xs tracking-widest uppercase"
                      : "text-sm"
                  } text-gray-500`}
                >
                  {settings.footerText}
                </p>
                <p className="text-[9px] text-gray-300 mt-2">
                  MenuCraft AI ile oluşturuldu
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
