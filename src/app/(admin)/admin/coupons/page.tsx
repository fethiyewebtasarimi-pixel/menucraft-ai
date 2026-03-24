'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useAdmin';
import { toast } from 'sonner';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [formValue, setFormValue] = useState('');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formMinPurchase, setFormMinPurchase] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formPlans, setFormPlans] = useState<string[]>([]);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useAdminCoupons(params);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const resetForm = () => {
    setFormCode(generateCode());
    setFormDescription('');
    setFormType('PERCENTAGE');
    setFormValue('');
    setFormMaxUses('');
    setFormMinPurchase('');
    setFormValidUntil('');
    setFormPlans([]);
  };

  const handleCreate = async () => {
    if (!formCode || !formValue) {
      toast.error('Kupon kodu ve indirim değeri gerekli');
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code: formCode,
        description: formDescription,
        discountType: formType,
        discountValue: Number(formValue),
        maxUses: formMaxUses ? Number(formMaxUses) : null,
        minPurchase: formMinPurchase ? Number(formMinPurchase) : null,
        validUntil: formValidUntil || null,
        applicablePlans: formPlans,
      });
      toast.success('Kupon oluşturuldu');
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Kupon oluşturulamadı');
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await updateCoupon.mutateAsync({ id, data: { isActive: !currentActive } });
      toast.success(currentActive ? 'Kupon devre dışı bırakıldı' : 'Kupon aktifleştirildi');
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`"${code}" kuponunu silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success('Kupon silindi');
    } catch {
      toast.error('Kupon silinemedi');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kupon kodu kopyalandı');
  };

  const isExpired = (coupon: Record<string, unknown>) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil as string) < new Date();
  };

  const togglePlan = (plan: string) => {
    setFormPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8 text-red-600" />
            Kupon Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">İndirim kuponları oluştur ve yönet</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Kupon Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kupon Kodu</Label>
                <div className="flex gap-2">
                  <Input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="MC-XXXXX" />
                  <Button variant="outline" size="sm" onClick={() => setFormCode(generateCode())}>Oluştur</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Kupon açıklaması..." rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>İndirim Tipi</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Yüzde (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Sabit Tutar (₺)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>İndirim Değeri</Label>
                  <Input type="number" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder={formType === 'PERCENTAGE' ? '10' : '50'} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maksimum Kullanım</Label>
                  <Input type="number" value={formMaxUses} onChange={(e) => setFormMaxUses(e.target.value)} placeholder="Sınırsız" />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Tutar (₺)</Label>
                  <Input type="number" value={formMinPurchase} onChange={(e) => setFormMinPurchase(e.target.value)} placeholder="Yok" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Son Geçerlilik Tarihi</Label>
                <Input type="date" value={formValidUntil} onChange={(e) => setFormValidUntil(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Geçerli Planlar</Label>
                <div className="flex flex-wrap gap-2">
                  {['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((plan) => (
                    <Badge
                      key={plan}
                      variant={formPlans.includes(plan) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePlan(plan)}
                    >
                      {plan}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Boş bırakılırsa tüm planlarda geçerli</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
              <Button onClick={handleCreate} disabled={createCoupon.isPending}>
                {createCoupon.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="expired">Süresi Dolmuş</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Coupons List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.coupons?.map((coupon: Record<string, unknown>) => {
            const expired = isExpired(coupon);
            const active = coupon.isActive && !expired;

            return (
              <motion.div
                key={coupon.id as string}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${!active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Ticket className={`h-5 w-5 ${active ? 'text-green-700' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-lg">{coupon.code as string}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code as string)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Badge className={active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {active ? 'Aktif' : expired ? 'Süresi Dolmuş' : 'Devre Dışı'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {coupon.description as string || 'Açıklama yok'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-lg font-bold">
                            {coupon.discountType === 'PERCENTAGE' ? (
                              <><Percent className="h-4 w-4" />{String(coupon.discountValue)}</>
                            ) : (
                              <>₺{String(coupon.discountValue)}</>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">İndirim</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-bold">{coupon.usedCount as number}</span>
                            <span className="text-muted-foreground">/</span>
                            <span>{(coupon.maxUses as number) || '∞'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Kullanım</p>
                        </div>

                        {coupon.validUntil ? (
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(coupon.validUntil as string).toLocaleDateString('tr-TR')}
                            </div>
                            <p className="text-xs text-muted-foreground">Son Tarih</p>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggle(coupon.id as string, coupon.isActive as boolean)}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(coupon.id as string, coupon.code as string)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Applicable plans */}
                    {(coupon.applicablePlans as string[])?.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Geçerli planlar:</span>
                        {(coupon.applicablePlans as string[]).map((plan) => (
                          <Badge key={plan} variant="outline" className="text-xs">{plan}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {data?.coupons?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Henüz kupon oluşturulmamış
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
