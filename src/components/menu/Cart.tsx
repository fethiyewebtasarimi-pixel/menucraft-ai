"use client";

import React from "react";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  modifiers?: string[];
  notes?: string;
}

interface CartProps {
  items: CartItem[];
  currency?: string;
  accentColor?: string;
  restaurantSlug: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  currency = "₺",
  accentColor = "#f59e0b",
  restaurantSlug,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push(`/menu/${restaurantSlug}/order`);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl text-white"
            style={{ backgroundColor: accentColor }}
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {totalItems}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div
                className="p-6 text-white flex items-center justify-between"
                style={{ backgroundColor: accentColor }}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    Sepetim ({totalItems} ürün)
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/70">
                    <ShoppingCart className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">Sepetiniz boş</p>
                    <p className="text-sm">Menüden ürün ekleyin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="bg-accent dark:bg-gray-800 rounded-xl p-4"
                      >
                        <div className="flex gap-3">
                          {/* Item Image/Icon */}
                          <div className="w-16 h-16 rounded-lg bg-muted dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              "🍽️"
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground dark:text-white line-clamp-1">
                              {item.name}
                            </h3>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                                {item.variant}
                              </p>
                            )}
                            {item.modifiers && item.modifiers.length > 0 && (
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                                +{item.modifiers.join(", ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 italic line-clamp-1">
                                "{item.notes}"
                              </p>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                  className="p-1 rounded bg-card dark:bg-gray-700 hover:bg-muted/50 dark:hover:bg-gray-600 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold min-w-[2ch] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1 rounded bg-card dark:bg-gray-700 hover:bg-muted/50 dark:hover:bg-gray-600 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <span
                                className="font-bold"
                                style={{ color: accentColor }}
                              >
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 h-fit"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-border dark:border-gray-800 space-y-4">
                  {/* Clear Cart Button */}
                  <button
                    onClick={onClearCart}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    Sepeti Temizle
                  </button>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium text-foreground/80 dark:text-gray-300">
                      Ara Toplam
                    </span>
                    <span
                      className="font-bold text-xl"
                      style={{ color: accentColor }}
                    >
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    Siparişi Tamamla
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;
