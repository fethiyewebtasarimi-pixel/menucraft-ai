"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Star, MapPin, Phone, Mail, ChevronUp, Loader2, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuItemCard from "@/components/menu/MenuItemCard";
import ItemDetailModal from "@/components/menu/ItemDetailModal";
import Cart from "@/components/menu/Cart";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useCartStore } from "@/stores/cartStore";

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
  categoryId?: string;
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

interface Category {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  workingHours?: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  branding?: {
    primaryColor?: string;
    accentColor?: string;
    headerStyle?: "MODERN" | "CLASSIC" | "MINIMAL" | "HERO";
    menuLayout?: "GRID" | "LIST";
  };
  subscription?: {
    plan: string;
  };
}

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

export default function MenuPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [showAllergenFilter, setShowAllergenFilter] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  // Zustand cart store
  const cartStore = useCartStore();

  // Convert cart store items to the format Cart component expects
  const cartItems: CartItem[] = cartStore.items.map((item) => ({
    id: item.menuItemId,
    name: item.name,
    price: item.price + (item.modifiers?.reduce((s, m) => s + m.price, 0) || 0),
    quantity: item.quantity,
    image: item.image,
    modifiers: item.modifiers?.map((m) => m.name),
    notes: item.notes,
  }));

  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    fetchMenuData();
    cartStore.setRestaurantSlug(params.restaurantSlug);
  }, [params.restaurantSlug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/menu/${params.restaurantSlug}`
      );
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToCategory = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    if (categoryId && categoryRefs.current[categoryId]) {
      const element = categoryRefs.current[categoryId];
      const offset = 120; // Account for sticky header
      const elementPosition = element?.getBoundingClientRect().top || 0;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    options?: {
      quantity: number;
      variant?: string;
      modifiers?: string[];
      notes?: string;
    }
  ) => {
    // Build modifier objects from selected modifier names
    const modifierObjects = options?.modifiers?.map((name) => {
      const mod = item.modifiers?.find((m) => m.name === name);
      return { id: mod?.id || name, name, price: mod?.price || 0 };
    });

    cartStore.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.discountPrice || item.price,
      quantity: options?.quantity || 1,
      image: item.image,
      notes: options?.notes,
      modifiers: modifierObjects,
    });

    toast.success(`${item.name} sepete eklendi`);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    cartStore.updateQuantity(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    cartStore.removeItem(itemId);
  };

  const handleClearCart = () => {
    cartStore.clearCart();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);

    try {
      const response = await fetch(
        `/api/public/menu/${params.restaurantSlug}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: reviewForm.name,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast.success("Yorumunuz gönderildi! Onaylandıktan sonra görünür olacaktır.");
      setReviewForm({ name: "", rating: 5, comment: "" });
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error("Yorum gönderilirken bir hata oluştu. Tekrar deneyin.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const toggleAllergenFilter = (allergen: string) => {
    setExcludedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Collect all allergens from menu for filter UI
  const allAllergens = Array.from(
    new Set(
      categories.flatMap((cat) =>
        cat.items.flatMap((item) => item.allergens || [])
      )
    )
  );

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const passesAllergenFilter =
          excludedAllergens.length === 0 ||
          !item.allergens?.some((a) => excludedAllergens.includes(a));

        return matchesSearch && passesAllergenFilter;
      }),
    }))
    .filter((category) => category.items.length > 0);

  const allItems = filteredCategories.flatMap((cat) => cat.items);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Menü yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restoran Bulunamadı
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bu restoran mevcut değil veya menüsü henüz yayınlanmamış.
          </p>
        </div>
      </div>
    );
  }

  const accentColor = restaurant.branding?.accentColor || "#f59e0b";
  const menuLayout = restaurant.branding?.menuLayout || "GRID";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <MenuHeader restaurant={restaurant} branding={restaurant.branding} />

      {/* Search Bar & Allergen Filter */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Menüde ara..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": accentColor } as any}
              />
            </div>
            {allAllergens.length > 0 && (
              <button
                onClick={() => setShowAllergenFilter(!showAllergenFilter)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  excludedAllergens.length > 0
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Alerjen</span>
                {excludedAllergens.length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {excludedAllergens.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Allergen Filter Panel */}
          {showAllergenFilter && allAllergens.length > 0 && (
            <div className="max-w-2xl mx-auto mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                  Alerjen Filtresi
                </h3>
                {excludedAllergens.length > 0 && (
                  <button
                    onClick={() => setExcludedAllergens([])}
                    className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">
                Alerjenli ürünleri gizlemek için seçin:
              </p>
              <div className="flex flex-wrap gap-2">
                {allAllergens.map((allergen) => {
                  const isActive = excludedAllergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergenFilter(allergen)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? "bg-yellow-500 text-white shadow-sm"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-yellow-400"
                      }`}
                    >
                      {isActive && <X className="w-3 h-3" />}
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
        }))}
        activeCategory={activeCategory}
        onSelect={scrollToCategory}
        accentColor={accentColor}
      />

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {searchQuery ? (
          // Search Results
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Arama Sonuçları ({allItems.length})
            </h2>
            <div
              className={
                menuLayout === "GRID"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {allItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currency="₺"
                  layout={menuLayout}
                  accentColor={accentColor}
                  onAddToCart={() => setSelectedItem(item)}
                  onViewDetail={() => setSelectedItem(item)}
                />
              ))}
            </div>
            {allItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Aradığınız kriterlere uygun ürün bulunamadı.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Categories
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <motion.section
                key={category.id}
                ref={(el) => {
                  categoryRefs.current[category.id] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                id={`category-${category.id}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  {category.icon && (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent" />
                </div>
                <div
                  className={
                    menuLayout === "GRID"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {category.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MenuItemCard
                        item={item}
                        currency="₺"
                        layout={menuLayout}
                        accentColor={accentColor}
                        onAddToCart={() => setSelectedItem(item)}
                        onViewDetail={() => setSelectedItem(item)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Info Section */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                İletişim Bilgileri
              </h3>
              <div className="space-y-3">
                {restaurant.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {restaurant.address}
                    </span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${restaurant.email}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {restaurant.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Yorum Bırakın
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    placeholder="Adınız"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": accentColor } as any}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Puan
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= reviewForm.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="Yorumunuz..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": accentColor } as any}
                    rows={4}
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {reviewSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Gönder"
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          {restaurant.subscription?.plan === "FREE" && (
            <p className="text-sm text-gray-400">
              Powered by{" "}
              <span className="font-bold" style={{ color: accentColor }}>
                MenuCraft AI
              </span>
            </p>
          )}
        </div>
      </footer>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        currency="₺"
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
        accentColor={accentColor}
      />

      {/* Cart */}
      <Cart
        items={cartItems}
        currency="₺"
        accentColor={accentColor}
        restaurantSlug={params.restaurantSlug}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 left-6 z-40 p-3 rounded-full shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
