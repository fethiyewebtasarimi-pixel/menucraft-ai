import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Locale = 'tr' | 'en';

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  theme: Theme;
  locale: Locale;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
}

interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      commandPaletteOpen: false,
      theme: 'light',
      locale: 'tr',

      // Actions
      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleCommandPalette: () => {
        set({ commandPaletteOpen: !get().commandPaletteOpen });
      },

      setCommandPaletteOpen: (open) => {
        set({ commandPaletteOpen: open });
      },

      setTheme: (theme) => {
        set({ theme });

        // Update document class for theme
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },

      setLocale: (locale) => {
        set({ locale });

        // Update document language
        if (typeof window !== 'undefined') {
          window.document.documentElement.lang = locale;
        }
      },
    }),
    {
      name: 'menucraft-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarOpen: state.sidebarOpen,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state && typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(state.theme);
          window.document.documentElement.lang = state.locale;
        }
      },
    }
  )
);
