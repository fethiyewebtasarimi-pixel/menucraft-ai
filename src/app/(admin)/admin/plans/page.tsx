'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Save,
  Star,
  Sparkles,
  Zap,
  Crown,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAdminPlans, useUpdatePlans } from '@/hooks/useAdmin';
import { toast } from 'sonner';

interface PlanConfig {
  name: string;
  slug: string;
  price: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  features: string[];
  limitations: string[];
}

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FREE: Star,
  STARTER: Sparkles,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'from-gray-500 to-gray-600',
  STARTER: 'from-blue-500 to-blue-600',
  PROFESSIONAL: 'from-purple-500 to-purple-600',
  ENTERPRISE: 'from-amber-500 to-amber-600',
};

export default function AdminPlansPage() {
  const { data, isLoading } = useAdminPlans();
  const updatePlans = useUpdatePlans();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.plans) {
      setPlans(data.plans);
    }
  }, [data]);

  const updatePlan = (index: number, field: string, value: unknown) => {
    const updated = [...plans];
    (updated[index] as any)[field] = value;
    setPlans(updated);
    setHasChanges(true);
  };

  const addFeature = (planIndex: number) => {
    const updated = [...plans];
    updated[planIndex].features.push('');
    setPlans(updated);
    setHasChanges(true);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const updated = [...plans];
    updated[planIndex].features[featureIndex] = value;
    setPlans(updated);
    setHasChanges(true);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...plans];
    updated[planIndex].features.splice(featureIndex, 1);
    setPlans(updated);
    setHasChanges(true);
  };

  const addLimitation = (planIndex: number) => {
    const updated = [...plans];
    updated[planIndex].limitations.push('');
    setPlans(updated);
    setHasChanges(true);
  };

  const updateLimitation = (planIndex: number, limIndex: number, value: string) => {
    const updated = [...plans];
    updated[planIndex].limitations[limIndex] = value;
    setPlans(updated);
    setHasChanges(true);
  };

  const removeLimitation = (planIndex: number, limIndex: number) => {
    const updated = [...plans];
    updated[planIndex].limitations.splice(limIndex, 1);
    setPlans(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Filter out empty features/limitations
      const cleanPlans = plans.map((p) => ({
        ...p,
        features: p.features.filter((f) => f.trim()),
        limitations: p.limitations.filter((l) => l.trim()),
      }));
      await updatePlans.mutateAsync(cleanPlans);
      setHasChanges(false);
      toast.success('Plan ayarları kaydedildi');
    } catch {
      toast.error('Plan ayarları kaydedilemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-red-600" />
            Plan Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">Abonelik planlarının fiyat ve özelliklerini düzenle</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updatePlans.isPending}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {updatePlans.isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Kaydedilmemiş değişiklikler var. Kaydet butonuna tıklayarak değişiklikleri uygulayın.
        </div>
      )}

      <div className="grid gap-6">
        {plans.map((plan, planIndex) => {
          const Icon = PLAN_ICONS[plan.slug] || Star;
          const gradient = PLAN_COLORS[plan.slug] || 'from-gray-500 to-gray-600';

          return (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: planIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${gradient} text-white`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Icon className="h-6 w-6" />
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {plan.slug !== 'ENTERPRISE' && (
                        <div className="text-right">
                          <span className="text-3xl font-bold">
                            {plan.price === -1 ? 'Özel' : `₺${plan.price}`}
                          </span>
                          {plan.price > 0 && <span className="text-white/80 text-sm">/ay</span>}
                        </div>
                      )}
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {plan.slug}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Plan Adı</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Aylık Fiyat (₺)</Label>
                      <Input
                        type="number"
                        value={plan.price}
                        onChange={(e) => updatePlan(planIndex, 'price', Number(e.target.value))}
                        placeholder="-1 = Özel fiyat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Yıllık Fiyat (₺/ay)</Label>
                      <Input
                        type="number"
                        value={plan.yearlyPrice}
                        onChange={(e) => updatePlan(planIndex, 'yearlyPrice', Number(e.target.value))}
                        placeholder="-1 = Özel fiyat"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Açıklama</Label>
                      <Textarea
                        value={plan.description}
                        onChange={(e) => updatePlan(planIndex, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Popüler Plan</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={plan.popular || false}
                          onCheckedChange={(checked) => updatePlan(planIndex, 'popular', checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {plan.popular ? 'Evet - "En Popüler" etiketi gösterilir' : 'Hayır'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Özellikler</Label>
                      <Button variant="outline" size="sm" onClick={() => addFeature(planIndex)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(planIndex, fIdx, e.target.value)}
                            placeholder="Özellik yazın..."
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 flex-shrink-0"
                            onClick={() => removeFeature(planIndex, fIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Kısıtlamalar</Label>
                      <Button variant="outline" size="sm" onClick={() => addLimitation(planIndex)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            value={limitation}
                            onChange={(e) => updateLimitation(planIndex, lIdx, e.target.value)}
                            placeholder="Kısıtlama yazın..."
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 flex-shrink-0"
                            onClick={() => removeLimitation(planIndex, lIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {plan.limitations.length === 0 && (
                        <p className="text-sm text-muted-foreground">Kısıtlama bulunmuyor</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
