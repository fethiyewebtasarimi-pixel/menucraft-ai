"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Leaf,
  Flame,
  WheatOff,
  Star,
  Sparkles,
  ChefHat,
  Clock,
  Zap,
  AlertTriangle,
  Minus,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  tags?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  ingredients?: string[];
  nutritionVerified?: boolean;
  prepTime?: number;
  allergens?: string[];
  variants?: {
    id: string;
    name: string;
    price: number;
  }[];
  modifiers?: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface ItemDetailModalProps {
  item: MenuItem | null;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItem, options: {
    quantity: number;
    variant?: string;
    modifiers?: string[];
    notes?: string;
  }) => void;
  accentColor?: string;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  currency = "₺",
  isOpen,
  onClose,
  onAddToCart,
  accentColor = "#f59e0b",
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setSelectedVariant(item.variants?.[0]?.id);
      setSelectedModifiers([]);
      setNotes("");
      setImageLoaded(false);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!item) return null;

  const tagConfig: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    VEGAN: { icon: Leaf, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Vegan" },
    SPICY: { icon: Flame, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Acılı" },
    GLUTEN_FREE: {
      icon: WheatOff,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      label: "Glutensiz",
    },
    POPULAR: {
      icon: Star,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      label: "Popüler",
    },
    NEW: { icon: Sparkles, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", label: "Yeni" },
    CHEF_RECOMMENDED: {
      icon: ChefHat,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      label: "Şef Önerisi",
    },
  };

  const allergenIcons: Record<string, string> = {
    GLUTEN: "🌾",
    DAIRY: "🥛",
    EGGS: "🥚",
    NUTS: "🥜",
    SOY: "🫘",
    SHELLFISH: "🦐",
    FISH: "🐟",
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const calculateTotal = () => {
    let total = item.discountPrice || item.price;

    if (selectedVariant && item.variants) {
      const variant = item.variants.find((v) => v.id === selectedVariant);
      if (variant) {
        total = variant.price;
      }
    }

    if (selectedModifiers.length > 0 && item.modifiers) {
      selectedModifiers.forEach((modId) => {
        const modifier = item.modifiers?.find((m) => m.id === modId);
        if (modifier) {
          total += modifier.price;
        }
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart?.(item, {
      quantity,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      notes,
    });
    onClose();
  };

  const toggleModifier = (modifierId: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(modifierId)
        ? prev.filter((id) => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Image */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800">
                {item.image ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
                    )}
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      priority
                    />
                  </>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-8xl"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)`,
                    }}
                  >
                    🍽️
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.name}
                </h2>

                {/* Description */}
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => {
                      const config = tagConfig[tag];
                      if (!config) return null;
                      const Icon = config.icon;
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick Info Bar */}
                {(item.calories || item.prepTime) && (
                  <div className="flex gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {item.calories ? (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {item.calories} kcal
                        </span>
                      </div>
                    ) : null}
                    {item.protein ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600">P: {item.protein}g</span>
                      </div>
                    ) : null}
                    {item.carbs ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-600">K: {item.carbs}g</span>
                      </div>
                    ) : null}
                    {item.fat ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-yellow-600">Y: {item.fat}g</span>
                      </div>
                    ) : null}
                    {item.prepTime ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {item.prepTime} dk
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Detailed Nutrition Facts */}
                {(item.calories || item.protein || item.carbs || item.fat) && (
                  <div className="mb-4 border rounded-lg overflow-hidden">
                    <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-2">
                      <h4 className="font-bold text-sm">Besin Değerleri</h4>
                      {item.servingSize && (
                        <p className="text-xs text-gray-300">{item.servingSize}</p>
                      )}
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      {item.calories ? (
                        <div className="flex justify-between px-4 py-2 font-bold bg-gray-50 dark:bg-gray-800/50">
                          <span>Kalori</span>
                          <span>{item.calories} kcal</span>
                        </div>
                      ) : null}
                      {item.protein !== undefined && item.protein !== null ? (
                        <div className="flex justify-between px-4 py-1.5">
                          <span className="text-gray-600 dark:text-gray-400">Protein</span>
                          <span className="font-medium">{item.protein}g</span>
                        </div>
                      ) : null}
                      {item.carbs !== undefined && item.carbs !== null ? (
                        <div className="flex justify-between px-4 py-1.5">
                          <span className="text-gray-600 dark:text-gray-400">Karbonhidrat</span>
                          <span className="font-medium">{item.carbs}g</span>
                        </div>
                      ) : null}
                      {item.sugar !== undefined && item.sugar !== null ? (
                        <div className="flex justify-between px-4 py-1.5 pl-8">
                          <span className="text-gray-500 dark:text-gray-500 text-xs">Şeker</span>
                          <span className="text-xs">{item.sugar}g</span>
                        </div>
                      ) : null}
                      {item.fat !== undefined && item.fat !== null ? (
                        <div className="flex justify-between px-4 py-1.5">
                          <span className="text-gray-600 dark:text-gray-400">Yağ</span>
                          <span className="font-medium">{item.fat}g</span>
                        </div>
                      ) : null}
                      {item.fiber !== undefined && item.fiber !== null ? (
                        <div className="flex justify-between px-4 py-1.5">
                          <span className="text-gray-600 dark:text-gray-400">Lif</span>
                          <span className="font-medium">{item.fiber}g</span>
                        </div>
                      ) : null}
                      {item.sodium !== undefined && item.sodium !== null ? (
                        <div className="flex justify-between px-4 py-1.5">
                          <span className="text-gray-600 dark:text-gray-400">Sodyum</span>
                          <span className="font-medium">{item.sodium}mg</span>
                        </div>
                      ) : null}
                    </div>
                    {item.nutritionVerified && (
                      <div className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-400">
                        ✓ Onaylanmış besin değerleri
                      </div>
                    )}
                  </div>
                )}

                {/* Ingredients */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-semibold mb-1">İçindekiler</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.ingredients.join(", ")}
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                          Alerjenler
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="inline-flex items-center gap-1 text-sm"
                            >
                              <span>{allergenIcons[allergen] || "⚠️"}</span>
                              <span className="text-yellow-800 dark:text-yellow-400">
                                {allergen}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants */}
                {item.variants && item.variants.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Boyut Seçin</h3>
                    <div className="flex flex-col gap-2">
                      {item.variants.map((variant) => (
                        <label
                          key={variant.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedVariant === variant.id
                              ? "border-current shadow-md"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          style={
                            selectedVariant === variant.id
                              ? { borderColor: accentColor }
                              : {}
                          }
                        >
                          <input
                            type="radio"
                            name="variant"
                            value={variant.id}
                            checked={selectedVariant === variant.id}
                            onChange={() => setSelectedVariant(variant.id)}
                            className="sr-only"
                          />
                          <span className="font-medium">{variant.name}</span>
                          <span
                            className="font-bold"
                            style={
                              selectedVariant === variant.id
                                ? { color: accentColor }
                                : {}
                            }
                          >
                            {formatPrice(variant.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modifiers */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Ekstralar</h3>
                    <div className="flex flex-col gap-2">
                      {item.modifiers.map((modifier) => (
                        <label
                          key={modifier.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedModifiers.includes(modifier.id)
                              ? "border-current shadow-md"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          style={
                            selectedModifiers.includes(modifier.id)
                              ? { borderColor: accentColor }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedModifiers.includes(modifier.id)}
                              onChange={() => toggleModifier(modifier.id)}
                              className="w-5 h-5 rounded"
                              style={
                                selectedModifiers.includes(modifier.id)
                                  ? { accentColor }
                                  : {}
                              }
                            />
                            <span className="font-medium">{modifier.name}</span>
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            +{formatPrice(modifier.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Notes */}
                <div className="mb-4">
                  <label className="block font-semibold text-lg mb-2">
                    Özel Notlar
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": accentColor } as any}
                    rows={3}
                  />
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <label className="block font-semibold text-lg mb-2">
                    Adet
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold min-w-[3ch] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl"
                style={{ backgroundColor: accentColor }}
              >
                Sepete Ekle · {formatPrice(calculateTotal())}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailModal;
