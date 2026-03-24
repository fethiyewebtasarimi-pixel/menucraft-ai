'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAdminOrders } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  SERVED: 'bg-teal-100 text-teal-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  SERVED: 'Servis Edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const TYPE_LABELS: Record<string, string> = {
  DINE_IN: 'Restoranda',
  TAKEAWAY: 'Paket',
  DELIVERY: 'Kurye',
};

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: 'Ödenmedi',
  PAID: 'Ödendi',
  REFUNDED: 'İade Edildi',
};

const PAYMENT_COLORS: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-amber-100 text-amber-800',
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (typeFilter) params.type = typeFilter;
  if (paymentFilter) params.paymentStatus = paymentFilter;

  const { data, isLoading } = useAdminOrders(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-red-600" />
          Sipariş Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">Tüm platform siparişlerini görüntüleyip takip et</p>
      </div>

      {/* Summary */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{data.pagination?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Toplam Sipariş</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatPrice(data.stats.totalRevenue, 'TRY')}</p>
              <p className="text-xs text-muted-foreground">Toplam Gelir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatPrice(data.stats.averageOrder, 'TRY')}</p>
              <p className="text-xs text-muted-foreground">Ortalama Sipariş</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sipariş no, müşteri adı veya restoran ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Ödeme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ödemeler</SelectItem>
                {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.orders?.map((order: Record<string, unknown>) => (
            <motion.div
              key={order.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">#{order.orderNumber as string}</p>
                        <Badge className={STATUS_COLORS[order.status as string]}>
                          {STATUS_LABELS[order.status as string]}
                        </Badge>
                        <Badge variant="outline">{TYPE_LABELS[order.type as string]}</Badge>
                        <Badge className={PAYMENT_COLORS[order.paymentStatus as string]}>
                          {PAYMENT_LABELS[order.paymentStatus as string]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(order.restaurant as Record<string, string>)?.name}
                        {order.customerName ? ` - ${order.customerName as string}` : ''}
                        {(order.table as Record<string, unknown>)?.number ? ` - Masa ${(order.table as Record<string, unknown>).number as number}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {(order.items as unknown[])?.length || 0} ürün
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt as string).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatPrice(Number(order.totalAmount), 'TRY')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {data?.orders?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Sipariş bulunamadı
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı - #{selectedOrder?.orderNumber as string}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[selectedOrder.status as string]}>
                  {STATUS_LABELS[selectedOrder.status as string]}
                </Badge>
                <Badge variant="outline">{TYPE_LABELS[selectedOrder.type as string]}</Badge>
                <Badge className={PAYMENT_COLORS[selectedOrder.paymentStatus as string]}>
                  {PAYMENT_LABELS[selectedOrder.paymentStatus as string]}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Restoran:</span> {(selectedOrder.restaurant as Record<string, string>)?.name}</p>
                {selectedOrder.customerName ? <p><span className="text-muted-foreground">Müşteri:</span> {selectedOrder.customerName as string}</p> : null}
                {selectedOrder.customerPhone ? <p><span className="text-muted-foreground">Telefon:</span> {selectedOrder.customerPhone as string}</p> : null}
                {(selectedOrder.table as Record<string, unknown>)?.number ? <p><span className="text-muted-foreground">Masa:</span> {String((selectedOrder.table as Record<string, unknown>).number)}</p> : null}
                <p><span className="text-muted-foreground">Tarih:</span> {new Date(selectedOrder.createdAt as string).toLocaleString('tr-TR')}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Ürünler</p>
                {(selectedOrder.items as Record<string, unknown>[])?.map((item: Record<string, unknown>) => (
                  <div key={item.id as string} className="flex justify-between text-sm">
                    <span>
                      {item.quantity as number}x {(item.menuItem as Record<string, string>)?.name}
                    </span>
                    <span className="font-medium">{formatPrice(Number(item.totalPrice), 'TRY')}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span>{formatPrice(Number(selectedOrder.totalAmount), 'TRY')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
