"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  isActive: boolean;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function MenuItemsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Mock restaurant ID
  const restaurantId = "current-restaurant-id";

  const { data: items, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu-items", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/items`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, isActive }: { itemId: string; isActive: boolean }) => {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });
      toast.success("Ürün durumu güncellendi");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });
      toast.success("Ürün silindi");
      setDeleteItemId(null);
    },
  });

  // Filter items
  const filteredItems = items?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil((filteredItems?.length || 0) / itemsPerPage);
  const paginatedItems = filteredItems?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleItem = (itemId: string, currentStatus: boolean) => {
    toggleItemMutation.mutate({ itemId, isActive: !currentStatus });
  };

  const handleDeleteItem = () => {
    if (deleteItemId) {
      deleteItemMutation.mutate(deleteItemId);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });
  };

  if (itemsLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-2/3 sm:w-1/3 animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  const isEmpty = !items || items.length === 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tüm Yemekler</h1>
          <p className="text-muted-foreground mt-1">
            {filteredItems?.length || 0} ürün bulundu
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Yemek Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
          <Input
            placeholder="Yemek ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Kategori seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>
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
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M35 55 L50 40 L65 55"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line x1="50" y1="40" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Henüz yemek eklenmemiş
            </h3>
            <p className="text-muted-foreground mb-6">Hemen ilk yemeğinizi ekleyin</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yemek Ekle
            </Button>
          </motion.div>
        ) : filteredItems && filteredItems.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
          >
            <Filter className="w-16 h-16 text-muted-foreground/70 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-muted-foreground">Filtreleri değiştirmeyi deneyin</p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Görsel</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Özellikler</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-20">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-muted/50 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/70">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₺{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.isVegan && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              V
                            </Badge>
                          )}
                          {item.isVegetarian && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              Veg
                            </Badge>
                          )}
                          {item.isGlutenFree && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              GF
                            </Badge>
                          )}
                          {item.isSpicy && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              S
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleItem(item.id, item.isActive)}
                          />
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteItemId(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-border">
              {paginatedItems?.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 flex-shrink-0 bg-muted/50 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/70">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                          <p className="text-sm font-semibold text-foreground mt-0.5">₺{item.price.toFixed(2)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-shrink-0 -mt-1 -mr-2">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteItemId(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{item.category}</Badge>
                      {item.isVegan && (
                        <Badge variant="outline" className="text-green-600 border-green-600">V</Badge>
                      )}
                      {item.isVegetarian && (
                        <Badge variant="outline" className="text-green-500 border-green-500">Veg</Badge>
                      )}
                      {item.isGlutenFree && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">GF</Badge>
                      )}
                      {item.isSpicy && (
                        <Badge variant="outline" className="text-red-600 border-red-600">S</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleItem(item.id, item.isActive)}
                      />
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Sayfa {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Yemek Ekle</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            restaurantId={restaurantId}
            categories={categories || []}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yemeği Düzenle</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            initialData={editingItem || undefined}
            restaurantId={restaurantId}
            categories={categories || []}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Ürün kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
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
