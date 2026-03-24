'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminStats } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  trend: 'up' | 'down';
  trendValue: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <motion.div variants={item} whileHover={{ y: -4 }}>
      <Link href={href}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
                <div className="mt-2 flex items-center gap-1">
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={trend === 'up' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
                    {trend === 'up' && '+'}
                    {trendValue}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">son 30 gün</span>
                </div>
              </div>
              <div className="rounded-lg p-3 bg-gradient-to-br from-red-500/10 to-rose-500/10 ring-1 ring-red-500/20">
                <Icon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  SERVED: 'bg-teal-100 text-teal-800',
  COMPLETED: 'bg-muted/50 text-foreground',
  CANCELLED: 'bg-red-100 text-red-800',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  SERVED: 'Servis Edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-muted/50 text-foreground',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-primary/10 text-primary',
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const stats = data?.overview;
  const trends = stats?.trends || {};

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
        <p className="text-muted-foreground mt-1">Platform genel bakış ve yönetim</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers || 0}
          trend={trends.users >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.users || 0)}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          title="Toplam Restoran"
          value={stats?.totalRestaurants || 0}
          trend={trends.restaurants >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.restaurants || 0)}
          icon={Store}
          href="/admin/restaurants"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats?.totalOrders || 0}
          trend={trends.orders >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.orders || 0)}
          icon={ShoppingBag}
          href="/admin/orders"
        />
        <StatCard
          title="Toplam Gelir"
          value={formatPrice(stats?.totalRevenue || 0, 'TRY')}
          trend={trends.revenue >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.revenue || 0)}
          icon={CreditCard}
          href="/admin/subscriptions"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Son Kayıt Olan Kullanıcılar</CardTitle>
              <Link href="/admin/users" className="text-sm text-red-600 hover:underline flex items-center gap-1">
                Tümünü Gör <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentUsers?.slice(0, 5).map((user: Record<string, unknown>) => (
                  <div key={user.id as string} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={(user.avatar as string) || undefined} />
                        <AvatarFallback className="text-xs bg-red-100 text-red-700">
                          {(user.name as string)?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name as string}</p>
                        <p className="text-xs text-muted-foreground">{user.email as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={PLAN_COLORS[(user.subscription as Record<string, string>)?.plan || 'FREE']}>
                        {(user.subscription as Record<string, string>)?.plan || 'FREE'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt as string).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!data?.recentUsers || data.recentUsers.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz kullanıcı yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Son Siparişler</CardTitle>
              <Link href="/admin/orders" className="text-sm text-red-600 hover:underline flex items-center gap-1">
                Tümünü Gör <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentOrders?.slice(0, 5).map((order: Record<string, unknown>) => (
                  <div key={order.id as string} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{order.orderNumber as string}</p>
                      <p className="text-xs text-muted-foreground">
                        {(order.restaurant as Record<string, string>)?.name} - {order.customerName as string || 'Misafir'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={ORDER_STATUS_COLORS[order.status as string]}>
                        {ORDER_STATUS_LABELS[order.status as string]}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatPrice(Number(order.totalAmount), 'TRY')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!data?.recentOrders || data.recentOrders.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz sipariş yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.planDistribution?.map((p: { plan: string; _count: { plan: number } }) => {
                  const total = data.overview?.totalUsers || 1;
                  const percentage = Math.round((p._count.plan / total) * 100);
                  return (
                    <div key={p.plan} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.plan}</span>
                        <span className="text-muted-foreground">{p._count.plan} kullanıcı ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all"
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

        {/* Top Restaurants */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">En Popüler Restoranlar</CardTitle>
              <Link href="/admin/restaurants" className="text-sm text-red-600 hover:underline flex items-center gap-1">
                Tümünü Gör <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.topRestaurants?.slice(0, 5).map((r: Record<string, unknown>, idx: number) => (
                  <div key={r.id as string} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-accent text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{r.name as string}</p>
                        <p className="text-xs text-muted-foreground">{r.city as string || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{(r._count as Record<string, number>)?.orders || 0} sipariş</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {(r._count as Record<string, number>)?.reviews || 0} yorum
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.topRestaurants || data.topRestaurants.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz restoran yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Order Status Distribution */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sipariş Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data?.orderStatusDistribution?.map((s: { status: string; _count: { status: number } }) => (
                <div key={s.status} className="flex items-center gap-2">
                  <Badge className={ORDER_STATUS_COLORS[s.status]}>
                    {ORDER_STATUS_LABELS[s.status]}
                  </Badge>
                  <span className="text-sm font-medium">{s._count.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
