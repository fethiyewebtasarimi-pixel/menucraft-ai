'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Crown,
  Star,
  MoreHorizontal,
  RefreshCw,
  ArrowUpDown,
  XCircle,
  CheckCircle,
  Clock,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminSubscriptions, useUpdateSubscription } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-muted/50 text-foreground',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-primary/10 text-primary',
};

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FREE: Star,
  STARTER: Sparkles,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Ücretsiz',
  STARTER: 'Başlangıç',
  PROFESSIONAL: 'Profesyonel',
  ENTERPRISE: 'Kurumsal',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAST_DUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-muted/50 text-foreground',
  TRIALING: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif',
  PAST_DUE: 'Süresi Geçmiş',
  CANCELLED: 'İptal',
  TRIALING: 'Deneme',
};

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (planFilter) params.plan = planFilter;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useAdminSubscriptions(params);
  const updateSub = useUpdateSubscription();

  const handleAction = async (subId: string, action: string, extra?: Record<string, unknown>) => {
    try {
      await updateSub.mutateAsync({ id: subId, data: { action, ...extra } });
      const actionLabels: Record<string, string> = {
        change_plan: 'Plan değiştirildi',
        cancel: 'Abonelik iptal edildi',
        reactivate: 'Abonelik aktifleştirildi',
        reset_credits: 'AI kredileri sıfırlandı',
        extend_period: 'Süre uzatıldı',
      };
      toast.success(actionLabels[action] || 'İşlem başarılı');
    } catch {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export/subscriptions', '_blank');
  };

  const planSummary: Record<string, number> = {};
  data?.planStats?.forEach((s: { plan: string; _count: { plan: number } }) => {
    planSummary[s.plan] = (planSummary[s.plan] || 0) + s._count.plan;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-red-600" />
            Abonelik Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">Kullanıcı planları ve abonelik durumlarını yönet</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          CSV İndir
        </Button>
      </div>

      {/* Plan Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map((plan) => {
          const Icon = PLAN_ICONS[plan];
          return (
            <Card key={plan}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${PLAN_COLORS[plan]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{planSummary[plan] || 0}</p>
                  <p className="text-xs text-muted-foreground">{PLAN_LABELS[plan]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Plan Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Planlar</SelectItem>
                <SelectItem value="FREE">Ücretsiz</SelectItem>
                <SelectItem value="STARTER">Başlangıç</SelectItem>
                <SelectItem value="PROFESSIONAL">Profesyonel</SelectItem>
                <SelectItem value="ENTERPRISE">Kurumsal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="PAST_DUE">Süresi Geçmiş</SelectItem>
                <SelectItem value="CANCELLED">İptal</SelectItem>
                <SelectItem value="TRIALING">Deneme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.subscriptions?.map((sub: Record<string, unknown>) => {
            const Icon = PLAN_ICONS[sub.plan as string] || Star;
            const aiTotal = (sub.aiCredits as number) || 0;
            const aiUsed = (sub.aiCreditsUsed as number) || 0;
            const aiPercentage = aiTotal > 0 ? Math.round((aiUsed / aiTotal) * 100) : 0;
            const user = sub.user as Record<string, unknown>;
            const userCount = (user?._count as Record<string, number>) || {};

            return (
              <motion.div
                key={sub.id as string}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(user?.avatar as string) || undefined} />
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {(user?.name as string)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user?.name as string}</p>
                            <Badge className={PLAN_COLORS[sub.plan as string]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {PLAN_LABELS[sub.plan as string]}
                            </Badge>
                            <Badge className={STATUS_COLORS[sub.status as string]}>
                              {STATUS_LABELS[sub.status as string]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user?.email as string}
                            {' - '}
                            {userCount?.restaurants || 0} restoran
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right space-y-1 min-w-[160px]">
                          <div className="text-xs text-muted-foreground">
                            AI Kredisi: {aiUsed}/{aiTotal}
                          </div>
                          <Progress value={aiPercentage} className="h-2" />
                          {sub.currentPeriodEnd ? (
                            <p className="text-xs text-muted-foreground">
                              Bitiş: {new Date(sub.currentPeriodEnd as string).toLocaleDateString('tr-TR')}
                            </p>
                          ) : null}
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Plan Değiştir
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((p) => (
                                  <DropdownMenuItem
                                    key={p}
                                    disabled={sub.plan === p}
                                    onClick={() => handleAction(sub.id as string, 'change_plan', { plan: p })}
                                  >
                                    {PLAN_LABELS[p]}
                                    {sub.plan === p && ' (mevcut)'}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'reset_credits')}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              AI Krediyi Sıfırla
                            </DropdownMenuItem>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Clock className="h-4 w-4 mr-2" />
                                Süre Uzat
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'extend_period', { periodDays: 7 })}>
                                  +7 Gün
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'extend_period', { periodDays: 30 })}>
                                  +30 Gün
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'extend_period', { periodDays: 90 })}>
                                  +90 Gün
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'extend_period', { periodDays: 365 })}>
                                  +1 Yıl
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            {sub.status === 'CANCELLED' ? (
                              <DropdownMenuItem onClick={() => handleAction(sub.id as string, 'reactivate')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Yeniden Aktifleştir
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleAction(sub.id as string, 'cancel')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                İptal Et
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {data?.subscriptions?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Abonelik bulunamadı
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Sayfa {page} / {data.pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
