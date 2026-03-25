"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Sparkles,
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

// QR Style definitions with qr-code-styling options
const QR_STYLES = [
  {
    id: "CLASSIC",
    name: "Klasik",
    description: "Standart kare modüller",
    dotsType: "square" as const,
    cornersSquareType: "square" as const,
    cornersDotType: "square" as const,
  },
  {
    id: "ROUNDED",
    name: "Yuvarlak",
    description: "Yumuşak yuvarlak köşeler",
    dotsType: "rounded" as const,
    cornersSquareType: "extra-rounded" as const,
    cornersDotType: "dot" as const,
  },
  {
    id: "DOTS",
    name: "Nokta",
    description: "Dairesel nokta deseni",
    dotsType: "dots" as const,
    cornersSquareType: "dot" as const,
    cornersDotType: "dot" as const,
  },
  {
    id: "MODERN",
    name: "Modern",
    description: "Şık modern tasarım",
    dotsType: "classy-rounded" as const,
    cornersSquareType: "extra-rounded" as const,
    cornersDotType: "dot" as const,
  },
  {
    id: "BRANDED",
    name: "Zarif",
    description: "Profesyonel kurumsal stil",
    dotsType: "classy" as const,
    cornersSquareType: "square" as const,
    cornersDotType: "square" as const,
  },
];

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

/**
 * Generate a styled QR code using qr-code-styling
 * Returns a data URL (PNG)
 */
async function generateStyledQR(
  url: string,
  opts: {
    fg: string;
    bg: string;
    style: (typeof QR_STYLES)[number];
    width?: number;
  }
): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const qr = new QRCodeStyling({
    width: opts.width || 400,
    height: opts.width || 400,
    data: url,
    margin: 12,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: opts.style.dotsType,
      color: opts.fg,
    },
    cornersSquareOptions: {
      type: opts.style.cornersSquareType,
      color: opts.fg,
    },
    cornersDotOptions: {
      type: opts.style.cornersDotType,
      color: opts.fg,
    },
    backgroundOptions: {
      color: opts.bg,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
    },
  });

  const rawData = await qr.getRawData("png");
  if (!rawData) throw new Error("QR generation failed");
  // qr-code-styling returns Blob in browser, Buffer in Node
  const blob: Blob = rawData instanceof Blob
    ? rawData
    : new Blob([new Uint8Array(rawData as unknown as ArrayBuffer)], { type: "image/png" });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Live QR Preview component that renders in real-time
 */
function QRPreview({
  fg,
  bg,
  style,
  containerRef,
}: {
  fg: string;
  bg: string;
  style: (typeof QR_STYLES)[number];
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<InstanceType<typeof import("qr-code-styling").default> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = containerRef?.current || innerRef.current;
      if (!container) return;

      const { default: QRCodeStyling } = await import("qr-code-styling");

      if (cancelled) return;

      // Clear previous
      container.innerHTML = "";

      const qr = new QRCodeStyling({
        width: 200,
        height: 200,
        data: "https://menucraft.ai/preview",
        margin: 8,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          type: style.dotsType,
          color: fg,
        },
        cornersSquareOptions: {
          type: style.cornersSquareType,
          color: fg,
        },
        cornersDotOptions: {
          type: style.cornersDotType,
          color: fg,
        },
        backgroundOptions: {
          color: bg,
        },
      });

      qrRef.current = qr;
      qr.append(container);
    }

    render();
    return () => { cancelled = true; };
  }, [fg, bg, style, containerRef]);

  if (containerRef) return null;
  return <div ref={innerRef} className="flex items-center justify-center" />;
}

/**
 * Mini QR preview for style selector thumbnails
 */
function MiniQRPreview({
  style,
  fg,
  bg,
  isSelected,
}: {
  style: (typeof QR_STYLES)[number];
  fg: string;
  bg: string;
  isSelected: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = containerRef.current;
      if (!container) return;

      const { default: QRCodeStyling } = await import("qr-code-styling");

      if (cancelled) return;

      container.innerHTML = "";

      const qr = new QRCodeStyling({
        width: 56,
        height: 56,
        data: "DEMO",
        margin: 3,
        qrOptions: { errorCorrectionLevel: "L" },
        dotsOptions: { type: style.dotsType, color: fg },
        cornersSquareOptions: { type: style.cornersSquareType, color: fg },
        cornersDotOptions: { type: style.cornersDotType, color: fg },
        backgroundOptions: { color: bg },
      });

      qr.append(container);
    }

    render();
    return () => { cancelled = true; };
  }, [style, fg, bg]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
        isSelected
          ? "border-primary shadow-lg bg-primary/5"
          : "border-border hover:border-primary/30"
      )}
    >
      <div
        ref={containerRef}
        className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: bg }}
      />
      <span className="text-[10px] font-semibold text-muted-foreground leading-tight">
        {style.name}
      </span>
    </div>
  );
}

export default function QRCodesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteQRId, setDeleteQRId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(1); // default: Yuvarlak
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const previewContainerRef = useRef<HTMLDivElement>(null);

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
      toast.success("QR kod oluşturuldu!");
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

  // Generate styled QR for download/print using qr-code-styling
  const generateStyledDataUrl = useCallback(
    async (qr: QRCodeData, width = 600): Promise<string> => {
      const menuUrl =
        qr.menuUrl ||
        `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;
      const styleObj =
        QR_STYLES.find((s) => s.id === qr.style) || QR_STYLES[1];
      return generateStyledQR(menuUrl, {
        fg: qr.foregroundColor || "#000000",
        bg: qr.backgroundColor || "#FFFFFF",
        style: styleObj,
        width,
      });
    },
    [restaurant?.slug]
  );

  const handleDownloadPNG = async (qr: QRCodeData) => {
    try {
      toast.info("QR kod hazırlanıyor...");
      const dataUrl = await generateStyledDataUrl(qr, 1024);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-${qr.table ? `masa-${qr.table.number}` : qr.code.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR kod PNG olarak indirildi");
    } catch {
      toast.error("İndirme başarısız");
    }
  };

  const handleDownloadSVG = async (qr: QRCodeData) => {
    try {
      toast.info("SVG hazırlanıyor...");
      const menuUrl =
        qr.menuUrl ||
        `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`;
      const styleObj =
        QR_STYLES.find((s) => s.id === qr.style) || QR_STYLES[1];
      const { default: QRCodeStyling } = await import("qr-code-styling");
      const qrCode = new QRCodeStyling({
        width: 1024,
        height: 1024,
        data: menuUrl,
        margin: 16,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: {
          type: styleObj.dotsType,
          color: qr.foregroundColor || "#000000",
        },
        cornersSquareOptions: {
          type: styleObj.cornersSquareType,
          color: qr.foregroundColor || "#000000",
        },
        cornersDotOptions: {
          type: styleObj.cornersDotType,
          color: qr.foregroundColor || "#000000",
        },
        backgroundOptions: {
          color: qr.backgroundColor || "#FFFFFF",
        },
      });

      const svgRaw = await qrCode.getRawData("svg");
      if (!svgRaw) throw new Error("SVG generation failed");
      const svgBlob: Blob = svgRaw instanceof Blob
        ? svgRaw
        : new Blob([new Uint8Array(svgRaw as unknown as ArrayBuffer)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
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

  const handlePrint = async (qr: QRCodeData) => {
    try {
      const dataUrl = await generateStyledDataUrl(qr, 600);
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const label = qr.table
        ? `Masa ${qr.table.number}${qr.table.name ? ` - ${qr.table.name}` : ""}`
        : "Menü";

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Kod - ${label}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f9fafb; }
            .card {
              width: 380px;
              text-align: center;
              padding: 48px 36px;
              background: white;
              border-radius: 24px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: 700;
              color: #111;
              margin-bottom: 4px;
            }
            .table-label {
              font-size: 16px;
              font-weight: 500;
              color: #6b7280;
              margin-bottom: 28px;
            }
            .qr-wrapper {
              border-radius: 20px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 28px;
              background: ${qr.backgroundColor || "#fff"};
              border: 1px solid rgba(0,0,0,0.06);
            }
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
              border-radius: 8px;
            }
            .scan-text {
              font-size: 15px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 4px;
            }
            .sub-text {
              font-size: 13px;
              color: #9ca3af;
              margin-bottom: 4px;
            }
            .powered {
              font-size: 10px;
              color: #d1d5db;
              margin-top: 24px;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            @media print {
              body { background: #fff; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="restaurant-name">${restaurant?.name || "Restoran"}</div>
            <div class="table-label">${label}</div>
            <div class="qr-wrapper">
              <img src="${dataUrl}" alt="QR Code" />
            </div>
            <div class="scan-text">Menüyü görmek için QR kodu okutun</div>
            <div class="sub-text">Telefonunuzun kamerasıyla tarayın</div>
            <div class="powered">MenuCraft AI</div>
          </div>
          <script>
            document.querySelector('img').onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 300);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      toast.error("Yazdırma hazırlanamadı");
    }
  };

  const handleCreateQR = () => {
    createQRMutation.mutate({
      tableId: selectedTable || undefined,
      style: QR_STYLES[selectedStyleIndex].id,
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
    setSelectedStyleIndex(1);
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
    return (
      qr.menuUrl ||
      `${window.location.origin}/menu/${restaurant?.slug}?qr=${qr.code}`
    );
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            QR Kod Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            {qrCodes?.length || 0} QR kod oluşturuldu
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="lg"
          className="gap-2"
        >
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
              QR kod oluşturun, masalarınıza yerleştirin. Müşterileriniz
              telefonla tarayarak menünüze ulaşsın.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
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
              <QRCardItem
                key={qr.id}
                qr={qr}
                index={index}
                restaurantSlug={restaurant?.slug}
                restaurantName={restaurant?.name}
                getQRLabel={getQRLabel}
                getMenuUrl={getMenuUrl}
                onDownloadPNG={handleDownloadPNG}
                onDownloadSVG={handleDownloadSVG}
                onPrint={handlePrint}
                onDelete={(id) => setDeleteQRId(id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Yeni QR Kod Oluştur
            </DialogTitle>
            <DialogDescription>
              Menünüz için stil ve renk seçerek taranabilir QR kod oluşturun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Table Selection */}
            <div className="space-y-2">
              <Label className="font-semibold">Masa Bağlantısı (Opsiyonel)</Label>
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

            {/* QR Style Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-semibold">
                <QrCode className="w-4 h-4" />
                QR Kod Stili
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {QR_STYLES.map((style, index) => (
                  <div key={style.id} onClick={() => setSelectedStyleIndex(index)}>
                    <MiniQRPreview
                      style={style}
                      fg={foregroundColor}
                      bg={backgroundColor}
                      isSelected={selectedStyleIndex === index}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {QR_STYLES[selectedStyleIndex].description}
              </p>
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-semibold">
                <Palette className="w-4 h-4" />
                Renk Teması
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset, index) => (
                  <button
                    key={preset.name}
                    onClick={() => selectPreset(index)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all hover:scale-105",
                      selectedPreset === index
                        ? "border-primary shadow-md bg-primary/5"
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

            {/* Live QR Preview */}
            <div
              className="rounded-2xl p-6 flex flex-col items-center gap-3 border"
              style={{ backgroundColor }}
            >
              <QRPreview
                fg={foregroundColor}
                bg={backgroundColor}
                style={QR_STYLES[selectedStyleIndex]}
                containerRef={previewContainerRef}
              />
              <div
                ref={previewContainerRef}
                className="rounded-xl overflow-hidden"
              />
              <p
                className="text-xs font-medium"
                style={{ color: foregroundColor, opacity: 0.5 }}
              >
                Menü için QR kodu okutun
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
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
            <AlertDialogTitle>
              QR kodu silmek istediğinize emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. QR kod kalıcı olarak silinecektir ve artık
              taratılamayacaktır.
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

/**
 * QR Card item - renders each QR code in the grid with styled QR image
 */
function QRCardItem({
  qr,
  index,
  restaurantSlug,
  restaurantName,
  getQRLabel,
  getMenuUrl,
  onDownloadPNG,
  onDownloadSVG,
  onPrint,
  onDelete,
}: {
  qr: QRCodeData;
  index: number;
  restaurantSlug?: string;
  restaurantName?: string;
  getQRLabel: (qr: QRCodeData) => string;
  getMenuUrl: (qr: QRCodeData) => string;
  onDownloadPNG: (qr: QRCodeData) => void;
  onDownloadSVG: (qr: QRCodeData) => void;
  onPrint: (qr: QRCodeData) => void;
  onDelete: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [styledDataUrl, setStyledDataUrl] = useState<string | null>(null);

  // Generate styled QR code on mount
  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const menuUrl =
          qr.menuUrl ||
          `${window.location.origin}/menu/${restaurantSlug}?qr=${qr.code}`;
        const styleObj =
          QR_STYLES.find((s) => s.id === qr.style) || QR_STYLES[1];
        const dataUrl = await generateStyledQR(menuUrl, {
          fg: qr.foregroundColor || "#000000",
          bg: qr.backgroundColor || "#FFFFFF",
          style: styleObj,
          width: 400,
        });
        if (!cancelled) {
          setStyledDataUrl(dataUrl);
        }
      } catch (err) {
        console.error("Failed to render styled QR:", err);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [qr, restaurantSlug]);

  return (
    <motion.div
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
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownloadPNG(qr)}>
                <Download className="w-4 h-4 mr-2" />
                PNG İndir (Yüksek Kalite)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadSVG(qr)}>
                <Download className="w-4 h-4 mr-2" />
                SVG İndir (Vektör)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrint(qr)}>
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
                onClick={() => onDelete(qr.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Styled QR Code Image */}
        {styledDataUrl ? (
          <div className="rounded-xl overflow-hidden shadow-sm border border-black/5">
            <img
              src={styledDataUrl}
              alt={`QR Kod - ${getQRLabel(qr)}`}
              className="w-48 h-48 sm:w-52 sm:h-52"
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-40 h-40 bg-muted/50 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-muted-foreground/30 animate-spin" />
            </div>
          </div>
        )}

        {/* Style badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-background/80 backdrop-blur-sm">
            {QR_STYLES.find((s) => s.id === qr.style)?.name || "Klasik"}
          </Badge>
        </div>

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
          <Badge
            variant={qr.isActive ? "default" : "secondary"}
            className="text-xs"
          >
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
            onClick={() => onDownloadPNG(qr)}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            İndir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => onPrint(qr)}
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
  );
}
