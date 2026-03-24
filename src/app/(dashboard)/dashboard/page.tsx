'use client';

import { motion } from 'framer-motion';
import {
  Eye,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Plus,
  Download,
  ClipboardList,
  Sparkles,
  Package,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurant';
import { useAnalytics } from '@/hooks/useAnalytics';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();

  // Use first restaurant for analytics
  const firstRestaurantId = restaurants?.[0]?.id;

  // Last 30 days analytics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(
    firstRestaurantId,
    thirtyDaysAgo
  );

  // Previous 30 days for comparison
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data: prevAnalytics } = useAnalytics(
    firstRestaurantId,
    sixtyDaysAgo,
    thirtyDaysAgo
  );

  const isLoading = restaurantsLoading || analyticsLoading;

  // Calculate change percentages
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  const menuViewsChange = calcChange(
    analytics?.summary?.totalMenuViews || 0,
    prevAnalytics?.summary?.totalMenuViews || 0
  );
  const ordersChange = calcChange(
    analytics?.summary?.totalOrders || 0,
    prevAnalytics?.summary?.totalOrders || 0
  );
  const revenueChange = calcChange(
    analytics?.summary?.totalRevenue || 0,
    prevAnalytics?.summary?.totalRevenue || 0
  );

  const qrScans = analytics?.dailyData?.reduce((sum, d) => sum + (d.qrScans || 0), 0) || 0;
  const prevQrScans = prevAnalytics?.dailyData?.reduce((sum, d) => sum + (d.qrScans || 0), 0) || 0;
  const qrScansChange = calcChange(qrScans, prevQrScans);

  const quickActions = [
    {
      label: 'Menu Olustur',
      icon: Plus,
      href: '/dashboard/menu',
      variant: 'default' as const,
    },
    {
      label: 'QR Kod Indir',
      icon: Download,
      href: '/dashboard/qr-codes',
      variant: 'outline' as const,
    },
    {
      label: 'Siparis Yonet',
      icon: ClipboardList,
      href: '/dashboard/orders',
      variant: 'outline' as const,
    },
  ];

  const quickLinks = [
    {
      title: 'Menu Duzenle',
      description: 'Mevcut menulerinizi guncelleyin',
      icon: Package,
      href: '/dashboard/menu',
    },
    {
      title: 'Marka Tasarimi',
      description: 'Menu gorunumunuzu ozellestirin',
      icon: Sparkles,
      href: '/dashboard/branding',
    },
    {
      title: 'Istatistikler',
      description: 'Detayli analitik verileri gorun',
      icon: TrendingUp,
      href: '/dashboard/analytics',
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Hos geldin, {user?.name?.split(' ')[0] || 'Kullanici'}!
        </h1>
        <p className="text-muted-foreground">
          Iste restoraninizin guncel durumu ve hizli erisim paneli.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              size="lg"
              asChild
              className="gap-2"
            >
              <Link href={action.href}>
                <Icon className="h-5 w-5" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={item}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Menu Goruntuleme"
              value={(analytics?.summary?.totalMenuViews || 0).toLocaleString('tr-TR')}
              change={menuViewsChange}
              icon={Eye}
              trend={menuViewsChange >= 0 ? 'up' : 'down'}
            />
            <StatsCard
              title="QR Tarama"
              value={qrScans.toLocaleString('tr-TR')}
              change={qrScansChange}
              icon={QrCode}
              trend={qrScansChange >= 0 ? 'up' : 'down'}
            />
            <StatsCard
              title="Siparis"
              value={(analytics?.summary?.totalOrders || 0).toLocaleString('tr-TR')}
              change={ordersChange}
              icon={ShoppingBag}
              trend={ordersChange >= 0 ? 'up' : 'down'}
            />
            <StatsCard
              title="Gelir"
              value={formatPrice(analytics?.summary?.totalRevenue || 0)}
              change={revenueChange}
              icon={TrendingUp}
              trend={revenueChange >= 0 ? 'up' : 'down'}
            />
          </>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Items */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Populer Yemekler</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/analytics">
                  Detaylar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : analytics?.topSellingItems && analytics.topSellingItems.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topSellingItems.slice(0, 5).map((item, index) => (
                    <div key={item.menuItem?.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 font-semibold text-xs">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.menuItem?.name || 'Bilinmeyen'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantitySold} adet satildi
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {item.orderCount} siparis
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-accent p-4 mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Henuz veri yok
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Siparis verileri biriktikce populer yemekler burada listelencek
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/menu">Menuleri Goruntule</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Siparis Ozeti</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/orders">
                  Tumunu Gor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : analytics?.orderStatusDistribution &&
                Object.keys(analytics.orderStatusDistribution).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => {
                    const statusLabels: Record<string, string> = {
                      PENDING: 'Bekliyor',
                      CONFIRMED: 'Onaylandi',
                      PREPARING: 'Hazirlaniyor',
                      READY: 'Hazir',
                      SERVED: 'Servis Edildi',
                      COMPLETED: 'Tamamlandi',
                      CANCELLED: 'Iptal Edildi',
                    };
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-yellow-100 text-yellow-800',
                      CONFIRMED: 'bg-blue-100 text-blue-800',
                      PREPARING: 'bg-orange-100 text-orange-800',
                      READY: 'bg-green-100 text-green-800',
                      SERVED: 'bg-emerald-100 text-emerald-800',
                      COMPLETED: 'bg-gray-100 text-gray-800',
                      CANCELLED: 'bg-red-100 text-red-800',
                    };
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[status] || status}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ortalama siparis degeri</span>
                      <span className="font-semibold">
                        {formatPrice(analytics?.summary?.avgOrderValue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-accent p-4 mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Henuz siparis yok
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Siparisler gelmeye basladiginda burada gorunecek
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/orders">Siparis Ayarlari</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold mb-4">Hizli Erisim</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.title} href={link.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-amber-500/50 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3 ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 group-hover:text-amber-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
