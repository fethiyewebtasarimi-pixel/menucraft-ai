"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Leaf,
  Flame,
  WheatOff,
  Star,
  Sparkles,
  ChefHat,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  tags?: string[];
  calories?: number;
  prepTime?: number;
}

interface MenuItemCardProps {
  item: MenuItem;
  currency?: string;
  layout?: "GRID" | "LIST";
  accentColor?: string;
  onAddToCart?: (item: MenuItem) => void;
  onViewDetail?: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency = "₺",
  layout = "GRID",
  accentColor = "#f59e0b",
  onAddToCart,
  onViewDetail,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const tagConfig: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    VEGAN: { icon: Leaf, color: "bg-green-100 text-green-700", label: "Vegan" },
    SPICY: { icon: Flame, color: "bg-red-100 text-red-700", label: "Acılı" },
    GLUTEN_FREE: {
      icon: WheatOff,
      color: "bg-blue-100 text-blue-700",
      label: "Glutensiz",
    },
    POPULAR: {
      icon: Star,
      color: "bg-amber-100 text-amber-700",
      label: "Popüler",
    },
    NEW: { icon: Sparkles, color: "bg-purple-100 text-purple-700", label: "Yeni" },
    CHEF_RECOMMENDED: {
      icon: ChefHat,
      color: "bg-yellow-100 text-yellow-700",
      label: "Şef Önerisi",
    },
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(item);
  };

  const foodEmojis = ["🍕", "🍔", "🍜", "🍱", "🍛", "🥗", "🍰", "🍪"];
  const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

  if (layout === "LIST") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onViewDetail?.(item)}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            {item.image && !imageError ? (
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
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {randomEmoji}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {item.name}
              </h3>
              {onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="flex-shrink-0 p-1.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: accentColor }}
                  aria-label="Add to cart"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.slice(0, 2).map((tag) => {
                  const config = tagConfig[tag];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {item.discountPrice ? (
                <>
                  <span
                    className="font-bold text-lg"
                    style={{ color: accentColor }}
                  >
                    {formatPrice(item.discountPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.price)}
                  </span>
                </>
              ) : (
                <span
                  className="font-bold text-lg"
                  style={{ color: accentColor }}
                >
                  {formatPrice(item.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // GRID Layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={() => onViewDetail?.(item)}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-800 group"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {item.image && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}
            <Image
              src={item.image}
              alt={item.name}
              fill
              className={`object-cover transition-all duration-500 ${
                imageLoaded ? "opacity-100 group-hover:scale-110" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {randomEmoji}
          </div>
        )}

        {/* Discount Badge */}
        {item.discountPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            {Math.round(
              ((item.price - item.discountPrice) / item.price) * 100
            )}
            % İndirim
          </div>
        )}

        {/* Tags Badges */}
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.tags.slice(0, 1).map((tag) => {
              const config = tagConfig[tag];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shadow-lg ${config.color}`}
                >
                  <Icon className="w-3 h-3" />
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 h-10">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => {
              const config = tagConfig[tag];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {item.discountPrice ? (
              <>
                <span
                  className="font-bold text-xl"
                  style={{ color: accentColor }}
                >
                  {formatPrice(item.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(item.price)}
                </span>
              </>
            ) : (
              <span
                className="font-bold text-xl"
                style={{ color: accentColor }}
              >
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          {onAddToCart && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="p-3 rounded-full text-white shadow-lg transition-all hover:shadow-xl"
              style={{ backgroundColor: accentColor }}
              aria-label="Sepete Ekle"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
