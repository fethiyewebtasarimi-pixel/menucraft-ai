'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Crown,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useAdminSubscriptions } from '@/hooks/useAdmin';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-amber-100 text-amber-800',
};

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FREE: Star,
  STARTER: Sparkles,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAST_DUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
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

  // Calculate plan stats summary
  const planSummary: Record<string, number> = {};
  data?.planStats?.forEach((s: { plan: string; _count: { plan: number } }) => {
    planSummary[s.plan] = (planSummary[s.plan] || 0) + s._count.plan;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-red-600" />
          Abonelik Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">Kullanıcı planları ve abonelik durumlarını yönet</p>
      </div>

      {/* Plan Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((plan) => {
          const Icon = PLAN_ICONS[plan];
          return (
            <Card key={plan}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${PLAN_COLORS[plan]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{planSummary[plan] || 0}</p>
                  <p className="text-xs text-muted-foreground">{plan}</p>
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
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
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
                          <AvatarImage src={((sub.user as Record<string, unknown>)?.avatar as string) || undefined} />
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {((sub.user as Record<string, unknown>)?.name as string)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{(sub.user as Record<string, unknown>)?.name as string}</p>
                            <Badge className={PLAN_COLORS[sub.plan as string]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {sub.plan as string}
                            </Badge>
                            <Badge className={STATUS_COLORS[sub.status as string]}>
                              {STATUS_LABELS[sub.status as string]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(sub.user as Record<string, unknown>)?.email as string}
                            {' - '}
                            {((sub.user as Record<string, unknown>)?._count as Record<string, number>)?.restaurants || 0} restoran
                          </p>
                        </div>
                      </div>

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
