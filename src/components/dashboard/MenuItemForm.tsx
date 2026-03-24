"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  prepTime: z.coerce.number().optional(),
  allergens: z.string().optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );

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
      prepTime: initialData?.prepTime || undefined,
      allergens: initialData?.allergens || "",
      tags: initialData?.tags || "",
      isActive: initialData?.isActive ?? true,
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

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
        throw new Error("Failed to save menu item");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(
        initialData?.id ? "Ürün güncellendi" : "Ürün başarıyla eklendi"
      );
      onSuccess();
    },
    onError: () => {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    mutation.mutate(data);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>

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
          <h3 className="text-lg font-semibold text-gray-900">Görsel</h3>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ürün Görseli</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue("image", "");
                            }}
                          >
                            Görseli Kaldır
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
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
                          <p className="text-xs text-gray-500">
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

        {/* Özellikler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Özellikler</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isVegan"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Vegan</FormLabel>
                    <FormDescription>Bu ürün vegan mı?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVegetarian"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Vejetaryen</FormLabel>
                    <FormDescription>Bu ürün vejetaryen mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isGlutenFree"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Glutensiz</FormLabel>
                    <FormDescription>Gluten içermiyor mu?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSpicy"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Acılı</FormLabel>
                    <FormDescription>Bu ürün acılı mı?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Popüler</FormLabel>
                    <FormDescription>Popüler ürün olarak işaretle</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isNew"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Yeni</FormLabel>
                    <FormDescription>Yeni ürün olarak işaretle</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isChefRecommended"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <FormLabel>Şef Önerisi</FormLabel>
                    <FormDescription>Şef önerisi olarak işaretle</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Detaylar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Detaylar</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kalori</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Örn: 450" {...field} />
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
                    <Input type="number" min="0" placeholder="Örn: 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="allergens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alerjenler</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Örn: Fıstık, Süt ürünleri, Gluten"
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

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etiketler</FormLabel>
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
          <h3 className="text-lg font-semibold text-gray-900">Durum</h3>

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
