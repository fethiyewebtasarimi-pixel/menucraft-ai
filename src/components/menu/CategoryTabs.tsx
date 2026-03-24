"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  accentColor?: string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect,
  accentColor = "#f59e0b",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
  };

  const allCategories = [{ id: "all", name: "Tümü" }, ...categories];

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-md"
          : "bg-white dark:bg-gray-900"
      } border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}

          {/* Category Tabs */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-8"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {allCategories.map((category) => {
              const isActive =
                (category.id === "all" && !activeCategory) ||
                category.id === activeCategory;

              return (
                <motion.button
                  key={category.id}
                  onClick={() =>
                    onSelect(category.id === "all" ? null : category.id)
                  }
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: accentColor,
                        }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{category.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
