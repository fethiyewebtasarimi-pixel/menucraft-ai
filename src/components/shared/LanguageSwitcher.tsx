"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

const LanguageSwitcher: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LANGUAGES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("menucraft_language");
    if (savedLanguage) {
      const language = LANGUAGES.find((lang) => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
    localStorage.setItem("menucraft_language", language.code);

    // TODO: Implement actual language change logic
    // This could involve:
    // - Setting locale in i18n library
    // - Updating global state
    // - Reloading page with new locale
    console.log("Language changed to:", language.code);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-card dark:bg-card shadow-md hover:shadow-lg transition-all border border-border dark:border-border flex items-center gap-2"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-foreground/80 dark:text-foreground/80" />
        <span className="text-lg">{currentLanguage.flag}</span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-card dark:bg-card rounded-xl shadow-xl border border-border dark:border-border overflow-hidden z-50"
          >
            <div className="py-2">
              {LANGUAGES.map((language) => {
                const isSelected = language.code === currentLanguage.code;
                return (
                  <motion.button
                    key={language.code}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full px-4 py-2 flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/20"
                        : "hover:bg-accent dark:hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{language.flag}</span>
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-primary dark:text-primary"
                            : "text-foreground/80 dark:text-foreground/80"
                        }`}
                      >
                        {language.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary dark:text-primary" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
