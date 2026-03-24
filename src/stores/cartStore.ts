import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartModifier {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
  modifiers?: CartModifier[];
}

interface CartState {
  items: CartItem[];
  restaurantSlug: string | null;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setRestaurantSlug: (slug: string | null) => void;
}

interface CartStore extends CartState, CartActions {
  totalItems: number;
  totalPrice: number;
}

const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const modifiersPrice = item.modifiers
      ? item.modifiers.reduce((sum, mod) => sum + mod.price, 0)
      : 0;
    return total + (item.price + modifiersPrice) * item.quantity;
  }, 0);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      restaurantSlug: null,
      totalItems: 0,
      totalPrice: 0,

      // Actions
      addItem: (item) => {
        const { items, restaurantSlug } = get();

        // Check if item exists (considering modifiers)
        const existingItemIndex = items.findIndex((i) => {
          const sameId = i.menuItemId === item.menuItemId;
          const sameModifiers =
            JSON.stringify(i.modifiers?.sort((a, b) => a.id.localeCompare(b.id))) ===
            JSON.stringify(item.modifiers?.sort((a, b) => a.id.localeCompare(b.id)));
          const sameNotes = i.notes === item.notes;
          return sameId && sameModifiers && sameNotes;
        });

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          newItems = items.map((i, index) =>
            index === existingItemIndex
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          );
        } else {
          // Add new item
          newItems = [...items, { ...item, quantity: item.quantity || 1 }];
        }

        set({
          items: newItems,
          totalItems: calculateTotalItems(newItems),
          totalPrice: calculateTotalPrice(newItems),
        });
      },

      removeItem: (menuItemId) => {
        const { items } = get();
        const newItems = items.filter((item) => item.menuItemId !== menuItemId);

        set({
          items: newItems,
          totalItems: calculateTotalItems(newItems),
          totalPrice: calculateTotalPrice(newItems),
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(menuItemId);
          return;
        }

        const newItems = items.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        );

        set({
          items: newItems,
          totalItems: calculateTotalItems(newItems),
          totalPrice: calculateTotalPrice(newItems),
        });
      },

      clearCart: () => {
        set({
          items: [],
          restaurantSlug: null,
          totalItems: 0,
          totalPrice: 0,
        });
      },

      setRestaurantSlug: (slug) => {
        const { restaurantSlug, clearCart } = get();

        // If switching to a different restaurant, clear the cart
        if (restaurantSlug && slug !== restaurantSlug) {
          clearCart();
        }

        set({ restaurantSlug: slug });
      },
    }),
    {
      name: 'menucraft-cart-storage',
      partialize: (state) => ({
        items: state.items,
        restaurantSlug: state.restaurantSlug,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate computed values after rehydration
        if (state) {
          state.totalItems = calculateTotalItems(state.items);
          state.totalPrice = calculateTotalPrice(state.items);
        }
      },
    }
  )
);
