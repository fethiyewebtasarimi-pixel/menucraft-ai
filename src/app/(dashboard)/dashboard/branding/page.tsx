'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Save,
  Eye,
  Grid3x3,
  List,
  Columns,
  Newspaper,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const brandingSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  menuLayout: z.enum(['GRID', 'LIST', 'COMPACT', 'MAGAZINE']),
  headerStyle: z.enum(['MODERN', 'CLASSIC', 'MINIMAL', 'HERO']),
  showLogo: z.boolean(),
  showCoverImage: z.boolean(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

const menuLayouts = [
  {
    value: 'GRID',
    label: 'Grid',
    description: 'Kartlar halinde düzenlenmiş görünüm',
    icon: Grid3x3,
  },
  {
    value: 'LIST',
    label: 'Liste',
    description: 'Dikey liste görünümü',
    icon: List,
  },
  {
    value: 'COMPACT',
    label: 'Kompakt',
    description: 'Sıkıştırılmış liste görünümü',
    icon: Columns,
  },
  {
    value: 'MAGAZINE',
    label: 'Dergi',
    description: 'Görsel ağırlıklı magazin stili',
    icon: Newspaper,
  },
];

const headerStyles = [
  {
    value: 'MODERN',
    label: 'Modern',
    description: 'Temiz ve minimal başlık',
  },
  {
    value: 'CLASSIC',
    label: 'Klasik',
    description: 'Geleneksel restoran tarzı',
  },
  {
    value: 'MINIMAL',
    label: 'Minimal',
    description: 'Sadece gerekli bilgiler',
  },
  {
    value: 'HERO',
    label: 'Hero',
    description: 'Büyük görsel arka plan',
  },
];

const fontOptions = [
  { value: 'inter', label: 'Inter (Modern)' },
  { value: 'roboto', label: 'Roboto (Temiz)' },
  { value: 'playfair', label: 'Playfair Display (Şık)' },
  { value: 'merriweather', label: 'Merriweather (Klasik)' },
  { value: 'montserrat', label: 'Montserrat (Cesur)' },
];

export default function BrandingPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: '#f59e0b',
      secondaryColor: '#ea580c',
      accentColor: '#eab308',
      fontFamily: 'inter',
      menuLayout: 'GRID',
      headerStyle: 'MODERN',
      showLogo: true,
      showCoverImage: true,
    },
  });

  const watchedValues = form.watch();

  const onSubmit = async (data: BrandingFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Marka ayarları kaydedildi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marka & Tasarım</h1>
        <p className="text-muted-foreground">
          Menünüzün görünümünü ve markalaşmasını özelleştirin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Renkler
              </CardTitle>
              <CardDescription>
                Menünüzün renk paletini belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Ana Renk</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      {...form.register('primaryColor')}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={watchedValues.primaryColor}
                      onChange={(e) =>
                        form.setValue('primaryColor', e.target.value)
                      }
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">İkincil Renk</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      {...form.register('secondaryColor')}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={watchedValues.secondaryColor}
                      onChange={(e) =>
                        form.setValue('secondaryColor', e.target.value)
                      }
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Vurgu Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      {...form.register('accentColor')}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={watchedValues.accentColor}
                      onChange={(e) =>
                        form.setValue('accentColor', e.target.value)
                      }
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Tipografi
              </CardTitle>
              <CardDescription>
                Menünüzde kullanılacak yazı tipini seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Yazı Tipi</Label>
                <Select
                  value={watchedValues.fontFamily}
                  onValueChange={(value) => form.setValue('fontFamily', value)}
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Menu Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Menü Düzeni
              </CardTitle>
              <CardDescription>
                Menü öğelerinin nasıl görüneceğini seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {menuLayouts.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = watchedValues.menuLayout === layout.value;
                  return (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() =>
                        form.setValue('menuLayout', layout.value as any)
                      }
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg p-2 mt-0.5',
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-accent text-muted-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={cn(
                            'font-semibold mb-1',
                            isSelected && 'text-primary'
                          )}
                        >
                          {layout.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {layout.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Header Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Başlık Stili
              </CardTitle>
              <CardDescription>
                Menü başlığının stilini belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {headerStyles.map((style) => {
                  const isSelected = watchedValues.headerStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        form.setValue('headerStyle', style.value as any)
                      }
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                    >
                      <h4
                        className={cn(
                          'font-semibold mb-1',
                          isSelected && 'text-primary'
                        )}
                      >
                        {style.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {style.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Görünüm Seçenekleri
              </CardTitle>
              <CardDescription>
                Menüde gösterilecek öğeleri seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <Label htmlFor="showLogo" className="font-medium">
                    Logo Göster
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Menü başında restoran logosunu göster
                  </p>
                </div>
                <Switch
                  id="showLogo"
                  checked={watchedValues.showLogo}
                  onCheckedChange={(checked) =>
                    form.setValue('showLogo', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showCoverImage" className="font-medium">
                    Kapak Görseli Göster
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Menü başında büyük kapak görseli göster
                  </p>
                </div>
                <Switch
                  id="showCoverImage"
                  checked={watchedValues.showCoverImage}
                  onCheckedChange={(checked) =>
                    form.setValue('showCoverImage', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
            size="lg"
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Önizleme
              </CardTitle>
              <CardDescription>
                Menünüzün müşteriye nasıl görüneceği
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="min-h-[600px] overflow-y-auto"
                style={{
                  fontFamily:
                    watchedValues.fontFamily === 'inter'
                      ? 'Inter, sans-serif'
                      : watchedValues.fontFamily === 'roboto'
                      ? 'Roboto, sans-serif'
                      : watchedValues.fontFamily === 'playfair'
                      ? 'Playfair Display, serif'
                      : watchedValues.fontFamily === 'merriweather'
                      ? 'Merriweather, serif'
                      : 'Montserrat, sans-serif',
                }}
              >
                {/* Preview Header */}
                {watchedValues.showCoverImage && (
                  <div
                    className="h-48 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${watchedValues.primaryColor}, ${watchedValues.secondaryColor})`,
                    }}
                  />
                )}

                <div className="p-6 space-y-6">
                  {/* Logo */}
                  {watchedValues.showLogo && (
                    <div className="flex justify-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{
                          background: `linear-gradient(135deg, ${watchedValues.primaryColor}, ${watchedValues.secondaryColor})`,
                        }}
                      >
                        R
                      </div>
                    </div>
                  )}

                  {/* Restaurant Name */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Restoranım</h2>
                    <p className="text-sm text-muted-foreground">
                      Lezzetli yemekler ve harika deneyimler
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <h3
                      className="text-lg font-bold mb-3 pb-2 border-b-2"
                      style={{ borderColor: watchedValues.primaryColor }}
                    >
                      Ana Yemekler
                    </h3>

                    {/* Menu Items Preview */}
                    <div
                      className={cn(
                        watchedValues.menuLayout === 'GRID' &&
                          'grid grid-cols-2 gap-3',
                        watchedValues.menuLayout === 'LIST' && 'space-y-4',
                        watchedValues.menuLayout === 'COMPACT' && 'space-y-2',
                        watchedValues.menuLayout === 'MAGAZINE' &&
                          'grid gap-4'
                      )}
                    >
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className={cn(
                            'rounded-lg border p-3',
                            watchedValues.menuLayout === 'COMPACT' && 'p-2'
                          )}
                          style={{
                            borderColor: `${watchedValues.accentColor}20`,
                          }}
                        >
                          {watchedValues.menuLayout !== 'COMPACT' && (
                            <div
                              className="w-full h-24 rounded-md mb-2"
                              style={{
                                background: `linear-gradient(135deg, ${watchedValues.primaryColor}15, ${watchedValues.secondaryColor}15)`,
                              }}
                            />
                          )}
                          <h4 className="font-semibold text-sm mb-1">
                            Örnek Yemek {item}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            Lezzetli malzemeler
                          </p>
                          <p
                            className="font-bold text-sm"
                            style={{ color: watchedValues.primaryColor }}
                          >
                            ₺45.00
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
