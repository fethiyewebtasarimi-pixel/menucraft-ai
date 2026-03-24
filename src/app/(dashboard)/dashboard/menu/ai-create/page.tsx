"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  Camera,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  ImagePlus,
  FileDown,
  Wand2,
  Info,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useRestaurants } from "@/hooks/useRestaurant";
import { useCategories } from "@/hooks/useMenu";
import { ALLERGENS } from "@/constants";

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

interface WizardItem {
  id: string;
  originalImage: string;
  enhancedImage?: string;
  useEnhanced: boolean;
  isEnhancing: boolean;
  enhanceError: boolean;
  name: string;
  description: string;
  ingredients: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  allergens: string[];
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  category: string;
  categoryId: string;
  price: number;
  isAnalyzed: boolean;
}

export default function AIMenuWizardPage() {
  const router = useRouter();
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const { data: categories } = useCategories(restaurant?.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; preview: string; base64: string }>
  >([]);
  const [items, setItems] = useState<WizardItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const steps = [
    { num: 1, label: "Fotoğraf Yükle" },
    { num: 2, label: "AI Analiz" },
    { num: 3, label: "Düzenle & Onayla" },
    { num: 4, label: "Kaydet" },
  ];

  // --- FILE HANDLING ---

  const processFile = useCallback((file: File): Promise<{ file: File; preview: string; base64: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Sadece resim dosyaları yüklenebilir"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("Dosya boyutu 10MB'dan küçük olmalıdır"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve({ file, preview: base64, base64 });
      };
      reader.onerror = () => reject(new Error("Dosya okunamadı"));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const processed = await Promise.all(files.map(processFile));
      setUploadedImages((prev) => [...prev, ...processed]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Dosya yüklenemedi");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    try {
      const processed = await Promise.all(files.map(processFile));
      setUploadedImages((prev) => [...prev, ...processed]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Dosya yüklenemedi");
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- AI ANALYSIS ---

  const analyzeAll = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Lütfen en az bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(2);
    setAnalyzeProgress(0);

    const newItems: WizardItem[] = [];

    for (let i = 0; i < uploadedImages.length; i++) {
      setAnalyzeProgress(Math.round(((i + 1) / uploadedImages.length) * 100));

      try {
        const response = await fetch("/api/ai/vision-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: uploadedImages[i].base64,
            mimeType: uploadedImages[i].file.type || "image/jpeg",
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Analiz başarısız");
        }

        const data = await response.json();

        newItems.push({
          id: `item-${Date.now()}-${i}`,
          originalImage: uploadedImages[i].preview,
          useEnhanced: false,
          isEnhancing: false,
          enhanceError: false,
          name: data.name || `Yemek ${i + 1}`,
          description: data.description || "",
          ingredients: data.ingredients || [],
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fiber: data.fiber,
          sugar: data.sugar,
          sodium: data.sodium,
          servingSize: data.servingSize,
          allergens: data.allergens || [],
          isVegan: data.isVegan || false,
          isVegetarian: data.isVegetarian || false,
          isGlutenFree: data.isGlutenFree || false,
          isSpicy: data.isSpicy || false,
          category: data.category || "Ana Yemek",
          categoryId: categories?.[0]?.id || "",
          price: 0,
          isAnalyzed: true,
        });
      } catch (err) {
        console.error(`Analysis failed for image ${i}:`, err);
        // Add item with minimal data so user can fill in manually
        newItems.push({
          id: `item-${Date.now()}-${i}`,
          originalImage: uploadedImages[i].preview,
          useEnhanced: false,
          isEnhancing: false,
          enhanceError: false,
          name: "",
          description: "",
          ingredients: [],
          allergens: [],
          isVegan: false,
          isVegetarian: false,
          isGlutenFree: false,
          isSpicy: false,
          category: "Ana Yemek",
          categoryId: categories?.[0]?.id || "",
          price: 0,
          isAnalyzed: false,
        });
      }
    }

    setItems(newItems);
    setIsAnalyzing(false);
    setCurrentStep(3);

    const analyzed = newItems.filter((i) => i.isAnalyzed).length;
    if (analyzed === newItems.length) {
      toast.success(`${analyzed} yemek başarıyla analiz edildi!`);
    } else {
      toast.warning(
        `${analyzed}/${newItems.length} yemek analiz edildi. Analiz edilemeyenleri manuel doldurabilirsiniz.`
      );
    }
  };

  // --- IMAGE ENHANCEMENT ---

  const enhanceImage = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || !item.name) {
      toast.error("Lütfen önce yemek adını girin");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, isEnhancing: true, enhanceError: false } : i
      )
    );

    try {
      const response = await fetch("/api/ai/enhance-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: item.originalImage,
          mimeType: "image/jpeg",
          dishName: item.name,
          description: item.description,
        }),
      });

      if (!response.ok) throw new Error("Enhancement failed");

      const data = await response.json();

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                enhancedImage: data.enhancedImage,
                useEnhanced: true,
                isEnhancing: false,
              }
            : i
        )
      );

      toast.success(`"${item.name}" görseli iyileştirildi!`);
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, isEnhancing: false, enhanceError: true } : i
        )
      );
      toast.error("Görsel iyileştirme yapılamadı");
    }
  };

  // --- ITEM UPDATE ---

  const updateItem = (id: string, updates: Partial<WizardItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAllergen = (itemId: string, allergen: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.allergens || [];
        return {
          ...item,
          allergens: current.includes(allergen)
            ? current.filter((a) => a !== allergen)
            : [...current, allergen],
        };
      })
    );
  };

  // --- SAVE ALL ---

  const saveAll = async () => {
    const validItems = items.filter((i) => i.name && i.price > 0 && i.categoryId);

    if (validItems.length === 0) {
      toast.error("Lütfen en az bir ürünün adını, fiyatını ve kategorisini girin");
      return;
    }

    setIsSaving(true);
    setCurrentStep(4);

    let saved = 0;

    for (const item of validItems) {
      try {
        // First upload image to Cloudinary
        const imageToUse = item.useEnhanced && item.enhancedImage
          ? item.enhancedImage
          : item.originalImage;

        let imageUrl = imageToUse;

        // If it's a base64 image, upload to Cloudinary
        if (imageToUse.startsWith("data:")) {
          try {
            const blob = await fetch(imageToUse).then((r) => r.blob());
            const formData = new FormData();
            formData.append("file", blob, "food-image.jpg");
            formData.append("folder", "menu-items");

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              imageUrl = uploadData.url;
            }
          } catch {
            // Keep base64 as fallback
          }
        }

        const response = await fetch(`/api/restaurants/${restaurant?.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: item.categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            image: imageUrl,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
            sugar: item.sugar,
            sodium: item.sodium,
            servingSize: item.servingSize,
            ingredients: item.ingredients,
            allergens: item.allergens,
            isVegan: item.isVegan,
            isVegetarian: item.isVegetarian,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            nutritionVerified: false,
            isActive: true,
            isAvailable: true,
          }),
        });

        if (response.ok) saved++;
      } catch (err) {
        console.error(`Failed to save item ${item.name}:`, err);
      }
    }

    setIsSaving(false);

    if (saved > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`${saved} ürün başarıyla kaydedildi!`);
    } else {
      toast.error("Ürünler kaydedilemedi. Lütfen tekrar deneyin.");
      setCurrentStep(3);
    }
  };

  // --- RENDER ---

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Camera className="h-7 w-7 text-white" />
          </div>
          AI Menü Sihirbazı
        </h1>
        <p className="text-muted-foreground mt-1">
          Yemek fotoğraflarınızı yükleyin, AI her şeyi otomatik analiz etsin
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step.num < currentStep
                    ? "bg-green-500 text-white"
                    : step.num === currentStep
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.num < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  step.num === currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-all ${
                  step.num < currentStep ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* ===== STEP 1: Upload ===== */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Info Banner */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900 dark:text-purple-300">
                    Nasıl Çalışır?
                  </p>
                  <p className="text-purple-700 dark:text-purple-400 mt-1">
                    Yemeklerinizin fotoğraflarını yükleyin. Gemini AI her
                    fotoğraftan yemek adı, içindekiler, kalori, alerjen ve besin
                    değerlerini otomatik tespit edecek. Sonra fotoğrafları
                    profesyonel stüdyo kalitesine yükseltebilirsiniz.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("wizard-file-input")?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-12 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-16 h-16 mx-auto text-muted-foreground/50 group-hover:text-purple-500 transition-colors" />
              </motion.div>
              <p className="text-lg font-medium mt-4">
                Yemek fotoğraflarını sürükleyip bırakın
              </p>
              <p className="text-muted-foreground mt-1">veya tıklayarak seçin</p>
              <p className="text-xs text-muted-foreground mt-3">
                JPG, PNG, WEBP (max 10MB) - Birden fazla fotoğraf yükleyebilirsiniz
              </p>
              <input
                id="wizard-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Uploaded Previews */}
            {uploadedImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Yüklenen Fotoğraflar ({uploadedImages.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("wizard-file-input")?.click()
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Daha Ekle
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {uploadedImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden border aspect-square"
                    >
                      <img
                        src={img.preview}
                        alt={`Fotoğraf ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={analyzeAll}
                disabled={uploadedImages.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI ile Analiz Et ({uploadedImages.length} fotoğraf)
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: AI Processing ===== */}
        {currentStep === 2 && isAnalyzing && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">
              Gemini AI Analiz Ediyor...
            </h2>
            <p className="text-muted-foreground mb-8">
              {uploadedImages.length} fotoğraf işleniyor
            </p>

            <div className="w-full max-w-md space-y-4">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analyzeProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                %{analyzeProgress} tamamlandı
              </p>
            </div>

            <div className="mt-8 space-y-3 text-center">
              {[
                "Yemekler tanınıyor...",
                "İçindekiler tespit ediliyor...",
                "Besin değerleri hesaplanıyor...",
                "Alerjenler belirleniyor...",
              ].map((text, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: analyzeProgress > idx * 25 ? 1 : 0.3, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {analyzeProgress > (idx + 1) * 25 ? "✓" : "○"} {text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 3: Review & Edit ===== */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Disclaimer */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-300">
                    AI Tahmini - Son Kontrolü Siz Yapın
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">
                    Aşağıdaki değerler AI tarafından tahmin edilmiştir. Lütfen
                    tüm bilgileri kontrol edin ve gerektiğinde düzeltin.
                    Fiyatları kendiniz girmeniz gerekiyor.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            {items.map((item, index) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all ${
                  !item.isAnalyzed
                    ? "border-red-200 dark:border-red-800"
                    : "border-border"
                }`}
              >
                <CardContent className="p-0">
                  {/* Item Header - Always visible */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() =>
                      setExpandedItem(
                        expandedItem === item.id ? null : item.id
                      )
                    }
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border">
                      <img
                        src={
                          item.useEnhanced && item.enhancedImage
                            ? item.enhancedImage
                            : item.originalImage
                        }
                        alt={item.name || "Yemek"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Quick Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          #{index + 1}
                        </span>
                        {item.isAnalyzed ? (
                          <Badge
                            variant="outline"
                            className="text-purple-600 border-purple-200 text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Tahmini
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Analiz Edilemedi
                          </Badge>
                        )}
                        {item.enhancedImage && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200 text-xs"
                          >
                            HD
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-1 truncate">
                        {item.name || "İsimsiz Yemek"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {item.calories && <span>{item.calories} kcal</span>}
                        {item.allergens.length > 0 && (
                          <span>{item.allergens.length} alerjen</span>
                        )}
                        {item.ingredients.length > 0 && (
                          <span>{item.ingredients.length} malzeme</span>
                        )}
                      </div>
                    </div>

                    {/* Price & Category */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateItem(item.id, {
                            price: parseFloat(e.target.value) || 0,
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="₺ Fiyat"
                        className="w-24 text-right"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <ChevronRight
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          expandedItem === item.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {expandedItem === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t space-y-6">
                          {/* Image Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Orijinal Fotoğraf
                              </h4>
                              <div className="rounded-xl overflow-hidden border aspect-video">
                                <img
                                  src={item.originalImage}
                                  alt="Orijinal"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">
                                  AI İyileştirilmiş
                                </h4>
                                {item.enhancedImage && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      İyileştirilmiş kullan
                                    </span>
                                    <Switch
                                      checked={item.useEnhanced}
                                      onCheckedChange={(v) =>
                                        updateItem(item.id, { useEnhanced: v })
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="rounded-xl overflow-hidden border aspect-video bg-muted flex items-center justify-center">
                                {item.enhancedImage ? (
                                  <img
                                    src={item.enhancedImage}
                                    alt="İyileştirilmiş"
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.isEnhancing ? (
                                  <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
                                    <p className="text-sm text-muted-foreground mt-2">
                                      İyileştiriliyor...
                                    </p>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => enhanceImage(item.id)}
                                    className="text-purple-600 border-purple-200"
                                  >
                                    {item.enhanceError ? (
                                      <>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Tekrar Dene
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        HD&apos;ye Yükselt
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-1.5">
                                Yemek Adı
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-purple-600 border-purple-200"
                                >
                                  AI
                                </Badge>
                              </label>
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  updateItem(item.id, { name: e.target.value })
                                }
                                placeholder="Yemek adı"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Kategori
                              </label>
                              <Select
                                value={item.categoryId}
                                onValueChange={(v) =>
                                  updateItem(item.id, { categoryId: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(categories || []).map(
                                    (cat: { id: string; name: string }) => (
                                      <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                              Açıklama
                              <Badge
                                variant="outline"
                                className="text-[10px] text-purple-600 border-purple-200"
                              >
                                AI
                              </Badge>
                            </label>
                            <Textarea
                              value={item.description}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                              className="resize-none"
                            />
                          </div>

                          {/* Ingredients */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                              Malzemeler
                              <Badge
                                variant="outline"
                                className="text-[10px] text-purple-600 border-purple-200"
                              >
                                AI
                              </Badge>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {item.ingredients.map((ing, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-red-100"
                                  onClick={() =>
                                    updateItem(item.id, {
                                      ingredients: item.ingredients.filter(
                                        (_, idx) => idx !== i
                                      ),
                                    })
                                  }
                                >
                                  {ing}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              ))}
                              <Input
                                placeholder="+ Malzeme ekle"
                                className="w-36 h-7 text-xs"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    e.currentTarget.value.trim()
                                  ) {
                                    e.preventDefault();
                                    updateItem(item.id, {
                                      ingredients: [
                                        ...item.ingredients,
                                        e.currentTarget.value.trim(),
                                      ],
                                    });
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Nutrition */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                              Besin Değerleri (1 porsiyon)
                              <Badge
                                variant="outline"
                                className="text-[10px] text-purple-600 border-purple-200"
                              >
                                AI Tahmini
                              </Badge>
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                              {[
                                {
                                  key: "calories" as const,
                                  label: "Kalori",
                                  unit: "kcal",
                                },
                                {
                                  key: "protein" as const,
                                  label: "Protein",
                                  unit: "g",
                                },
                                {
                                  key: "carbs" as const,
                                  label: "Karb.",
                                  unit: "g",
                                },
                                {
                                  key: "fat" as const,
                                  label: "Yağ",
                                  unit: "g",
                                },
                                {
                                  key: "fiber" as const,
                                  label: "Lif",
                                  unit: "g",
                                },
                                {
                                  key: "sugar" as const,
                                  label: "Şeker",
                                  unit: "g",
                                },
                                {
                                  key: "sodium" as const,
                                  label: "Sodyum",
                                  unit: "mg",
                                },
                              ].map((n) => (
                                <div key={n.key} className="text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={item[n.key] || ""}
                                    onChange={(e) =>
                                      updateItem(item.id, {
                                        [n.key]:
                                          parseFloat(e.target.value) ||
                                          undefined,
                                      })
                                    }
                                    className="text-center text-xs h-8"
                                  />
                                  <span className="text-[10px] text-muted-foreground">
                                    {n.label} ({n.unit})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Allergens */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                              Alerjenler
                              <Badge
                                variant="outline"
                                className="text-[10px] text-purple-600 border-purple-200"
                              >
                                AI
                              </Badge>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {ALLERGENS.map((allergen) => {
                                const isSelected =
                                  item.allergens.includes(allergen);
                                return (
                                  <button
                                    key={allergen}
                                    type="button"
                                    onClick={() =>
                                      toggleAllergen(item.id, allergen)
                                    }
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                                      isSelected
                                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                        : "border-muted hover:border-muted-foreground/30"
                                    }`}
                                  >
                                    <span>
                                      {ALLERGEN_ICONS[allergen] || "⚠️"}
                                    </span>
                                    {allergen}
                                    {isSelected && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Feature Toggles */}
                          <div className="flex flex-wrap gap-3">
                            {[
                              {
                                key: "isVegan" as const,
                                label: "Vegan",
                                emoji: "🌱",
                              },
                              {
                                key: "isVegetarian" as const,
                                label: "Vejetaryen",
                                emoji: "🥗",
                              },
                              {
                                key: "isGlutenFree" as const,
                                label: "Glutensiz",
                                emoji: "🌾",
                              },
                              {
                                key: "isSpicy" as const,
                                label: "Acılı",
                                emoji: "🌶️",
                              },
                            ].map((feat) => (
                              <label
                                key={feat.key}
                                className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
                              >
                                <Switch
                                  checked={item[feat.key]}
                                  onCheckedChange={(v) =>
                                    updateItem(item.id, { [feat.key]: v })
                                  }
                                />
                                <span className="text-sm">
                                  {feat.emoji} {feat.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setItems([]);
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{items.length} ürün</span>
                <span>|</span>
                <span>
                  {items.filter((i) => i.price > 0).length} fiyatlandırılmış
                </span>
              </div>

              <Button
                size="lg"
                onClick={saveAll}
                disabled={items.filter((i) => i.name && i.price > 0 && i.categoryId).length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                Kaydet (
                {items.filter((i) => i.name && i.price > 0 && i.categoryId).length}{" "}
                ürün)
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 4: Success ===== */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
                <h2 className="text-2xl font-bold">Ürünler Kaydediliyor...</h2>
                <p className="text-muted-foreground mt-2">
                  Görseller yükleniyor ve menü oluşturuluyor
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>

                <h2 className="text-3xl font-bold">Menünüz Hazır!</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Tüm ürünler başarıyla kaydedildi
                </p>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/dashboard/menu/items")}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Menüyü Görüntüle
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => router.push("/dashboard/menu/print")}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <FileDown className="w-5 h-5 mr-2" />
                    PDF Menü Oluştur
                  </Button>
                </div>

                <Button
                  variant="link"
                  className="mt-4"
                  onClick={() => {
                    setCurrentStep(1);
                    setItems([]);
                    setUploadedImages([]);
                  }}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Daha Fazla Yemek Ekle
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
