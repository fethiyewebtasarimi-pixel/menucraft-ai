"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Package,
  MessageSquare,
  Bell,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: "pending" | "preparing" | "ready" | "completed";
  items: OrderItem[];
  totalAmount: number;
  customerNote?: string;
  createdAt: string;
}

const statusConfig = {
  pending: {
    label: "Bekleyen",
    color: "bg-yellow-500",
    icon: Clock,
    nextStatus: "preparing",
    nextLabel: "Hazırlamaya Başla",
  },
  preparing: {
    label: "Hazırlanıyor",
    color: "bg-blue-500",
    icon: ChefHat,
    nextStatus: "ready",
    nextLabel: "Hazır",
  },
  ready: {
    label: "Hazır",
    color: "bg-green-500",
    icon: Package,
    nextStatus: "completed",
    nextLabel: "Tamamlandı",
  },
  completed: {
    label: "Tamamlandı",
    color: "bg-accent0",
    icon: CheckCircle,
    nextStatus: null,
    nextLabel: null,
  },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const restaurantId = "current-restaurant-id";

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantId}/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for new orders
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast.success("Sipariş durumu güncellendi");
    },
    onError: () => {
      toast.error("Sipariş güncellenirken bir hata oluştu");
    },
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const orderCounts = {
    all: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    preparing: orders?.filter((o) => o.status === "preparing").length || 0,
    ready: orders?.filter((o) => o.status === "ready").length || 0,
    completed: orders?.filter((o) => o.status === "completed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sipariş Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            {orderCounts.pending} bekleyen sipariş
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card rounded-lg border px-3 py-1.5 sm:px-4 sm:py-2">
            {soundEnabled ? (
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            ) : (
              <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/70" />
            )}
            <Label htmlFor="sound-toggle" className="text-xs sm:text-sm font-medium cursor-pointer">
              Bildirim Sesi
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="relative text-xs sm:text-sm">
              <span className="sm:hidden">Tümü</span>
              <span className="hidden sm:inline">Tümü</span>
              {orderCounts.all > 0 && (
                <Badge className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs" variant="secondary">
                  {orderCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative text-xs sm:text-sm">
              <span className="sm:hidden">Bekleyen</span>
              <span className="hidden sm:inline">Bekleyen</span>
              {orderCounts.pending > 0 && (
                <Badge className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs bg-yellow-500">{orderCounts.pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="text-xs sm:text-sm">
              <span className="sm:hidden">Hazırl.</span>
              <span className="hidden sm:inline">Hazırlanıyor</span>
              {orderCounts.preparing > 0 && (
                <Badge className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs bg-blue-500">{orderCounts.preparing}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready" className="text-xs sm:text-sm">
              Hazır
              {orderCounts.ready > 0 && (
                <Badge className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs bg-green-500">{orderCounts.ready}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              <span className="sm:hidden">Biten</span>
              <span className="hidden sm:inline">Tamamlanan</span>
              {orderCounts.completed > 0 && (
                <Badge className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs" variant="secondary">
                  {orderCounts.completed}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
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
                    <rect x="20" y="30" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M30 30 L30 20 L70 20 L70 30" stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="2" />
                    <line x1="35" y1="55" x2="55" y2="55" stroke="currentColor" strokeWidth="2" />
                    <line x1="35" y1="65" x2="65" y2="65" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Henüz sipariş yok
                </h3>
                <p className="text-muted-foreground">
                  Yeni siparişler burada görünecek
                </p>
              </motion.div>
            ) : filteredOrders && filteredOrders.length === 0 ? (
              <motion.div
                key="no-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border"
              >
                <Clock className="w-16 h-16 text-muted-foreground/70 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Bu kategoride sipariş yok
                </h3>
                <p className="text-muted-foreground">
                  Diğer kategorilere göz atın
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredOrders?.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`p-2 sm:p-3 rounded-lg ${config.color} bg-opacity-10 flex-shrink-0`}>
                            <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                Sipariş #{order.orderNumber}
                              </h3>
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
                              <span>Masa {order.tableNumber}</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(order.createdAt), {
                                  addSuffix: true,
                                  locale: tr,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right pl-10 sm:pl-0">
                          <p className="text-xl sm:text-2xl font-bold text-foreground">
                            ₺{order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-accent rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-foreground mb-3">Ürünler</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {item.quantity}x
                                </span>
                                <span className="text-foreground/80">{item.name}</span>
                              </div>
                              <span className="font-medium text-foreground">
                                ₺{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Note */}
                      {order.customerNote && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-primary">
                                Müşteri Notu
                              </p>
                              <p className="text-sm text-primary mt-1">
                                {order.customerNote}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {config.nextStatus && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(order.id, config.nextStatus!)}
                            className="flex-1"
                            disabled={updateOrderMutation.isPending}
                          >
                            {config.nextLabel}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
