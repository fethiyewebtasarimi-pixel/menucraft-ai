"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useRestaurants } from "@/hooks/useRestaurant";

interface Menu {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  itemCount: number;
  createdAt: string;
}

export default function MenuManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);

  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const restaurantId = restaurant?.id;

  const { data: menus, isLoading } = useQuery<Menu[]>({
    queryKey: ["menus", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/menus`);
      if (!response.ok) throw new Error("Failed to fetch menus");
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const toggleMenuMutation = useMutation({
    mutationFn: async ({ menuId, isActive }: { menuId: string; isActive: boolean }) => {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle menu");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus", restaurantId] });
      toast.success("Menü durumu güncellendi");
    },
    onError: () => {
      toast.error("Menü durumu güncellenirken bir hata oluştu");
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete menu");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus", restaurantId] });
      toast.success("Menü silindi");
      setDeleteMenuId(null);
    },
    onError: () => {
      toast.error("Menü silinirken bir hata oluştu");
    },
  });

  const handleToggleMenu = (menuId: string, currentStatus: boolean) => {
    toggleMenuMutation.mutate({ menuId, isActive: !currentStatus });
  };

  const handleDeleteMenu = () => {
    if (deleteMenuId) {
      deleteMenuMutation.mutate(deleteMenuId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !menus || menus.length === 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menü Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Menülerinizi oluşturun, düzenleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/dashboard/menu/ai-create")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI ile Oluştur
          </Button>
          <Button onClick={() => router.push("/dashboard/menu/items")}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Menü Oluştur
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative w-64 h-64 mb-6">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-muted-foreground/70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="40"
                  y="30"
                  width="120"
                  height="140"
                  rx="8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="3" />
                <line x1="60" y1="80" x2="120" y2="80" stroke="currentColor" strokeWidth="2" />
                <line x1="60" y1="100" x2="140" y2="100" stroke="currentColor" strokeWidth="3" />
                <line x1="60" y1="120" x2="120" y2="120" stroke="currentColor" strokeWidth="2" />
                <line x1="60" y1="140" x2="140" y2="140" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Henüz menünüz yok
            </h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Hemen ilk menünüzü oluşturun veya AI'ın menü fotoğrafınızı analiz ederek
              otomatik oluşturmasını sağlayın.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/menu/ai-create")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI ile Oluştur
              </Button>
              <Button
                onClick={() => router.push("/dashboard/menu/items")}
                size="lg"
                variant="outline"
              >
                <Plus className="w-5 h-5 mr-2" />
                Manuel Oluştur
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {menus.map((menu) => (
              <motion.div
                key={menu.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {menu.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{menu.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {menu.itemCount} ürün
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/menu/${menu.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteMenuId(menu.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Durum:</span>
                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                      {menu.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <Switch
                    checked={menu.isActive}
                    onCheckedChange={() => handleToggleMenu(menu.id, menu.isActive)}
                  />
                </div>

                <Button
                  onClick={() => router.push(`/dashboard/menu/${menu.id}`)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Menüyü Görüntüle
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMenuId} onOpenChange={() => setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Menüyü silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Menü ve içindeki tüm ürünler kalıcı olarak
              silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMenu}
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
