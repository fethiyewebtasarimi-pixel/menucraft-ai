"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Trash2,
  MoreVertical,
  Copy,
  QrCode,
  Printer,
  ExternalLink,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";

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

// Pre-defined color themes for QR codes
const COLOR_PRESETS = [
  { name: "Klasik", fg: "#000000", bg: "#FFFFFF", accent: "#000000" },
  { name: "Okyanus", fg: "#0c4a6e", bg: "#f0f9ff", accent: "#0284c7" },
  { name: "Orman", fg: "#14532d", bg: "#f0fdf4", accent: "#16a34a" },
  { name: "Gece", fg: "#1e1b4b", bg: "#eef2ff", accent: "#6366f1" },
  { name: "Gün Batımı", fg: "#7c2d12", bg: "#fff7ed", accent: "#ea580c" },
  { name: "Gül", fg: "#881337", bg: "#fff1f2", accent: "#e11d48" },
  { name: "Altın", fg: "#713f12", bg: "#fefce8", accent: "#ca8a04" },
  { name: "Zarif", fg: "#292524", bg: "#fafaf9", accent: "#78716c" },
];

export default function QRCodesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteQRId, setDeleteQRId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const printRef = useRef<HTMLDivElement>(null);

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
      foregroundColor: string;
      backgroundColor: string;
    }) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/qr-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: data.tableId || undefined,
          style: "MODERN",
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

  const handleDownloadPNG = async (qr: QRCodeData) => {
    if (!qr.qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qr.qrDataUrl;
    a.download = `qr-${qr.table ? `masa-${qr.table.number}` : qr.code.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR kod PNG olarak indirildi");
  };

  const handleDownloadSVG = async (qr: QRCodeData) => {
    try {
      const { default: QRCodeLib } = await import("qrcode");
      const menuUrl = qr.menuUrl || `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;
      const svgString = await QRCodeLib.toString(menuUrl, {
        type: "svg",
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
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
      toast.success("QR kod SVG olarak indirildi");
    } catch {
      toast.error("SVG indirme başarısız");
    }
  };

  const handlePrint = (qr: QRCodeData) => {
    if (!qr.qrDataUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const label = qr.table ? `Masa ${qr.table.number}${qr.table.name ? ` - ${qr.table.name}` : ""}` : "Menü";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Kod - ${label}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          .card {
            width: 350px;
            text-align: center;
            padding: 40px 30px;
            border: 2px solid #e5e7eb;
            border-radius: 24px;
          }
          .restaurant-name {
            font-size: 22px;
            font-weight: 700;
            color: #111;
            margin-bottom: 6px;
          }
          .table-label {
            font-size: 16px;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 24px;
          }
          .qr-wrapper {
            background: #fff;
            border-radius: 16px;
            padding: 16px;
            display: inline-block;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .qr-wrapper img {
            width: 220px;
            height: 220px;
            display: block;
          }
          .scan-text {
            font-size: 15px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
          }
          .url-text {
            font-size: 11px;
            color: #9ca3af;
          }
          .powered {
            font-size: 10px;
            color: #d1d5db;
            margin-top: 20px;
          }
          @media print {
            body { background: #fff; }
            .card { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="restaurant-name">${restaurant?.name || "Restoran"}</div>
          <div class="table-label">${label}</div>
          <div class="qr-wrapper">
            <img src="${qr.qrDataUrl}" alt="QR Code" />
          </div>
          <div class="scan-text">Menüyü görmek için QR kodu okutun</div>
          <div class="powered">MenuCraft AI</div>
        </div>
        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCreateQR = () => {
    createQRMutation.mutate({
      tableId: selectedTable || undefined,
      foregroundColor,
      backgroundColor,
    });
  };

  const selectPreset = (index: number) => {
    setSelectedPreset(index);
    setForegroundColor(COLOR_PRESETS[index].fg);
    setBackgroundColor(COLOR_PRESETS[index].bg);
  };

  const resetForm = () => {
    setSelectedTable("");
    setSelectedPreset(0);
    setForegroundColor("#000000");
    setBackgroundColor("#FFFFFF");
  };

  const getQRLabel = (qr: QRCodeData) => {
    if (qr.table) {
      return `Masa ${qr.table.number}${qr.table.name ? ` - ${qr.table.name}` : ""}`;
    }
    return "Genel Menü";
  };

  const getMenuUrl = (qr: QRCodeData) => {
    return qr.menuUrl || `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;
  };

  if (qrLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="h-10 bg-muted rounded w-2/3 sm:w-1/3 animate-pulse" />
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
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
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Yeni QR Oluştur
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
            className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Henüz QR kodunuz yok
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              QR kod oluşturun, masalarınıza yerleştirin. Müşterileriniz telefonla tarayarak menünüze ulaşsın.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              İlk QR Kodunuzu Oluşturun
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {qrCodes.map((qr, index) => (
              <motion.div
                key={qr.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                {/* QR Code Display */}
                <div
                  className="relative p-6 pb-4 flex flex-col items-center"
                  style={{ backgroundColor: qr.backgroundColor || "#FFFFFF" }}
                >
                  {/* Actions dropdown */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownloadPNG(qr)}>
                          <Download className="w-4 h-4 mr-2" />
                          PNG İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadSVG(qr)}>
                          <Download className="w-4 h-4 mr-2" />
                          SVG İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(qr)}>
                          <Printer className="w-4 h-4 mr-2" />
                          Yazdır
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                          onClick={() => window.open(getMenuUrl(qr), "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Menüyü Aç
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteQRId(qr.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Real QR Code Image */}
                  {qr.qrDataUrl ? (
                    <div className="rounded-xl overflow-hidden shadow-sm border border-black/5">
                      <img
                        src={qr.qrDataUrl}
                        alt={`QR Kod - ${getQRLabel(qr)}`}
                        className="w-48 h-48 sm:w-52 sm:h-52"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Scan instruction */}
                  <p
                    className="text-xs mt-3 font-medium opacity-60"
                    style={{ color: qr.foregroundColor || "#000" }}
                  >
                    Menü için QR kodu okutun
                  </p>
                </div>

                {/* Info Section */}
                <div className="p-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {getQRLabel(qr)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(qr.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge variant={qr.isActive ? "default" : "secondary"} className="text-xs">
                      {qr.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{qr.scans} tarama</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: qr.foregroundColor }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: qr.backgroundColor }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleDownloadPNG(qr)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      İndir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handlePrint(qr)}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Yazdır
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => {
                        navigator.clipboard.writeText(getMenuUrl(qr));
                        toast.success("Link kopyalandı");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni QR Kod Oluştur</DialogTitle>
            <DialogDescription>
              Menünüz için taranabilir QR kod oluşturun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Table Selection */}
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
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Renk Teması
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset, index) => (
                  <button
                    key={preset.name}
                    onClick={() => selectPreset(index)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105",
                      selectedPreset === index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-5 h-5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.fg }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">QR Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => {
                      setForegroundColor(e.target.value);
                      setSelectedPreset(-1);
                    }}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => {
                      setForegroundColor(e.target.value);
                      setSelectedPreset(-1);
                    }}
                    className="flex-1 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Arka Plan</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setSelectedPreset(-1);
                    }}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setSelectedPreset(-1);
                    }}
                    className="flex-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div
              className="rounded-2xl p-6 flex flex-col items-center gap-3 border"
              style={{ backgroundColor }}
            >
              <div
                className="w-40 h-40 rounded-xl flex items-center justify-center"
                style={{ backgroundColor }}
              >
                <QrCode
                  className="w-32 h-32"
                  style={{ color: foregroundColor }}
                />
              </div>
              <p className="text-xs font-medium" style={{ color: foregroundColor, opacity: 0.5 }}>
                Menü için QR kodu okutun
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateQR}
              disabled={createQRMutation.isPending}
              className="gap-2"
            >
              {createQRMutation.isPending ? (
                "Oluşturuluyor..."
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  QR Kod Oluştur
                </>
              )}
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
              Bu işlem geri alınamaz. QR kod kalıcı olarak silinecektir ve artık taratılamayacaktır.
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
