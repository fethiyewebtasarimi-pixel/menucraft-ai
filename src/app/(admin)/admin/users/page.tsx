'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { useAdminUsers, useUpdateUser, useDeleteUser } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-blue-100 text-blue-800',
  MANAGER: 'bg-purple-100 text-purple-800',
  STAFF: 'bg-gray-100 text-gray-800',
  ADMIN: 'bg-red-100 text-red-800',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-amber-100 text-amber-800',
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [editUser, setEditUser] = useState<Record<string, unknown> | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editPlan, setEditPlan] = useState('');

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (search) params.search = search;
  if (roleFilter) params.role = roleFilter;
  if (planFilter) params.plan = planFilter;

  const { data, isLoading } = useAdminUsers(params);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleUpdateUser = () => {
    if (!editUser) return;
    const updateData: Record<string, unknown> = {};
    if (editRole) updateData.role = editRole;
    if (editPlan) updateData.plan = editPlan;

    updateUser.mutate(
      { id: editUser.id as string, data: updateData },
      {
        onSuccess: () => {
          toast.success('Kullanici guncellendi');
          setEditUser(null);
          setEditRole('');
          setEditPlan('');
        },
        onError: () => toast.error('Guncelleme basarisiz'),
      }
    );
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    deleteUser.mutate(deleteUserId, {
      onSuccess: () => {
        toast.success('Kullanici silindi');
        setDeleteUserId(null);
      },
      onError: () => toast.error('Silme basarisiz'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-red-600" />
          Kullanici Yonetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Tum kullanicilari goruntuleyip yonet
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Isim veya email ile ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Roller</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Planlar</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Toplam {data?.pagination?.total || 0} kullanici bulundu
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.users?.map((user: Record<string, unknown>) => (
            <motion.div
              key={user.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={(user.avatar as string) || undefined} />
                        <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                          {(user.name as string)?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.name as string}</p>
                          <Badge className={ROLE_COLORS[user.role as string]}>{user.role as string}</Badge>
                          {(user.subscription as Record<string, string>) && (
                            <Badge className={PLAN_COLORS[(user.subscription as Record<string, string>).plan]}>
                              {(user.subscription as Record<string, string>).plan}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email as string}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{(user._count as Record<string, number>)?.restaurants || 0} restoran</span>
                          <span>Kayit: {new Date(user.createdAt as string).toLocaleDateString('tr-TR')}</span>
                          {user.emailVerified ? <span className="text-green-600">Email Dogrulanmis</span> : null}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditUser(user);
                          setEditRole(user.role as string);
                          setEditPlan((user.subscription as Record<string, string>)?.plan || 'FREE');
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Duzenle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteUserId(user.id as string)}
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

          {data?.users?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Kullanici bulunamadi
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Sayfa {page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanici Duzenle</DialogTitle>
            <DialogDescription>
              {(editUser?.name as string)} - {(editUser?.email as string)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Iptal</Button>
            <Button onClick={handleUpdateUser} disabled={updateUser.isPending}
              className="bg-red-600 hover:bg-red-700">
              {updateUser.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullaniciyi Sil</DialogTitle>
            <DialogDescription>
              Bu kullaniciyi silmek istediginizden emin misiniz? Bu islem geri alinamaz.
              Kullanicinin tum restoranlari ve verileri de silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>Iptal</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
