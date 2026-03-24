'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Store,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const stats = data?.overview;
  const last30 = stats?.last30Days || {};
  const trends = stats?.trends || {};

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-red-600" />
          Platform Analitik
        </h1>
        <p className="text-muted-foreground mt-1">Detayli platform istatistikleri ve buyume metrikleri</p>
      </div>

      {/* Period Stats */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Son 30 Gun Ozeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{last30.users || 0}</p>
                <p className="text-sm text-muted-foreground">Yeni Kullanici</p>
                <p className={`text-sm font-medium ${trends.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.users >= 0 ? '+' : ''}{trends.users || 0}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-green-100">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{last30.restaurants || 0}</p>
                <p className="text-sm text-muted-foreground">Yeni Restoran</p>
                <p className={`text-sm font-medium ${trends.restaurants >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.restaurants >= 0 ? '+' : ''}{trends.restaurants || 0}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-purple-100">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{last30.orders || 0}</p>
                <p className="text-sm text-muted-foreground">Yeni Siparis</p>
                <p className={`text-sm font-medium ${trends.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.orders >= 0 ? '+' : ''}{trends.orders || 0}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-amber-100">
                    <CreditCard className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{formatPrice(last30.revenue || 0, 'TRY')}</p>
                <p className="text-sm text-muted-foreground">Gelir</p>
                <p className={`text-sm font-medium ${trends.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.revenue >= 0 ? '+' : ''}{trends.revenue || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Totals */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              Genel Toplam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Kullanici</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-3xl font-bold">{stats?.totalRestaurants || 0}</p>
                <p className="text-sm text-muted-foreground">Restoran</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Siparis</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-3xl font-bold">{formatPrice(stats?.totalRevenue || 0, 'TRY')}</p>
                <p className="text-sm text-muted-foreground">Gelir</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-3xl font-bold">{stats?.totalReviews || 0}</p>
                <p className="text-sm text-muted-foreground">Yorum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Signups Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Gunluk Kayitlar (Son 30 Gun)</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.dailySignups?.length > 0 ? (
              <div className="flex items-end gap-1 h-40">
                {(data.dailySignups as { date: string; count: number }[]).map((day, idx) => {
                  const maxCount = Math.max(...(data.dailySignups as { count: number }[]).map((d) => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{day.count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-red-500 to-rose-400 rounded-t-sm min-h-[2px]"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${new Date(day.date).toLocaleDateString('tr-TR')}: ${day.count} kayit`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henuz veri yok</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Distribution & Order Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Plan Dagilimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.planDistribution?.map((p: { plan: string; _count: { plan: number } }) => {
                  const total = stats?.totalUsers || 1;
                  const percentage = Math.round((p._count.plan / total) * 100);
                  return (
                    <div key={p.plan} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.plan}</span>
                        <span className="text-muted-foreground">{p._count.plan} ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Siparis Durum Dagilimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.orderStatusDistribution?.map((s: { status: string; _count: { status: number } }) => {
                  const total = stats?.totalOrders || 1;
                  const percentage = Math.round((s._count.status / total) * 100);
                  const labels: Record<string, string> = {
                    PENDING: 'Bekliyor', CONFIRMED: 'Onaylandi', PREPARING: 'Hazirlaniyor',
                    READY: 'Hazir', SERVED: 'Servis Edildi', COMPLETED: 'Tamamlandi', CANCELLED: 'Iptal',
                  };
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{labels[s.status] || s.status}</span>
                        <span className="text-muted-foreground">{s._count.status} ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
