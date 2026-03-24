"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, QrCode, MoreVertical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRestaurants } from "@/hooks/useRestaurant";

interface Table {
  id: string;
  number: string;
  name?: string;
  capacity: number;
  hasQRCode: boolean;
  qrCodeId?: string;
  isActive: boolean;
}

export default function TablesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    capacity: 4,
  });

  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const restaurantId = restaurant?.id;

  const { data: tables, isLoading } = useQuery<Table[]>({
    queryKey: ["tables", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/tables`);
      if (!response.ok) throw new Error("Failed to fetch tables");
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create table");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Masa oluşturuldu");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Masa oluşturulamadı");
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update table");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Masa güncellendi");
      setEditingTable(null);
      resetForm();
    },
    onError: () => {
      toast.error("Masa güncellenemedi");
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete table");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Masa silindi");
      setDeleteTableId(null);
    },
    onError: () => {
      toast.error("Masa silinemedi");
    },
  });

  const createQRMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await fetch(`/api/tables/${tableId}/qr-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: "classic",
          foregroundColor: "#000000",
          backgroundColor: "#ffffff",
        }),
      });
      if (!response.ok) throw new Error("Failed to create QR code");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("QR kod oluşturuldu");
    },
    onError: () => {
      toast.error("QR kod oluşturulamadı");
    },
  });

  const handleSubmit = () => {
    if (!formData.number) {
      toast.error("Lütfen masa numarasını girin");
      return;
    }

    if (editingTable) {
      updateTableMutation.mutate({ id: editingTable.id, data: formData });
    } else {
      createTableMutation.mutate(formData);
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      name: table.name || "",
      capacity: table.capacity,
    });
  };

  const resetForm = () => {
    setFormData({
      number: "",
      name: "",
      capacity: 4,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !tables || tables.length === 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Masa Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{tables?.length || 0} masa tanımlandı</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Masa Ekle
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
          >
            <div className="w-32 h-32 mb-6 text-muted-foreground/70">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" />
                <rect x="35" y="45" width="30" height="10" rx="2" fill="currentColor" />
                <circle cx="35" cy="35" r="4" fill="currentColor" />
                <circle cx="65" cy="35" r="4" fill="currentColor" />
                <circle cx="35" cy="65" r="4" fill="currentColor" />
                <circle cx="65" cy="65" r="4" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Henüz masa eklenmemiş
            </h3>
            <p className="text-muted-foreground mb-6">İlk masanızı ekleyerek başlayın</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Masa Ekle
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {tables.map((table) => (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">
                      Masa {table.number}
                    </h3>
                    {table.name && (
                      <p className="text-sm text-muted-foreground mt-1">{table.name}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(table)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTableId(table.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{table.capacity} kişilik</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">QR Kod:</span>
                    </div>
                    {table.hasQRCode ? (
                      <Badge variant="default">Bağlı</Badge>
                    ) : (
                      <Badge variant="secondary">Yok</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  {table.hasQRCode ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/dashboard/qr-codes")}
                    >
                      QR Kodunu Görüntüle
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => createQRMutation.mutate(table.id)}
                      disabled={createQRMutation.isPending}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Kod Oluştur
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingTable}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingTable(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Masa Düzenle" : "Yeni Masa Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="number">Masa Numarası *</Label>
              <Input
                id="number"
                placeholder="Örn: 1, A1, VIP-1"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Masa Adı (Opsiyonel)</Label>
              <Input
                id="name"
                placeholder="Örn: Pencere Kenarı, VIP Salon"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasite (Kişi)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTable(null);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createTableMutation.isPending || updateTableMutation.isPending
              }
            >
              {editingTable ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTableId} onOpenChange={() => setDeleteTableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masayı silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Masa ve ilişkili QR kodu kalıcı olarak
              silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTableId && deleteTableMutation.mutate(deleteTableId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
