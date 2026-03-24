'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Eye,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Download,
  Smartphone,
  Monitor,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useRestaurants } from '@/hooks/useRestaurant';
import { useAnalytics } from '@/hooks/useAnalytics';
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

const DATE_RANGES: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const { data: restaurants } = useRestaurants();
  const firstRestaurantId = restaurants?.[0]?.id;

  const days = DATE_RANGES[dateRange] || 30;
  const startDate = useMemo(
    () => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    [days]
  );

  const { data: analytics, isLoading } = useAnalytics(firstRestaurantId, startDate);

  // Calculate QR scans total from daily data
  const qrScans = analytics?.dailyData?.reduce((sum, d) => sum + (d.qrScans || 0), 0) || 0;

  // Group daily data by hour for traffic visualization
  const hourlyTraffic = useMemo(() => {
    if (!analytics?.dailyData?.length) return [];
    // Simulate hourly distribution based on total views
    const totalViews = analytics.summary.totalMenuViews;
    const distribution = [0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.1, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01];
    return [
      { hour: '00:00', value: Math.round(totalViews * distribution[0]) },
      { hour: '03:00', value: Math.round(totalViews * distribution[3]) },
      { hour: '06:00', value: Math.round(totalViews * distribution[6]) },
      { hour: '09:00', value: Math.round(totalViews * distribution[9]) },
      { hour: '12:00', value: Math.round(totalViews * distribution[12]) },
      { hour: '15:00', value: Math.round(totalViews * distribution[15]) },
      { hour: '18:00', value: Math.round(totalViews * distribution[18]) },
      { hour: '21:00', value: Math.round(totalViews * distribution[21]) },
    ];
  }, [analytics]);

  // Daily trend for chart area
  const dailyTrend = useMemo(() => {
    if (!analytics?.dailyData?.length) return [];
    return analytics.dailyData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      views: d.menuViews,
      orders: d.totalOrders,
    }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const noData = !analytics || analytics.summary.totalMenuViews === 0;

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitik</h1>
          <p className="text-muted-foreground">
            Restoranınızın performans istatistikleri
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 90 Gün</SelectItem>
              <SelectItem value="1y">Son 1 Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={item}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Menü Görüntüleme"
          value={(analytics?.summary?.totalMenuViews || 0).toLocaleString('tr-TR')}
          icon={Eye}
          trend="up"
          description="Toplam görüntüleme"
        />
        <StatsCard
          title="QR Kod Taraması"
          value={qrScans.toLocaleString('tr-TR')}
          icon={QrCode}
          trend="up"
          description="Benzersiz tarama"
        />
        <StatsCard
          title="Sipariş Sayısı"
          value={(analytics?.summary?.totalOrders || 0).toLocaleString('tr-TR')}
          icon={ShoppingBag}
          trend="up"
          description="Tamamlanan sipariş"
        />
        <StatsCard
          title="Toplam Gelir"
          value={formatPrice(analytics?.summary?.totalRevenue || 0)}
          icon={TrendingUp}
          trend="up"
          description={`Ort. sipariş: ${formatPrice(analytics?.summary?.avgOrderValue || 0)}`}
        />
      </motion.div>

      {noData ? (
        <motion.div variants={item}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-accent p-4 mb-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Yeterli Veri Yok</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Analitik verilerinizi görmek için menünüzün daha fazla görüntülenmesi gerekiyor.
                QR kodunuzu paylaşın ve müşterilerinizin menünüze erişmesini sağlayın.
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <a href="/dashboard/qr-codes">QR Kod İndir</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Trend */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-amber-600" />
                    Menü Görüntüleme Trendi
                  </CardTitle>
                  <CardDescription>Son {days} gündeki görüntüleme sayısı</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyTrend.length > 0 ? (
                    <div className="space-y-2">
                      {dailyTrend.slice(-14).map((day) => {
                        const maxViews = Math.max(...dailyTrend.map((d) => d.views), 1);
                        const percentage = (day.views / maxViews) * 100;
                        return (
                          <div key={day.date} className="flex items-center gap-3 text-sm">
                            <span className="w-12 text-muted-foreground text-xs">{day.date}</span>
                            <div className="flex-1">
                              <div
                                className="h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                                style={{ width: `${Math.max(percentage, 2)}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-medium text-xs">{day.views}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Veri bekleniyor...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Type Distribution */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-amber-600" />
                    Sipariş Tipi Dağılımı
                  </CardTitle>
                  <CardDescription>Sipariş türlerine göre dağılım</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.orderTypeDistribution &&
                    Object.keys(analytics.orderTypeDistribution).length > 0 ? (
                    <>
                      {Object.entries(analytics.orderTypeDistribution).map(([type, count]) => {
                        const total = Object.values(analytics.orderTypeDistribution).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const labels: Record<string, { name: string; icon: typeof Smartphone }> = {
                          DINE_IN: { name: 'Masada Yeme', icon: Monitor },
                          TAKEAWAY: { name: 'Paket Servis', icon: ShoppingBag },
                          DELIVERY: { name: 'Teslimat', icon: Smartphone },
                        };
                        const info = labels[type] || { name: type, icon: Monitor };
                        const Icon = info.icon;
                        return (
                          <div key={type} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{info.name}</span>
                              </div>
                              <span className="text-muted-foreground">{count} (%{percentage.toFixed(0)})</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Henüz sipariş verisi yok
                    </p>
                  )}

                  {/* Reviews Summary */}
                  {analytics?.reviews && analytics.reviews.totalReviews > 0 && (
                    <div className="pt-4 mt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ortalama Puan</span>
                        <span className="font-semibold">{analytics.reviews.averageRating.toFixed(1)} / 5</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Toplam Yorum</span>
                        <span className="font-semibold">{analytics.reviews.totalReviews}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Popular Items */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  Popüler Yemekler
                </CardTitle>
                <CardDescription>
                  En çok sipariş edilen ürünler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topSellingItems && analytics.topSellingItems.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topSellingItems.map((topItem, index) => {
                      const maxQty = Math.max(...analytics.topSellingItems.map((i) => i.quantitySold || 0), 1);
                      const viewPercentage = ((topItem.quantitySold || 0) / maxQty) * 100;

                      return (
                        <div key={topItem.menuItem?.id || index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 font-semibold text-xs">
                                #{index + 1}
                              </div>
                              <div>
                                <span className="font-medium">{topItem.menuItem?.name || 'Bilinmeyen'}</span>
                                {topItem.menuItem?.category?.name && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({topItem.menuItem.category.name})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" />
                                {topItem.quantitySold} adet
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {topItem.orderCount} sipariş
                              </span>
                            </div>
                          </div>
                          <Progress value={viewPercentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henüz sipariş verisi yok
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hourly Traffic */}
          {hourlyTraffic.length > 0 && (
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Saat Bazlı Trafik (Tahmini)
                  </CardTitle>
                  <CardDescription>
                    Gün içinde menü görüntüleme dağılımı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hourlyTraffic.map((data) => {
                      const maxValue = Math.max(...hourlyTraffic.map((t) => t.value), 1);
                      const percentage = (data.value / maxValue) * 100;

                      return (
                        <div key={data.hour} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-muted-foreground w-16">
                              {data.hour}
                            </span>
                            <div className="flex-1 mx-4">
                              <Progress value={percentage} className="h-3" />
                            </div>
                            <span className="font-semibold w-12 text-right">
                              {data.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
