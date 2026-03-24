'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Store,
  Ticket,
  Settings,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminLogs } from '@/hooks/useAdmin';

const TARGET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  subscription: CreditCard,
  user: User,
  restaurant: Store,
  coupon: Ticket,
  system_config: Settings,
};

const TARGET_LABELS: Record<string, string> = {
  subscription: 'Abonelik',
  user: 'Kullanıcı',
  restaurant: 'Restoran',
  coupon: 'Kupon',
  system_config: 'Sistem Ayarı',
};

const ACTION_COLORS: Record<string, string> = {
  plan_degistir: 'bg-blue-100 text-blue-800',
  abonelik_iptal: 'bg-red-100 text-red-800',
  abonelik_aktif: 'bg-green-100 text-green-800',
  kredi_sifirla: 'bg-purple-100 text-purple-800',
  sure_uzat: 'bg-primary/10 text-primary',
  plan_guncelle: 'bg-indigo-100 text-indigo-800',
  kupon_olustur: 'bg-green-100 text-green-800',
  kupon_guncelle: 'bg-blue-100 text-blue-800',
  kupon_sil: 'bg-red-100 text-red-800',
  kullanici_guncelle: 'bg-blue-100 text-blue-800',
  kullanici_sil: 'bg-red-100 text-red-800',
  restoran_guncelle: 'bg-blue-100 text-blue-800',
};

const ACTION_LABELS: Record<string, string> = {
  plan_degistir: 'Plan Değiştirildi',
  abonelik_iptal: 'Abonelik İptal',
  abonelik_aktif: 'Abonelik Aktifleştirildi',
  kredi_sifirla: 'Kredi Sıfırlandı',
  sure_uzat: 'Süre Uzatıldı',
  plan_guncelle: 'Plan Ayarları Güncellendi',
  kupon_olustur: 'Kupon Oluşturuldu',
  kupon_guncelle: 'Kupon Güncellendi',
  kupon_sil: 'Kupon Silindi',
  kullanici_guncelle: 'Kullanıcı Güncellendi',
  kullanici_sil: 'Kullanıcı Silindi',
  restoran_guncelle: 'Restoran Güncellendi',
};

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '';
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [targetFilter, setTargetFilter] = useState('');

  const params: Record<string, string> = { page: String(page), limit: '50' };
  if (targetFilter) params.target = targetFilter;

  const { data, isLoading } = useAdminLogs(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ScrollText className="h-8 w-8 text-red-600" />
          İşlem Geçmişi
        </h1>
        <p className="text-muted-foreground mt-1">Admin panelinde yapılan tüm işlemlerin kaydı</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Select value={targetFilter} onValueChange={(v) => { setTargetFilter(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="subscription">Abonelik</SelectItem>
              <SelectItem value="user">Kullanıcı</SelectItem>
              <SelectItem value="restaurant">Restoran</SelectItem>
              <SelectItem value="coupon">Kupon</SelectItem>
              <SelectItem value="system_config">Sistem Ayarı</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Logs Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {data?.logs?.map((log: Record<string, unknown>, index: number) => {
            const TargetIcon = TARGET_ICONS[log.target as string] || Shield;
            const actionColor = ACTION_COLORS[log.action as string] || 'bg-muted/50 text-foreground';
            const actionLabel = ACTION_LABELS[log.action as string] || (log.action as string);

            return (
              <motion.div
                key={log.id as string}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-accent flex-shrink-0">
                        <TargetIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={actionColor}>{actionLabel}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {TARGET_LABELS[log.target as string] || (log.target as string)}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                            {timeAgo(log.createdAt as string)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{log.userName as string}</span>
                          {' tarafından yapıldı'}
                        </p>
                        {log.details ? (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {formatDetails(log.details as Record<string, unknown>)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {data?.logs?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Henüz işlem kaydı bulunmuyor
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Sayfa {page} / {data.pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
