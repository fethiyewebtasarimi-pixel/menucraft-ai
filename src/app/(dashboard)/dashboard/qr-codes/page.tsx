"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Trash2,
  MoreVertical,
  Copy,
  Grid3x3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRestaurants } from "@/hooks/useRestaurant";

interface QRCodeTable {
  id: string;
  number: number;
  name?: string;
}

interface QRCodeData {
  id: string;
  code: string;
  tableId?: string;
  table?: QRCodeTable | null;
  scans: number;
  style: string;
  foregroundColor: string;
  backgroundColor: string;
  isActive: boolean;
  createdAt: string;
  qrDataUrl?: string;
  menuUrl?: string;
}

interface Table {
  id: string;
  number: number;
  name?: string;
}

export default function QRCodesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteQRId, setDeleteQRId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [qrStyle, setQrStyle] = useState("CLASSIC");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const restaurantId = restaurant?.id;

  const { data: qrCodes, isLoading: qrLoading } = useQuery<QRCodeData[]>({
    queryKey: ["qr-codes", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/qr-codes`);
      if (!response.ok) throw new Error("QR kodlar yüklenemedi");
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const { data: tables } = useQuery<Table[]>({
    queryKey: ["tables", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/tables`);
      if (!response.ok) throw new Error("Masalar yüklenemedi");
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const createQRMutation = useMutation({
    mutationFn: async (data: {
      tableId?: string;
      style: string;
      foregroundColor: string;
      backgroundColor: string;
    }) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/qr-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: data.tableId || undefined,
          style: data.style,
          foregroundColor: data.foregroundColor,
          backgroundColor: data.backgroundColor,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "QR kod oluşturulamadı");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", restaurantId] });
      toast.success("QR kod oluşturuldu");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "QR kod oluşturulamadı");
    },
  });

  const deleteQRMutation = useMutation({
    mutationFn: async (qrId: string) => {
      const response = await fetch(`/api/qr-codes/${qrId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete QR code");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", restaurantId] });
      toast.success("QR kod silindi");
      setDeleteQRId(null);
    },
  });

  const handleDownload = async (qr: QRCodeData, format: "png" | "svg") => {
    try {
      const menuUrl = `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;

      if (format === "png") {
        // Generate QR code as canvas and download
        const { default: QRCodeLib } = await import("qrcode");
        const dataUrl = await QRCodeLib.toDataURL(menuUrl, {
          width: 1024,
          color: {
            dark: qr.foregroundColor || "#000000",
            light: qr.backgroundColor || "#ffffff",
          },
        });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `qr-${qr.table ? `masa-${qr.table.number}` : qr.code.slice(0, 8)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const { default: QRCodeLib } = await import("qrcode");
        const svgString = await QRCodeLib.toString(menuUrl, {
          type: "svg",
          width: 1024,
          color: {
            dark: qr.foregroundColor || "#000000",
            light: qr.backgroundColor || "#ffffff",
          },
        });

        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-${qr.table ? `masa-${qr.table.number}` : qr.code.slice(0, 8)}.svg`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`QR kod ${format.toUpperCase()} olarak indirildi`);
    } catch (error) {
      toast.error("İndirme başarısız");
    }
  };

  const handleCreateQR = () => {
    createQRMutation.mutate({
      tableId: selectedTable || undefined,
      style: qrStyle,
      foregroundColor,
      backgroundColor,
    });
  };

  const resetForm = () => {
    setSelectedTable("");
    setQrStyle("CLASSIC");
    setForegroundColor("#000000");
    setBackgroundColor("#ffffff");
  };

  const qrStyles = [
    { id: "CLASSIC", name: "Klasik" },
    { id: "MODERN", name: "Modern" },
    { id: "ROUNDED", name: "Yuvarlak" },
    { id: "DOTS", name: "Noktalı" },
    { id: "BRANDED", name: "Markalı" },
  ];

  const getQRLabel = (qr: QRCodeData) => {
    if (qr.table) {
      return `Masa ${qr.table.number}${qr.table.name ? ` - ${qr.table.name}` : ""}`;
    }
    return `QR Kod`;
  };

  const getMenuUrl = (qr: QRCodeData) => {
    return `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;
  };

  if (qrLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-2/3 sm:w-1/3 animate-pulse" />
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !qrCodes || qrCodes.length === 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">QR Kod Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            {qrCodes?.length || 0} QR kod oluşturuldu
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni QR Oluştur
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
            className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
          >
            <div className="w-32 h-32 mb-6 text-muted-foreground/70">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="15" y="15" width="15" height="15" fill="currentColor" />
                <rect x="70" y="15" width="15" height="15" fill="currentColor" />
                <rect x="15" y="70" width="15" height="15" fill="currentColor" />
                {[...Array(25)].map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  if ((row + col) % 2 === 0 && row > 0 && row < 4 && col > 0 && col < 4) {
                    return (
                      <rect
                        key={i}
                        x={35 + col * 8}
                        y={35 + row * 8}
                        width="6"
                        height="6"
                        fill="currentColor"
                      />
                    );
                  }
                  return null;
                })}
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Henüz QR kodunuz yok
            </h3>
            <p className="text-muted-foreground mb-6">
              Masalarınız için QR kod oluşturun
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk QR Kodunuzu Oluşturun
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {qrCodes.map((qr) => (
              <motion.div
                key={qr.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {getQRLabel(qr)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {qr.code.slice(0, 12)}...
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(qr, "png")}>
                        <Download className="w-4 h-4 mr-2" />
                        PNG İndir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(qr, "svg")}>
                        <Download className="w-4 h-4 mr-2" />
                        SVG İndir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(getMenuUrl(qr));
                          toast.success("Link kopyalandı");
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Link Kopyala
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteQRId(qr.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* QR Code Preview */}
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 bg-card rounded p-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill={qr.backgroundColor} />
                      <g fill={qr.foregroundColor}>
                        <rect x="5" y="5" width="20" height="20" />
                        <rect x="75" y="5" width="20" height="20" />
                        <rect x="5" y="75" width="20" height="20" />
                        <rect x="35" y="35" width="30" height="30" />
                        <rect x="30" y="10" width="5" height="5" />
                        <rect x="40" y="10" width="5" height="5" />
                        <rect x="50" y="10" width="5" height="5" />
                        <rect x="60" y="10" width="5" height="5" />
                        <rect x="30" y="20" width="5" height="5" />
                        <rect x="50" y="20" width="5" height="5" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tarama:</span>
                    <Badge variant="secondary">{qr.scans}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stil:</span>
                    <Badge variant="outline">{qr.style}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durum:</span>
                    <Badge variant={qr.isActive ? "default" : "secondary"}>
                      {qr.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni QR Kod Oluştur</DialogTitle>
            <DialogDescription>
              Menünüz için yeni bir QR kod oluşturun. Opsiyonel olarak bir masaya bağlayabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Table Selection (Optional) */}
            <div className="space-y-2">
              <Label>Masa Bağlantısı (Opsiyonel)</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Masa seçin veya boş bırakın" />
                </SelectTrigger>
                <SelectContent>
                  {tables?.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Masa {table.number}
                      {table.name && ` - ${table.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Bir masaya bağlamak isterseniz seçin, tüm menü için boş bırakın
              </p>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <Label>QR Kod Stili</Label>
              <RadioGroup value={qrStyle} onValueChange={setQrStyle}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {qrStyles.map((style) => (
                    <div key={style.id}>
                      <RadioGroupItem
                        value={style.id}
                        id={style.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={style.id}
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-border p-3 sm:p-4 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-muted/50 rounded mb-2" />
                        <span className="text-xs font-medium">{style.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ön Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arka Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 sm:p-6 bg-accent">
              <Label className="mb-3 block">Önizleme</Label>
              <div className="bg-card rounded-lg p-4 sm:p-8 flex items-center justify-center">
                <div className="w-36 h-36 sm:w-48 sm:h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect width="100" height="100" fill={backgroundColor} />
                    <g fill={foregroundColor}>
                      <rect x="5" y="5" width="20" height="20" />
                      <rect x="75" y="5" width="20" height="20" />
                      <rect x="5" y="75" width="20" height="20" />
                      <rect x="35" y="35" width="30" height="30" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateQR}
              disabled={createQRMutation.isPending}
            >
              {createQRMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteQRId} onOpenChange={() => setDeleteQRId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QR kodu silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. QR kod kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQRId && deleteQRMutation.mutate(deleteQRId)}
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
