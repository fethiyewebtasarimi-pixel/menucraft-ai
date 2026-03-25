'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Search,
  MoreHorizontal,
  Trash2,
  Power,
  PowerOff,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  QrCode,
  Grid3X3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminRestaurants, useToggleRestaurant, useDeleteRestaurant } from '@/hooks/useAdmin';
import { toast } from 'sonner';

export default function AdminRestaurantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useAdminRestaurants(params);
  const toggleRestaurant = useToggleRestaurant();
  const deleteRestaurant = useDeleteRestaurant();

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleRestaurant.mutate(
      { id, isActive: !currentActive },
      {
        onSuccess: () => toast.success(currentActive ? 'Restoran deaktif edildi' : 'Restoran aktif edildi'),
        onError: () => toast.error('İşlem başarısız'),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteRestaurant.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Restoran silindi');
        setDeleteId(null);
      },
      onError: () => toast.error('Silme başarısız'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8 text-red-600" />
            Restoran Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">Tüm restoranları görüntüleyip yönet</p>
        </div>
        <Button variant="outline" onClick={() => window.open('/api/admin/export/restaurants', '_blank')}>
          <Download className="h-4 w-4 mr-2" />
          CSV İndir
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Restoran adı, slug veya sahip ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Toplam {data?.pagination?.total || 0} restoran bulundu
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.restaurants?.map((restaurant: Record<string, unknown>) => (
            <motion.div
              key={restaurant.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">{restaurant.name as string}</p>
                        <Badge variant={restaurant.isActive ? 'default' : 'secondary'}>
                          {restaurant.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{restaurant.slug as string} - {(restaurant.city as string) || 'Şehir belirtilmemiş'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sahip: {(restaurant.user as Record<string, string>)?.name} ({(restaurant.user as Record<string, string>)?.email})
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UtensilsCrossed className="h-3 w-3" />
                          {(restaurant._count as Record<string, number>)?.menuItems || 0} ürün
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {(restaurant._count as Record<string, number>)?.orders || 0} sipariş
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {(restaurant._count as Record<string, number>)?.reviews || 0} yorum
                        </span>
                        <span className="flex items-center gap-1">
                          <Grid3X3 className="h-3 w-3" />
                          {(restaurant._count as Record<string, number>)?.tables || 0} masa
                        </span>
                        <span className="flex items-center gap-1">
                          <QrCode className="h-3 w-3" />
                          {(restaurant._count as Record<string, number>)?.qrCodes || 0} QR
                        </span>
                        <span>
                          Oluşturulma: {new Date(restaurant.createdAt as string).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Menüyü Gör
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(restaurant.id as string, restaurant.isActive as boolean)}>
                          {restaurant.isActive ? (
                            <><PowerOff className="h-4 w-4 mr-2" />Deaktif Et</>
                          ) : (
                            <><Power className="h-4 w-4 mr-2" />Aktif Et</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(restaurant.id as string)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {data?.restaurants?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Restoran bulunamadı
              </CardContent>
            </Card>
          )}
        </div>
      )}

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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restoranı Sil</DialogTitle>
            <DialogDescription>
              Bu restoranı silmek istediğinizden emin misiniz? Tüm menüleri, siparişleri,
              yorumları ve QR kodları da silinecektir. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>İptal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteRestaurant.isPending}>
              {deleteRestaurant.isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
