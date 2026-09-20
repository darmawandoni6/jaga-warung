import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: () => number;
  totalPrice: () => number;
  getItemQuantity: (productId: number) => number;
  addItem: (product: Product, quantity?: number) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

    getItemQuantity: (productId: number) => {
      const item = get().items.find(i => i.product.id === productId);
      return item ? item.quantity : 0;
    },

    addItem: (product, quantity = 1) => {
      set(state => {
        const existing = state.items.find(i => i.product.id === product.id);
        if (existing) {
          existing.quantity += quantity;
          existing.subtotal = existing.quantity * product.sell_price;
        } else {
          state.items.push({
            product,
            quantity,
            subtotal: quantity * product.sell_price,
          });
        }
      });
    },

    decrementItem: productId => {
      set(state => {
        const item = state.items.find(i => i.product.id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          state.items = state.items.filter(i => i.product.id !== productId);
        } else {
          item.quantity -= 1;
          item.subtotal = item.quantity * item.product.sell_price;
        }
      });
    },

    removeItem: productId => {
      set(state => {
        state.items = state.items.filter(i => i.product.id !== productId);
      });
    },

    updateQuantity: (productId, quantity) => {
      set(state => {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.product.id !== productId);
          return;
        }
        const item = state.items.find(i => i.product.id === productId);
        if (!item) return;
        item.quantity = quantity;
        item.subtotal = quantity * item.product.sell_price;
      });
    },

    clearCart: () => {
      set(state => {
        state.items = [];
      });
    },
  })),
);
