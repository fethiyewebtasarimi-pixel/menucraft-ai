"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Loader2,
  Sparkles,
  AlertTriangle,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Candy,
  Apple,
  FlaskConical,
  ChefHat,
  X,
  Plus,
  Camera,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ALLERGENS } from "@/constants";

const ALLERGEN_ICONS: Record<string, string> = {
  "Gluten": "🌾",
  "Süt Ürünleri": "🥛",
  "Yumurta": "🥚",
  "Fıstık": "🥜",
  "Kabuklu Deniz Ürünleri": "🦐",
  "Balık": "🐟",
  "Soya": "🫘",
  "Kereviz": "🥬",
  "Hardal": "🟡",
  "Susam": "🟤",
  "Kükürt Dioksit": "🍷",
  "Lupin": "🌱",
  "Yumuşakçalar": "🐚",
  "Kuruyemiş": "🌰",
};

const menuItemSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori seçimi zorunludur"),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  discountPrice: z.coerce.number().optional(),
  image: z.string().optional(),
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isChefRecommended: z.boolean().default(false),
  calories: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  carbs: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  fiber: z.coerce.number().optional(),
  sugar: z.coerce.number().optional(),
  sodium: z.coerce.number().optional(),
  servingSize: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  nutritionVerified: z.boolean().default(false),
  prepTime: z.coerce.number().optional(),
  allergens: z.array(z.string()).default([]),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  initialData?: Partial<MenuItemFormData> & { id?: string };
  restaurantId: string;
  categories: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

export function MenuItemForm({
  initialData,
  restaurantId,
  categories,
  onSuccess,
}: MenuItemFormProps) {
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [ingredientInput, setIngredientInput] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  // Parse initial allergens - handle both string and array
  const parseAllergens = (val: unknown): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val) return val.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  };

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      price: initialData?.price || 0,
      discountPrice: initialData?.discountPrice || undefined,
      image: initialData?.image || "",
      isVegan: initialData?.isVegan || false,
      isVegetarian: initialData?.isVegetarian || false,
      isGlutenFree: initialData?.isGlutenFree || false,
      isSpicy: initialData?.isSpicy || false,
      isPopular: initialData?.isPopular || false,
      isNew: initialData?.isNew || false,
      isChefRecommended: initialData?.isChefRecommended || false,
      calories: initialData?.calories || undefined,
      protein: (initialData as any)?.protein || undefined,
      carbs: (initialData as any)?.carbs || undefined,
      fat: (initialData as any)?.fat || undefined,
      fiber: (initialData as any)?.fiber || undefined,
      sugar: (initialData as any)?.sugar || undefined,
      sodium: (initialData as any)?.sodium || undefined,
      servingSize: (initialData as any)?.servingSize || "",
      ingredients: (initialData as any)?.ingredients || [],
      nutritionVerified: (initialData as any)?.nutritionVerified || false,
      prepTime: initialData?.prepTime || undefined,
      allergens: parseAllergens(initialData?.allergens),
      tags: initialData?.tags || "",
      isActive: initialData?.isActive ?? true,
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  const selectedAllergens = form.watch("allergens") || [];
  const ingredients = form.watch("ingredients") || [];

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Kategori eklenemedi");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
      toast.success("Kategori eklendi");
      setNewCategoryName("");
      setShowCategoryInput(false);
      // Auto-select the new category
      form.setValue("categoryId", data.id);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    addCategoryMutation.mutate(name);
  };

  const mutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const url = initialData?.id
        ? `/api/items/${initialData.id}`
        : `/api/restaurants/${restaurantId}/items`;
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Menü öğesi kaydedilemedi");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(
        initialData?.id ? "Ürün güncellendi" : "Ürün başarıyla eklendi"
      );
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    // Clean up: convert 0 values to undefined for optional number fields
    // and ensure tags is an array
    const cleanData = {
      ...data,
      discountPrice: data.discountPrice || undefined,
      calories: data.calories || undefined,
      protein: data.protein || undefined,
      carbs: data.carbs || undefined,
      fat: data.fat || undefined,
      fiber: data.fiber || undefined,
      sugar: data.sugar || undefined,
      sodium: data.sodium || undefined,
      prepTime: data.prepTime || undefined,
      image: data.image || undefined,
      description: data.description || undefined,
      servingSize: data.servingSize || undefined,
      tags: typeof data.tags === "string"
        ? (data.tags as string).split(",").map(s => s.trim()).filter(Boolean)
        : (data.tags || []),
    };
    mutation.mutate(cleanData as unknown as MenuItemFormData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAllergen = (allergen: string) => {
    const current = form.getValues("allergens") || [];
    if (current.includes(allergen)) {
      form.setValue("allergens", current.filter((a) => a !== allergen));
    } else {
      form.setValue("allergens", [...current, allergen]);
    }
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;
    const current = form.getValues("ingredients") || [];
    if (!current.includes(trimmed)) {
      form.setValue("ingredients", [...current, trimmed]);
    }
    setIngredientInput("");
  };

  const removeIngredient = (ingredient: string) => {
    const current = form.getValues("ingredients") || [];
    form.setValue("ingredients", current.filter((i) => i !== ingredient));
  };

  const handleAiAnalysis = async () => {
    const currentIngredients = form.getValues("ingredients") || [];
    const name = form.getValues("name");

    if (currentIngredients.length === 0 && !name) {
      toast.error("Lütfen önce malzeme veya ürün adı girin");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: form.getValues("description"),
          ingredients: currentIngredients,
        }),
      });

      if (!response.ok) throw new Error("AI analiz başarısız");

      const data = await response.json();

      if (data.calories) form.setValue("calories", data.calories);
      if (data.protein) form.setValue("protein", data.protein);
      if (data.carbs) form.setValue("carbs", data.carbs);
      if (data.fat) form.setValue("fat", data.fat);
      if (data.fiber) form.setValue("fiber", data.fiber);
      if (data.sugar) form.setValue("sugar", data.sugar);
      if (data.sodium) form.setValue("sodium", data.sodium);
      if (data.servingSize) form.setValue("servingSize", data.servingSize);
      if (data.allergens?.length > 0) {
        const currentAllergens = form.getValues("allergens") || [];
        const merged = Array.from(new Set([...currentAllergens, ...data.allergens]));
        form.setValue("allergens", merged);
      }

      toast.success("AI analizi tamamlandı! Değerleri kontrol edin.");
    } catch {
      toast.error("AI analizi yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVisionAnalysis = async () => {
    const currentImage = form.getValues("image");
    if (!currentImage) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setVisionLoading(true);
    try {
      const response = await fetch("/api/ai/vision-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: currentImage,
          mimeType: "image/jpeg",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analiz başarısız");
      }

      const data = await response.json();

      if (data.name && !form.getValues("name")) form.setValue("name", data.name);
      if (data.description && !form.getValues("description")) form.setValue("description", data.description);
      if (data.calories) form.setValue("calories", data.calories);
      if (data.protein) form.setValue("protein", data.protein);
      if (data.carbs) form.setValue("carbs", data.carbs);
      if (data.fat) form.setValue("fat", data.fat);
      if (data.fiber) form.setValue("fiber", data.fiber);
      if (data.sugar) form.setValue("sugar", data.sugar);
      if (data.sodium) form.setValue("sodium", data.sodium);
      if (data.servingSize) form.setValue("servingSize", data.servingSize);
      if (data.ingredients?.length > 0) {
        const current = form.getValues("ingredients") || [];
        const merged = Array.from(new Set([...current, ...data.ingredients]));
        form.setValue("ingredients", merged);
      }
      if (data.allergens?.length > 0) {
        const current = form.getValues("allergens") || [];
        const merged = Array.from(new Set([...current, ...data.allergens]));
        form.setValue("allergens", merged);
      }
      if (data.isVegan) form.setValue("isVegan", true);
      if (data.isVegetarian) form.setValue("isVegetarian", true);
      if (data.isGlutenFree) form.setValue("isGlutenFree", true);
      if (data.isSpicy) form.setValue("isSpicy", true);

      toast.success("Fotoğraf analiz edildi! Tüm değerleri kontrol edin - bunlar AI tahminidir.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fotoğraf analizi yapılamadı");
    } finally {
      setVisionLoading(false);
    }
  };

  const handleEnhanceImage = async () => {
    const currentImage = form.getValues("image");
    const currentName = form.getValues("name");
    if (!currentImage) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }
    if (!currentName) {
      toast.error("Lütfen önce yemek adını girin");
      return;
    }

    setEnhanceLoading(true);
    try {
      const response = await fetch("/api/ai/enhance-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: currentImage,
          mimeType: "image/jpeg",
          dishName: currentName,
          description: form.getValues("description"),
        }),
      });

      if (!response.ok) throw new Error("İyileştirme başarısız");

      const data = await response.json();
      setImagePreview(data.enhancedImage);
      form.setValue("image", data.enhancedImage);
      toast.success("Fotoğraf HD kaliteye yükseltildi!");
    } catch {
      toast.error("Fotoğraf iyileştirme yapılamadı");
    } finally {
      setEnhanceLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Temel Bilgiler</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ürün Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: Margherita Pizza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ürün açıklaması..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  {showCategoryInput ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Kategori adı..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                        className="shrink-0"
                      >
                        {addCategoryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => { setShowCategoryInput(false); setNewCategoryName(""); }}
                        className="shrink-0 px-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowCategoryInput(true)}
                        title="Yeni kategori ekle"
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiyat (₺) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İndirimli Fiyat (₺)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  İndirim varsa indirimli fiyatı girin
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Görsel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Görsel</h3>

          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Ürün Görseli</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Önizleme"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleVisionAnalysis}
                              disabled={visionLoading}
                              className="text-purple-700 border-purple-200 hover:bg-purple-50"
                            >
                              {visionLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4 mr-2" />
                              )}
                              Fotoğraftan AI Analiz
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleEnhanceImage}
                              disabled={enhanceLoading}
                              className="text-pink-700 border-pink-200 hover:bg-pink-50"
                            >
                              {enhanceLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4 mr-2" />
                              )}
                              HD&apos;ye Yükselt
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImagePreview(null);
                                form.setValue("image", "");
                              }}
                            >
                              Görseli Kaldır
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground/70" />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Görseli sürükleyip bırakın
                            </p>
                            <label htmlFor="image-upload">
                              <Button type="button" variant="outline" asChild>
                                <span>veya dosya seçin</span>
                              </Button>
                            </label>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP (max. 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Malzemeler */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Malzemeler
              </h3>
              <p className="text-sm text-muted-foreground">Ürünün içindeki malzemeleri ekleyin</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiAnalysis}
              disabled={aiLoading}
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI ile Analiz Et
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Malzeme adı yazın (Örn: un, yumurta, süt...)"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIngredient();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addIngredient}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => removeIngredient(ingredient)}
                >
                  {ingredient}
                  <X className="h-3 w-3 ml-2" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Alerjenler */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alerjen Bilgileri
              <Badge variant="destructive" className="text-xs ml-2">Yasal Zorunluluk</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Yemekte bulunan alerjenleri seçin. Bu bilgi müşterilere menüde gösterilir.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {ALLERGENS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen);
              const icon = ALLERGEN_ICONS[allergen] || "⚠️";
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm"
                      : "border-border dark:border-border hover:border-border dark:hover:border-border"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <span className={`font-medium ${isSelected ? "text-yellow-900 dark:text-yellow-300" : "text-foreground/80 dark:text-foreground/80"}`}>
                    {allergen}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-yellow-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedAllergens.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>{selectedAllergens.length}</strong> alerjen seçildi: {selectedAllergens.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Besin Değerleri */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
                <Apple className="h-5 w-5 text-green-600" />
                Besin Değerleri
                <Badge variant="destructive" className="text-xs ml-2">Yasal Zorunluluk</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                1 porsiyon için besin değerlerini girin
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="servingSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porsiyon Bilgisi</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: 1 porsiyon (250g)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-primary" />
                    Kalori (kcal)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Beef className="h-4 w-4 text-red-500" />
                    Protein (g)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Wheat className="h-4 w-4 text-primary" />
                    Karbonhidrat (g)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-yellow-500" />
                    Yağ (g)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fiber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Apple className="h-4 w-4 text-green-500" />
                    Lif (g)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sugar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Candy className="h-4 w-4 text-pink-500" />
                    Şeker (g)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sodium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-blue-500" />
                    Sodyum (mg)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hazırlık Süresi (dk)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nutritionVerified"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10">
                <div>
                  <FormLabel className="text-green-800 dark:text-green-300">Besin Değerleri Onaylandı</FormLabel>
                  <FormDescription>
                    Değerler laboratuvar/uzman tarafından doğrulandıysa işaretleyin
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Özellikler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Özellikler & Etiketler</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "isVegan" as const, label: "Vegan", emoji: "🌱" },
              { name: "isVegetarian" as const, label: "Vejetaryen", emoji: "🥗" },
              { name: "isGlutenFree" as const, label: "Glutensiz", emoji: "🌾" },
              { name: "isSpicy" as const, label: "Acılı", emoji: "🌶️" },
              { name: "isPopular" as const, label: "Popüler", emoji: "⭐" },
              { name: "isNew" as const, label: "Yeni", emoji: "✨" },
              { name: "isChefRecommended" as const, label: "Şef Önerisi", emoji: "👨‍🍳" },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                      <span>{item.emoji}</span>
                      {item.label}
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ek Etiketler</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Örn: İtalyan, Pizza, Favoriler"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Virgülle ayırarak giriniz
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Durum */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Durum</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>Ürün menüde gösterilsin mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Stokta Var</FormLabel>
                    <FormDescription>Ürün sipariş alınabilir mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData?.id ? "Güncelle" : "Ekle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
