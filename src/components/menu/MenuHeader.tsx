"use client";

import React from "react";
import Image from "next/image";
import { Star, Clock, Facebook, Instagram, Twitter, Globe, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Restaurant {
  name: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
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
}

interface Branding {
  primaryColor?: string;
  accentColor?: string;
  headerStyle?: "MODERN" | "CLASSIC" | "MINIMAL" | "HERO";
}

interface MenuHeaderProps {
  restaurant: Restaurant;
  branding?: Branding;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurant, branding }) => {
  const headerStyle = branding?.headerStyle || "MODERN";
  const primaryColor = branding?.primaryColor || "#f59e0b";
  const accentColor = branding?.accentColor || "#d97706";

  const getCurrentStatus = () => {
    if (!restaurant.workingHours) return null;

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = restaurant.workingHours.find(
      (h) => h.day === currentDay
    );

    if (!todayHours || todayHours.isClosed) {
      return { isOpen: false, text: "Kapalı" };
    }

    const [openHour, openMin] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    const isOpen = currentTime >= openTime && currentTime < closeTime;

    if (isOpen) {
      return {
        isOpen: true,
        text: `Açık · ${todayHours.close} tarihine kadar`,
      };
    } else if (currentTime < openTime) {
      return {
        isOpen: false,
        text: `Kapalı · ${todayHours.open} tarihinde açılır`,
      };
    } else {
      const tomorrow = restaurant.workingHours[(restaurant.workingHours.findIndex(h => h.day === currentDay) + 1) % 7];
      return {
        isOpen: false,
        text: `Kapalı · Yarın ${tomorrow?.open || "09:00"} tarihinde açılır`,
      };
    }
  };

  const status = getCurrentStatus();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-primary text-primary"
            : "text-muted-foreground/70"
        }`}
      />
    ));
  };

  const socialLinks = [
    {
      icon: Facebook,
      url: restaurant.socialMedia?.facebook,
      label: "Facebook",
    },
    {
      icon: Instagram,
      url: restaurant.socialMedia?.instagram,
      label: "Instagram",
    },
    { icon: Twitter, url: restaurant.socialMedia?.twitter, label: "Twitter" },
    { icon: Globe, url: restaurant.website, label: "Web Sitesi" },
  ].filter((link) => link.url);

  if (headerStyle === "MINIMAL") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card dark:bg-gray-900 border-b border-border dark:border-gray-800 py-6"
      >
        <div className="container mx-auto px-4 flex items-center gap-4">
          {restaurant.logo && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border dark:border-gray-700 flex-shrink-0">
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              {restaurant.name}
            </h1>
            {restaurant.rating && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">{renderStars(restaurant.rating)}</div>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  {restaurant.rating.toFixed(1)}{" "}
                  {restaurant.reviewCount && `(${restaurant.reviewCount})`}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (headerStyle === "CLASSIC") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card dark:bg-gray-900 border-b border-border dark:border-gray-800"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {restaurant.logo && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg flex-shrink-0">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: primaryColor }}
              >
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="text-muted-foreground dark:text-gray-400 mb-3">
                  {restaurant.description}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                {restaurant.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{renderStars(restaurant.rating)}</div>
                    <span className="text-sm font-medium">
                      {restaurant.rating.toFixed(1)}{" "}
                      {restaurant.reviewCount && `(${restaurant.reviewCount})`}
                    </span>
                  </div>
                )}
                {status && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span
                      className={`text-sm font-medium ${
                        status.isOpen ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {status.text}
                    </span>
                  </div>
                )}
              </div>
              {socialLinks.length > 0 && (
                <div className="flex gap-3 justify-center md:justify-start">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted/50 dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700 transition-colors"
                      aria-label={link.label}
                    >
                      <link.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (headerStyle === "HERO") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] md:h-[70vh] overflow-hidden"
      >
        {restaurant.coverImage ? (
          <>
            <div className="absolute inset-0">
              <Image
                src={restaurant.coverImage}
                alt={restaurant.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}40)`,
            }}
          />
        )}

        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          {restaurant.logo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-6"
            >
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </motion.div>
          )}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-center"
          >
            {restaurant.name}
          </motion.h1>
          {restaurant.description && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-center max-w-2xl mb-6"
            >
              {restaurant.description}
            </motion.p>
          )}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {restaurant.rating && (
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex gap-0.5">{renderStars(restaurant.rating)}</div>
                <span className="text-sm font-medium">
                  {restaurant.rating.toFixed(1)}{" "}
                  {restaurant.reviewCount && `(${restaurant.reviewCount})`}
                </span>
              </div>
            )}
            {status && (
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span
                  className={`text-sm font-medium ${
                    status.isOpen ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {status.text}
                </span>
              </div>
            )}
          </motion.div>
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3 mt-6"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // MODERN (default)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {restaurant.coverImage ? (
          <>
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          />
        )}
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20">
          <div className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              {restaurant.logo && (
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg flex-shrink-0 mx-auto md:mx-0">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="flex-1 text-center md:text-left">
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: primaryColor }}
                >
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-muted-foreground dark:text-gray-400 mb-4">
                    {restaurant.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  {restaurant.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {renderStars(restaurant.rating)}
                      </div>
                      <span className="text-sm font-medium">
                        {restaurant.rating.toFixed(1)}{" "}
                        {restaurant.reviewCount && `(${restaurant.reviewCount})`}
                      </span>
                    </div>
                  )}
                  {status && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span
                        className={`text-sm font-medium ${
                          status.isOpen
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>
                  )}
                  {restaurant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">
                        {restaurant.address}
                      </span>
                    </div>
                  )}
                </div>
                {socialLinks.length > 0 && (
                  <div className="flex gap-3 justify-center md:justify-start">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted/50 dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700 transition-colors"
                        aria-label={link.label}
                        style={{
                          color: primaryColor,
                        }}
                      >
                        <link.icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuHeader;
