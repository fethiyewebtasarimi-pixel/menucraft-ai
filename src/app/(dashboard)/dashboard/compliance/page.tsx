'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  Apple,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRestaurants } from '@/hooks/useRestaurant';
import { useMenuItems } from '@/hooks/useMenu';
import { toast } from 'sonner';

interface ComplianceItem {
  id: string;
  name: string;
  hasAllergens: boolean;
  hasCalories: boolean;
  hasNutrition: boolean;
  hasIngredients: boolean;
  allergenCount: number;
  verified: boolean;
}

export default function CompliancePage() {
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const { data: menuItems, isLoading } = useMenuItems(restaurant?.id);
  const [aiFixing, setAiFixing] = useState<string | null>(null);

  const items: ComplianceItem[] = (menuItems || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    hasAllergens: item.allergens && item.allergens.length > 0,
    hasCalories: !!item.calories,
    hasNutrition: !!(item.protein || item.carbs || item.fat),
    hasIngredients: item.ingredients && item.ingredients.length > 0,
    allergenCount: item.allergens?.length || 0,
    verified: item.nutritionVerified || false,
  }));

  const totalItems = items.length;
  const withAllergens = items.filter((i) => i.hasAllergens).length;
  const withCalories = items.filter((i) => i.hasCalories).length;
  const withNutrition = items.filter((i) => i.hasNutrition).length;
  const withIngredients = items.filter((i) => i.hasIngredients).length;
  const verified = items.filter((i) => i.verified).length;

  const allergenPercent = totalItems > 0 ? Math.round((withAllergens / totalItems) * 100) : 0;
  const caloriePercent = totalItems > 0 ? Math.round((withCalories / totalItems) * 100) : 0;
  const nutritionPercent = totalItems > 0 ? Math.round((withNutrition / totalItems) * 100) : 0;
  const ingredientPercent = totalItems > 0 ? Math.round((withIngredients / totalItems) * 100) : 0;
  const overallPercent = totalItems > 0
    ? Math.round(((withAllergens + withCalories + withNutrition + withIngredients) / (totalItems * 4)) * 100)
    : 0;

  const missingAllergens = items.filter((i) => !i.hasAllergens);
  const missingCalories = items.filter((i) => !i.hasCalories);
  const missingNutrition = items.filter((i) => !i.hasNutrition);

  const handleAiFix = async (itemId: string, itemName: string) => {
    setAiFixing(itemId);
    try {
      const response = await fetch('/api/ai/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: itemName, ingredients: [] }),
      });

      if (!response.ok) throw new Error('AI analiz başarısız');

      const data = await response.json();

      // Update the item with AI results
      const updateRes = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fiber: data.fiber,
          sugar: data.sugar,
          sodium: data.sodium,
          servingSize: data.servingSize,
          allergens: data.allergens || [],
        }),
      });

      if (!updateRes.ok) throw new Error('Güncelleme başarısız');

      toast.success(`${itemName} için besin değerleri güncellendi`);
      // Refresh the page data
      window.location.reload();
    } catch {
      toast.error('AI analizi yapılamadı');
    } finally {
      setAiFixing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-amber-600" />
          Alerjen & Besin Uyumluluk
        </h1>
        <p className="text-muted-foreground mt-1">
          Menünüzün yasal alerjen ve besin değeri gereksinimlerine uyumluluğunu kontrol edin
        </p>
      </div>

      {/* Overall Score */}
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300">
                Genel Uyumluluk Skoru
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                {totalItems} üründen {withAllergens} tanesinde alerjen, {withCalories} tanesinde kalori bilgisi var
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${
                overallPercent >= 80 ? 'text-green-600' :
                overallPercent >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                %{overallPercent}
              </div>
              <Badge className={
                overallPercent >= 80 ? 'bg-green-100 text-green-800' :
                overallPercent >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }>
                {overallPercent >= 80 ? 'İyi Durumda' :
                 overallPercent >= 50 ? 'Geliştirilebilir' : 'Acil Düzenleme Gerekli'}
              </Badge>
            </div>
          </div>
          <Progress value={overallPercent} className="h-3 mt-4" />
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Alerjen Bilgisi', percent: allergenPercent, count: withAllergens, icon: AlertTriangle, color: 'text-yellow-600' },
          { label: 'Kalori Bilgisi', percent: caloriePercent, count: withCalories, icon: Zap, color: 'text-orange-600' },
          { label: 'Besin Değerleri', percent: nutritionPercent, count: withNutrition, icon: Apple, color: 'text-green-600' },
          { label: 'Malzeme Listesi', percent: ingredientPercent, count: withIngredients, icon: FileText, color: 'text-blue-600' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-medium text-sm">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold">%{stat.percent}</span>
                  <span className="text-sm text-muted-foreground">{stat.count}/{totalItems}</span>
                </div>
                <Progress value={stat.percent} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Missing Items List */}
      {missingAllergens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Alerjen Bilgisi Eksik ({missingAllergens.length} ürün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingAllergens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiFix(item.id, item.name)}
                      disabled={aiFixing === item.id}
                      className="text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      {aiFixing === item.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      AI ile Tamamla
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/dashboard/menu/items?edit=${item.id}`}>
                        Düzenle <ChevronRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {missingCalories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Zap className="h-5 w-5" />
              Kalori Bilgisi Eksik ({missingCalories.length} ürün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingCalories.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiFix(item.id, item.name)}
                      disabled={aiFixing === item.id}
                      className="text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      {aiFixing === item.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      AI ile Tamamla
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/dashboard/menu/items?edit=${item.id}`}>
                        Düzenle <ChevronRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
              {missingCalories.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ve {missingCalories.length - 10} ürün daha...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Good */}
      {totalItems > 0 && missingAllergens.length === 0 && missingCalories.length === 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
              Tebrikler! Menünüz Yasal Gereksinimlere Uyumlu
            </h3>
            <p className="text-green-700 dark:text-green-400 mt-2">
              Tüm ürünlerinizde alerjen ve kalori bilgileri eklenmiş durumda.
            </p>
          </CardContent>
        </Card>
      )}

      {totalItems === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Henüz menüde ürün bulunmuyor. Ürün ekledikten sonra uyumluluk kontrolü yapabilirsiniz.
          </CardContent>
        </Card>
      )}

      {/* Compliance Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yasal Gereksinimler Hakkında</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Türkiye'de yürürlüğe giren yönetmeliğe göre tüm gıda işletmeleri menülerinde
            alerjen bilgilerini ve besin değerlerini belirtmek zorundadır.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-accent/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">14 Temel Alerjen</h4>
              <p>Gluten, süt ürünleri, yumurta, fıstık, kabuklu deniz ürünleri, balık, soya, kereviz, hardal, susam, kükürt dioksit, lupin, yumuşakçalar, kuruyemiş</p>
            </div>
            <div className="p-3 bg-accent/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">Besin Değerleri</h4>
              <p>Enerji (kcal), protein, karbonhidrat, yağ, lif, şeker ve sodyum bilgileri porsiyon başına belirtilmelidir.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
