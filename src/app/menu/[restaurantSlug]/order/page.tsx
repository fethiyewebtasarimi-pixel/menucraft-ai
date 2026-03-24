"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";

type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

interface CartItemDisplay {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  modifiers?: string[];
}

export default function OrderPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const router = useRouter();
  const cartStore = useCartStore();
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = "₺";
  const accentColor = "#f59e0b";
  const TAX_RATE = 0.1; // 10% KDV

  // Map Zustand store items to display format
  const cartItems: CartItemDisplay[] = cartStore.items.map((item) => ({
    id: item.menuItemId,
    name: item.name,
    price: item.price + (item.modifiers?.reduce((s, m) => s + m.price, 0) || 0),
    quantity: item.quantity,
    modifiers: item.modifiers?.map((m) => m.name),
  }));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        type: orderType,
        tableId: undefined as string | undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        customerNote: notes || undefined,
        items: cartStore.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
          modifiers: item.modifiers?.map((m) => ({ name: m.name, price: m.price })),
        })),
      };

      const response = await fetch(
        `/api/public/menu/${params.restaurantSlug}/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sipariş oluşturulamadı");
      }

      const order = await response.json();

      // Clear cart after successful order
      cartStore.clearCart();

      // Redirect to success page
      router.push(
        `/menu/${params.restaurantSlug}/order/success?orderNumber=${order.orderNumber}`
      );
    } catch (error) {
      console.error("Failed to submit order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Sipariş gönderilirken bir hata oluştu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderTypes = [
    {
      type: "DINE_IN" as OrderType,
      icon: UtensilsCrossed,
      label: "Masada Yeme",
      description: "Restorantta yiyeceğim",
    },
    {
      type: "TAKEAWAY" as OrderType,
      icon: ShoppingBag,
      label: "Paket Servis",
      description: "Alıp gideceğim",
    },
    {
      type: "DELIVERY" as OrderType,
      icon: Truck,
      label: "Teslimat",
      description: "Adresime gönder",
    },
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sepetiniz Boş
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sipariş vermek için önce sepete ürün eklemelisiniz.
          </p>
          <button
            onClick={() => router.push(`/menu/${params.restaurantSlug}`)}
            className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: accentColor }}
          >
            Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Siparişi Tamamla
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Order Type Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Sipariş Tipi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {orderTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = orderType === type.type;
                    return (
                      <motion.button
                        key={type.type}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setOrderType(type.type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: accentColor,
                                backgroundColor: `${accentColor}10`,
                              }
                            : {}
                        }
                      >
                        <Icon
                          className="w-8 h-8 mx-auto mb-2"
                          style={isSelected ? { color: accentColor } : {}}
                        />
                        <div className="text-sm font-semibold">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Table Number (Dine-in only) */}
              {orderType === "DINE_IN" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Masa Numarası
                  </h2>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Örn: 12"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": accentColor } as any}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  İletişim Bilgileri
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": accentColor } as any}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Telefon Numaranız"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": accentColor } as any}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="E-posta Adresiniz (Opsiyonel)"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": accentColor } as any}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address (Delivery only) */}
              {orderType === "DELIVERY" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Teslimat Adresi
                  </h2>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Tam adresinizi yazın..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": accentColor } as any}
                    rows={4}
                    required
                  />
                </motion.div>
              )}

              {/* Special Notes */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Özel Notlar
                </h2>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": accentColor } as any}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Sipariş Özeti
                </h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </div>
                        {item.variant && (
                          <div className="text-xs text-gray-500">
                            {item.variant}
                          </div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{item.modifiers.join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Ara Toplam
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      KDV (%10)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      Toplam
                    </span>
                    <span style={{ color: accentColor }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <span>Siparişi Onayla</span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
