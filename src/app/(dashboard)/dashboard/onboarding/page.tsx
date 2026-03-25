"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Upload,
  Palette,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRestaurant } from "@/hooks/useRestaurant";
import { toast } from "sonner";
import Image from "next/image";
import confetti from "canvas-confetti";

const STEPS = [
  { id: "welcome", label: "Hoş Geldin", icon: Sparkles },
  { id: "info", label: "Bilgiler", icon: Store },
  { id: "logo", label: "Logo", icon: Camera },
  { id: "theme", label: "Tema", icon: Palette },
  { id: "done", label: "Hazır", icon: CheckCircle2 },
];

const THEME_PRESETS = [
  { name: "Mor Zarafet", primary: "#8b5cf6", secondary: "#f5f3ff", accent: "#c4b5fd" },
  { name: "Okyanus", primary: "#0ea5e9", secondary: "#f0f9ff", accent: "#7dd3fc" },
  { name: "Zümrüt", primary: "#10b981", secondary: "#ecfdf5", accent: "#6ee7b7" },
  { name: "Gül", primary: "#f43f5e", secondary: "#fff1f2", accent: "#fda4af" },
  { name: "Turuncu", primary: "#f97316", secondary: "#fff7ed", accent: "#fdba74" },
  { name: "Koyu", primary: "#1e293b", secondary: "#f8fafc", accent: "#64748b" },
];

interface FormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  website: string;
  logo: string | null;
  logoFile: File | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createRestaurant = useCreateRestaurant();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    website: "",
    logo: null,
    logoFile: null,
    primaryColor: "#8b5cf6",
    secondaryColor: "#f5f3ff",
    accentColor: "#c4b5fd",
  });

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error("Restoran adı zorunludur");
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalı");
        return;
      }

      updateField("logoFile", file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        updateField("logo", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const uploadLogo = async (): Promise<string | undefined> => {
    if (!formData.logoFile) return undefined;

    const fd = new FormData();
    fd.append("file", formData.logoFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) return undefined;
    const data = await res.json();
    return data.url;
  };

  const handleComplete = async () => {
    setIsUploading(true);
    try {
      let logoUrl: string | undefined;
      if (formData.logoFile) {
        logoUrl = await uploadLogo();
      }

      await createRestaurant.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        logo: logoUrl,
      });

      setDirection(1);
      setCurrentStep(STEPS.length - 1);

      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f43f5e", "#f97316"],
        });
      }, 300);
    } catch {
      toast.error("Restoran oluşturulurken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: (d: number) => ({
      x: d < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="welcome"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-8 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/25"
            >
              <ChefHat className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold tracking-tight"
              >
                Hoş geldin,{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] || ""}
                </span>
                !
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-md mx-auto"
              >
                Restoranınızı dijitale taşıyalım. Birlikte müthiş bir dijital
                menü deneyimi oluşturalım.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                "AI ile menü oluştur",
                "QR kod ile paylaşım",
                "Sipariş takibi",
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="info"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Restoran Bilgileri</h2>
              <p className="text-muted-foreground mt-1">
                Temel bilgilerinizi girin
              </p>
            </div>

            <div className="grid gap-5 max-w-lg mx-auto">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  Restoran Adı *
                </Label>
                <Input
                  id="name"
                  placeholder="Örneğin: Lezzet Durağı"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Restoranınızı kısa bir cümleyle tanıtın..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    placeholder="0532 XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@restoran.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Adres
                </Label>
                <Input
                  id="address"
                  placeholder="Cadde, sokak, numara..."
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Web Sitesi
                </Label>
                <Input
                  id="website"
                  placeholder="https://www.restoran.com"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="logo"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Restoran Logosu</h2>
              <p className="text-muted-foreground mt-1">
                Logonuzu yükleyin veya sonra ekleyin
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <label
                htmlFor="logo-upload"
                className="group cursor-pointer block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-48 h-48 mx-auto rounded-3xl border-2 border-dashed border-border hover:border-primary/50 transition-all overflow-hidden bg-muted/30"
                >
                  {formData.logo ? (
                    <>
                      <Image
                        src={formData.logo}
                        alt="Logo önizleme"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Logo Yükle</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG - Maks. 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {formData.logo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateField("logo", null);
                      updateField("logoFile", null);
                    }}
                    className="text-destructive"
                  >
                    Logoyu Kaldır
                  </Button>
                </motion.div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Logo yüklemek zorunlu değil. Daha sonra ayarlardan ekleyebilirsiniz.
              </p>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="theme"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Tema Seçimi</h2>
              <p className="text-muted-foreground mt-1">
                Menünüz için bir renk seçin
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              {THEME_PRESETS.map((preset) => {
                const isSelected = formData.primaryColor === preset.primary;
                return (
                  <motion.button
                    key={preset.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      updateField("primaryColor", preset.primary);
                      updateField("secondaryColor", preset.secondary);
                      updateField("accentColor", preset.accent);
                    }}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="theme-check"
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <p className="text-sm font-medium">{preset.name}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Canlı Önizleme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-sm mx-auto mt-8"
            >
              <p className="text-xs text-muted-foreground text-center mb-3">
                Önizleme
              </p>
              <div
                className="rounded-2xl border overflow-hidden shadow-lg"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                <div
                  className="h-14 flex items-center px-4"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  <span className="text-white font-semibold text-sm">
                    {formData.name || "Restoran Adı"}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl"
                      style={{
                        backgroundColor: formData.accentColor,
                        opacity: 0.3,
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-foreground/10 rounded w-3/4" />
                      <div className="h-2 bg-foreground/5 rounded w-1/2" />
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: formData.primaryColor }}
                    >
                      49 TL
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl"
                      style={{
                        backgroundColor: formData.accentColor,
                        opacity: 0.3,
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-foreground/10 rounded w-2/3" />
                      <div className="h-2 bg-foreground/5 rounded w-2/5" />
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: formData.primaryColor }}
                    >
                      35 TL
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="done"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-8 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/25"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold tracking-tight"
              >
                Harika, hazırsın!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-md mx-auto"
              >
                <span className="font-semibold text-foreground">
                  {formData.name}
                </span>{" "}
                başarıyla oluşturuldu. Şimdi menünüzü oluşturmaya başlayabilirsiniz.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => router.push("/dashboard/menu/ai-create")}
                className="gap-2 min-w-[200px]"
              >
                <Sparkles className="w-5 h-5" />
                AI ile Menü Oluştur
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="gap-2 min-w-[200px]"
              >
                Panele Git
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* İlerleme Çubuğu */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          {/* Adım göstergeleri */}
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isCompleted = i < currentStep;
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted
                        ? "hsl(var(--primary))"
                        : isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-2 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* İlerleme çubuğu */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Alt Navigasyon */}
      {currentStep < STEPS.length - 1 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t">
          <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>

            {currentStep < STEPS.length - 2 ? (
              <Button onClick={nextStep} className="gap-2">
                Devam Et
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isUploading || !formData.name.trim()}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    Restoranı Oluştur
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
