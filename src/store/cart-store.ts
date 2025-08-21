import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, unknown>;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      totalItems: 0,

      addItem: item => {
        const state = get();
        const existingItemIndex = state.items.findIndex(i => i.id === item.id);

        if (existingItemIndex >= 0) {
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += item.quantity || 1;
          set({
            items: updatedItems,
            totalPrice: updatedItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0,
            ),
            totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          });
        } else {
          const newItems = [
            ...state.items,
            { ...item, quantity: item.quantity || 1 },
          ];
          set({
            items: newItems,
            totalPrice: newItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0,
            ),
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0),
          });
        }
      },

      removeItem: id => {
        const state = get();
        const updatedItems = state.items.filter(item => item.id !== id);
        set({
          items: updatedItems,
          totalPrice: updatedItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0,
          ),
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });
      },

      updateQuantity: (id, quantity) => {
        const state = get();
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = state.items.map(item =>
          item.id === id ? { ...item, quantity } : item,
        );
        set({
          items: updatedItems,
          totalPrice: updatedItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0,
          ),
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });
      },

      clearCart: () => {
        set({ items: [], totalPrice: 0, totalItems: 0 });
      },

      getItemQuantity: id => {
        const item = get().items.find(i => i.id === id);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
